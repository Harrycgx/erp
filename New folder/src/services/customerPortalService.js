import supabase from '../lib/supabase';
import { addCustomerQuotationNote, normalizeQuotationStatus, QUOTATION_STATUSES, requestQuotationRevision } from './quotationService';
import { approveQuotationAndCreateOrder } from './orderService';

export async function fetchCustomerPortalData(profileId) {
  if (!profileId) return { data: null, error: new Error('Missing authenticated profile.') };

  const customerResult = await supabase
    .from('customers')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (customerResult.error) return { data: null, error: customerResult.error };
  if (!customerResult.data) {
    return {
      data: {
        customer: null,
        quotations: [],
        orders: [],
        invoices: [],
        notes: [],
      },
      error: null,
    };
  }

  const customerId = customerResult.data.id;
  const [quotationsResult, ordersResult, invoicesResult, notesResult] = await Promise.all([
    supabase.from('quotations').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
    supabase.from('orders').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
    supabase.from('invoices').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
    supabase.from('customer_notes').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
  ]);

  const error = quotationsResult.error || ordersResult.error || invoicesResult.error || notesResult.error;
  if (error) return { data: null, error };

  return {
    data: {
      customer: customerResult.data,
      quotations: quotationsResult.data || [],
      orders: ordersResult.data || [],
      invoices: invoicesResult.data || [],
      notes: notesResult.data || [],
    },
    error: null,
  };
}

export async function fetchCustomerQuotationDetail(quotationId) {
  const [quoteResult, itemsResult, commentsResult, notesResult, activityResult] = await Promise.all([
    supabase.from('quotations').select('*').eq('id', quotationId).single(),
    supabase.from('quotation_items').select('*').eq('quotation_id', quotationId).order('created_at', { ascending: true }),
    supabase.from('quotation_comments').select('*').eq('quotation_id', quotationId).order('created_at', { ascending: true }),
    supabase.from('customer_notes').select('*').eq('quotation_id', quotationId).order('created_at', { ascending: false }),
    supabase.from('quotation_activity_logs').select('*').eq('quotation_id', quotationId).order('created_at', { ascending: true }),
  ]);

  const error = quoteResult.error || itemsResult.error || commentsResult.error || notesResult.error || activityResult.error;
  if (error) return { data: null, error };

  const comments = (commentsResult.data || []).map((comment) => ({
    ...comment,
    note_type: comment.comment_type,
    note: comment.comment,
  }));

  return {
    data: {
      ...quoteResult.data,
      items: itemsResult.data || [],
      notes: [...comments, ...(notesResult.data || [])],
      comments: commentsResult.data || [],
      activity_logs: activityResult.data || [],
    },
    error: null,
  };
}

export async function approveCustomerQuotation({ quotation, note, actorId }) {
  return approveQuotationAndCreateOrder({
    quotationId: quotation.id,
    customerNote: note,
    actorId,
  });
}

export async function rejectCustomerQuotation({ quotation, note, actorId }) {
  const status = normalizeQuotationStatus(quotation.status);
  if ([QUOTATION_STATUSES.CONVERTED, QUOTATION_STATUSES.CONVERTED_TO_ORDER, QUOTATION_STATUSES.EXPIRED].includes(status)) {
    return { data: null, error: new Error('This quotation can no longer be rejected.') };
  }

  const updateResult = await supabase
    .from('quotations')
    .update({
      status: QUOTATION_STATUSES.REJECTED,
      metadata: {
        ...(quotation.metadata || {}),
        rejected_at: new Date().toISOString(),
      },
    })
    .eq('id', quotation.id)
    .select('*')
    .single();

  if (updateResult.error) return updateResult;

  if (note.trim()) {
    const noteResult = await addCustomerQuotationNote({
      quotationId: quotation.id,
      customerId: quotation.customer_id,
      authorId: actorId,
      note: note.trim(),
      noteType: 'rejection',
    });
    if (noteResult.error) return { data: updateResult.data, error: noteResult.error };
  }

  await supabase.from('activity_logs').insert([
    {
      actor_id: actorId,
      customer_id: quotation.customer_id,
      quotation_id: quotation.id,
      activity_type: 'quotation_rejected',
      message: 'Quotation rejected by customer.',
    },
  ]);

  return updateResult;
}

export async function requestCustomerQuotationRevision({ quotation, note, actorId }) {
  const status = normalizeQuotationStatus(quotation.status);
  if ([QUOTATION_STATUSES.CONVERTED, QUOTATION_STATUSES.CONVERTED_TO_ORDER, QUOTATION_STATUSES.EXPIRED].includes(status)) {
    return { data: null, error: new Error('This quotation can no longer be revised.') };
  }

  const result = await requestQuotationRevision({ quotationId: quotation.id, note: note || 'Customer requested a revision.', actorId });
  return result;
}

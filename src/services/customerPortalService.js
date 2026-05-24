import supabase from '../lib/supabase';
import {
  addCustomerQuotationNote,
  fetchQuotationById,
  normalizeQuotationStatus,
  QUOTATION_STATUSES,
  requestQuotationRevision,
} from './quotationService';
import { approveQuotationWorkflow, rejectQuotationWorkflow } from './quotationApprovalService';
import { assertQuotationCustomerAccess, canCustomerActOnQuotation, isQuotationTerminal } from '../utils/workflowIntegrity';

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
        sales_orders: [],
        orders: [],
        invoices: [],
        notes: [],
      },
      error: null,
    };
  }

  const customerId = customerResult.data.id;
  const [quotationsResult, salesOrdersResult, ordersResult, invoicesResult, notesResult] = await Promise.all([
    supabase.from('quotations').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
    supabase.from('sales_orders').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
    supabase.from('orders').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
    supabase.from('invoices').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
    supabase.from('customer_notes').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
  ]);

  const error =
    quotationsResult.error ||
    salesOrdersResult.error ||
    ordersResult.error ||
    invoicesResult.error ||
    notesResult.error;
  if (error) return { data: null, error };

  return {
    data: {
      customer: customerResult.data,
      quotations: quotationsResult.data || [],
      sales_orders: salesOrdersResult.data || [],
      orders: ordersResult.data || [],
      invoices: invoicesResult.data || [],
      notes: notesResult.data || [],
    },
    error: null,
  };
}

export async function fetchCustomerQuotationDetail(quotationId, customerId = null) {
  const [quoteResult, itemsResult, commentsResult, notesResult, activityResult] = await Promise.all([
    supabase.from('quotations').select('*').eq('id', quotationId).single(),
    supabase.from('quotation_items').select('*').eq('quotation_id', quotationId).order('created_at', { ascending: true }),
    supabase.from('quotation_comments').select('*').eq('quotation_id', quotationId).order('created_at', { ascending: true }),
    supabase.from('customer_notes').select('*').eq('quotation_id', quotationId).order('created_at', { ascending: false }),
    supabase.from('quotation_activity_logs').select('*').eq('quotation_id', quotationId).order('created_at', { ascending: true }),
  ]);

  const error = quoteResult.error || itemsResult.error || commentsResult.error || notesResult.error || activityResult.error;
  if (error) return { data: null, error };

  if (customerId) {
    const access = assertQuotationCustomerAccess(quoteResult.data, customerId);
    if (!access.valid) return { data: null, error: new Error(access.message) };
  }

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

export async function approveCustomerQuotation({ quotation, note, actorId, customerId }) {
  const access = assertQuotationCustomerAccess(quotation, customerId || quotation.customer_id);
  if (!access.valid) return { data: null, error: new Error(access.message) };

  if (isQuotationTerminal(quotation.status)) {
    return { data: null, error: new Error('This quotation can no longer be approved.') };
  }

  if (!canCustomerActOnQuotation(quotation)) {
    return { data: null, error: new Error('This quotation is not available for approval.') };
  }

  return approveQuotationWorkflow({
    quotationId: quotation.id,
    note,
    actorId,
  });
}

export async function rejectCustomerQuotation({ quotation, note, actorId, customerId }) {
  const access = assertQuotationCustomerAccess(quotation, customerId || quotation.customer_id);
  if (!access.valid) return { data: null, error: new Error(access.message) };

  if (isQuotationTerminal(quotation.status)) {
    return { data: null, error: new Error('This quotation can no longer be rejected.') };
  }

  return rejectQuotationWorkflow({
    quotationId: quotation.id,
    note,
    actorId,
  });
}

export async function requestCustomerQuotationRevision({ quotation, note, actorId, customerId }) {
  const access = assertQuotationCustomerAccess(quotation, customerId || quotation.customer_id);
  if (!access.valid) return { data: null, error: new Error(access.message) };

  if (isQuotationTerminal(quotation.status)) {
    return { data: null, error: new Error('This quotation can no longer be revised.') };
  }

  return requestQuotationRevision({
    quotationId: quotation.id,
    note: note || 'Customer requested a revision.',
    actorId,
  });
}

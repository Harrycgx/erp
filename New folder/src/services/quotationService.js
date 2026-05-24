import supabase from '../lib/supabase';

export const QUOTATION_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  REVISION_REQUESTED: 'revision_requested',
  REVISED: 'revised',
  CONVERTED: 'converted',
  CONVERTED_TO_ORDER: 'converted_to_order',
};

function mapQuotationRow(quote = {}) {
  return {
    ...quote,
    quote_number: quote.quote_number || quote.quotation_number,
    quotation_number: quote.quotation_number || quote.quote_number,
  };
}

export function normalizeQuotationStatus(status) {
  const value = String(status || '').trim().toLowerCase().replace(/\s+/g, '_');
  if (value === 'converted_to_order' || value === 'converted to order') return QUOTATION_STATUSES.CONVERTED;
  if (value === QUOTATION_STATUSES.CONVERTED) return QUOTATION_STATUSES.CONVERTED;
  if (value === QUOTATION_STATUSES.REVISION_REQUESTED) return QUOTATION_STATUSES.REVISION_REQUESTED;
  if (value === QUOTATION_STATUSES.REVISED) return QUOTATION_STATUSES.REVISED;
  if (value === QUOTATION_STATUSES.APPROVED) return QUOTATION_STATUSES.APPROVED;
  if (value === QUOTATION_STATUSES.REJECTED) return QUOTATION_STATUSES.REJECTED;
  if (value === QUOTATION_STATUSES.EXPIRED) return QUOTATION_STATUSES.EXPIRED;
  if (value === QUOTATION_STATUSES.SENT) return QUOTATION_STATUSES.SENT;
  return QUOTATION_STATUSES.DRAFT;
}

export function calculateQuotationItem(item = {}) {
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.unit_price) || 0;
  const discountAmount = Number(item.discount_amount) || 0;
  const taxRate = Number(item.tax_rate) || 0;
  const subtotal = Math.max(quantity * unitPrice - discountAmount, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return {
    ...item,
    quantity,
    unit_price: unitPrice,
    discount_amount: discountAmount,
    tax_rate: taxRate,
    tax_amount: Number(taxAmount.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    total: Number(total.toFixed(2)),
    total_price: Number(total.toFixed(2)),
  };
}

export function calculateQuotationTotals(items = []) {
  const calculatedItems = items.map(calculateQuotationItem);
  const subtotal = calculatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = calculatedItems.reduce((sum, item) => sum + item.discount_amount, 0);
  const taxAmount = calculatedItems.reduce((sum, item) => sum + item.tax_amount, 0);
  const total = calculatedItems.reduce((sum, item) => sum + item.total, 0);

  return {
    items: calculatedItems,
    subtotal: Number(subtotal.toFixed(2)),
    discount_amount: Number(discountAmount.toFixed(2)),
    tax_amount: Number(taxAmount.toFixed(2)),
    gst_amount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
    total_amount: Number(total.toFixed(2)),
  };
}

export async function fetchQuotations() {
  const result = await supabase.from('quotations').select('*').order('created_at', { ascending: false });
  if (result.error) return result;
  return { data: result.data?.map(mapQuotationRow), error: null };
}

export async function fetchQuotationById(id) {
  const result = await supabase.from('quotations').select('*').eq('id', id).single();
  if (result.error) return result;
  return { data: mapQuotationRow(result.data), error: null };
}

export async function fetchQuotationWithItems(id) {
  const [quoteResult, itemsResult, commentsResult, notesResult, activityResult] = await Promise.all([
    supabase.from('quotations').select('*').eq('id', id).single(),
    supabase.from('quotation_items').select('*').eq('quotation_id', id).order('created_at', { ascending: true }),
    supabase.from('quotation_comments').select('*').eq('quotation_id', id).order('created_at', { ascending: true }),
    supabase.from('customer_notes').select('*').eq('quotation_id', id).order('created_at', { ascending: false }),
    supabase.from('quotation_activity_logs').select('*').eq('quotation_id', id).order('created_at', { ascending: true }),
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
      ...mapQuotationRow(quoteResult.data),
      items: itemsResult.data || [],
      notes: [...comments, ...(notesResult.data || [])],
      comments: commentsResult.data || [],
      activity_logs: activityResult.data || [],
    },
    error: null,
  };
}

export async function insertQuotation(quotation) {
  const payload = {
    ...quotation,
    status: normalizeQuotationStatus(quotation.status),
    quotation_number: quotation.quotation_number || quotation.quote_number,
    quote_number: quotation.quote_number || quotation.quotation_number,
  };

  const result = await supabase.from('quotations').insert([payload]).select('*').single();
  if (result.error) return result;
  return { data: mapQuotationRow(result.data), error: null };
}

export async function createQuotationWithItems(quotation, items = []) {
  const totals = calculateQuotationTotals(items);
  const payload = {
    ...quotation,
    status: normalizeQuotationStatus(quotation.status),
    quotation_number: quotation.quotation_number || quotation.quote_number,
    quote_number: quotation.quote_number || quotation.quotation_number,
    subtotal: totals.subtotal,
    discount_amount: totals.discount_amount,
    tax_amount: totals.tax_amount,
    gst: totals.gst_amount,
    gst_amount: totals.gst_amount,
    total: totals.total,
    total_amount: totals.total_amount,
  };

  const quoteResult = await supabase.from('quotations').insert([payload]).select('*').single();
  if (quoteResult.error) return quoteResult;

  if (!totals.items.length) return { data: mapQuotationRow(quoteResult.data), error: null };

  const itemRows = totals.items.map((item) => ({
    ...item,
    quotation_id: quoteResult.data.id,
  }));
  const itemsResult = await supabase.from('quotation_items').insert(itemRows).select('*');
  if (itemsResult.error) return { data: mapQuotationRow(quoteResult.data), error: itemsResult.error };

  return {
    data: {
      ...mapQuotationRow(quoteResult.data),
      items: itemsResult.data || [],
    },
    error: null,
  };
}

export async function updateQuotation(id, updates) {
  const payload = {
    ...updates,
    status: updates.status !== undefined ? normalizeQuotationStatus(updates.status) : undefined,
    quotation_number: updates.quotation_number || updates.quote_number,
    quote_number: updates.quote_number || updates.quotation_number,
  };
  const filteredPayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

  const result = await supabase.from('quotations').update(filteredPayload).eq('id', id).select('*').single();
  if (result.error) return result;
  return { data: mapQuotationRow(result.data), error: null };
}

export async function updateQuotationWithItems(id, updates, items = []) {
  const totals = calculateQuotationTotals(items);
  const payload = {
    ...updates,
    status: updates.status !== undefined ? normalizeQuotationStatus(updates.status) : undefined,
    quotation_number: updates.quotation_number || updates.quote_number,
    quote_number: updates.quote_number || updates.quotation_number,
    subtotal: totals.subtotal,
    discount_amount: totals.discount_amount,
    tax_amount: totals.tax_amount,
    gst: totals.gst_amount,
    gst_amount: totals.gst_amount,
    total: totals.total,
    total_amount: totals.total_amount,
  };

  const quoteResult = await supabase.from('quotations').update(payload).eq('id', id).select('*').single();
  if (quoteResult.error) return quoteResult;

  const deleteResult = await supabase.from('quotation_items').delete().eq('quotation_id', id);
  if (deleteResult.error) return { data: mapQuotationRow(quoteResult.data), error: deleteResult.error };

  if (!totals.items.length) return { data: mapQuotationRow(quoteResult.data), error: null };

  const itemRows = totals.items.map(({ id: _id, ...item }) => ({
    ...item,
    quotation_id: id,
  }));
  const itemsResult = await supabase.from('quotation_items').insert(itemRows).select('*');
  if (itemsResult.error) return { data: mapQuotationRow(quoteResult.data), error: itemsResult.error };

  return {
    data: {
      ...mapQuotationRow(quoteResult.data),
      items: itemsResult.data || [],
    },
    error: null,
  };
}

export async function deleteQuotation(id) {
  return supabase.from('quotations').delete().eq('id', id);
}

export async function addQuotationComment({ quotationId, customerId = null, authorId = null, comment, commentType = 'comment' }) {
  return supabase.from('quotation_comments').insert([
    {
      quotation_id: quotationId,
      customer_id: customerId,
      author_id: authorId,
      comment_type: commentType,
      comment,
    },
  ]);
}

export async function addCustomerQuotationNote({ quotationId, customerId, note, noteType = 'customer_comment', authorId = null }) {
  return supabase.from('customer_notes').insert([
    {
      quotation_id: quotationId,
      customer_id: customerId,
      author_id: authorId,
      note_type: noteType,
      note,
    },
  ]);
}

export async function logQuotationActivity(entry) {
  return supabase.from('quotation_activity_logs').insert([entry]);
}

export async function duplicateQuotation(originalQuotation) {
  const { id, created_at, updated_at, quote_number, quotation_number, ...quoteData } = originalQuotation;
  const items = (originalQuotation.items || []).map((item) => ({
    ...item,
    id: undefined,
    quotation_id: undefined,
  }));

  const draftQuote = {
    ...quoteData,
    status: QUOTATION_STATUSES.DRAFT,
    revision_number: Number(originalQuotation.revision_number || 0) + 1,
    parent_quotation_id: originalQuotation.id,
    quote_number: undefined,
    quotation_number: undefined,
  };

  return createQuotationWithItems(draftQuote, items);
}

export async function requestQuotationRevision({ quotationId, note = '', actorId = null }) {
  const { data: existingQuote, error: quoteError } = await fetchQuotationById(quotationId);
  if (quoteError) return { data: null, error: quoteError };

  const quoteResult = await supabase
    .from('quotations')
    .update({
      status: QUOTATION_STATUSES.REVISION_REQUESTED,
      metadata: {
        ...(existingQuote?.metadata || {}),
        revision_requested_at: new Date().toISOString(),
      },
    })
    .eq('id', quotationId)
    .select('*')
    .single();

  if (quoteResult.error) return quoteResult;

  await addQuotationComment({
    quotationId,
    authorId: actorId,
    comment: note || 'Revision requested.',
    commentType: 'revision_request',
  });

  await logQuotationActivity({
    quotation_id: quotationId,
    customer_id: existingQuote.customer_id,
    actor_id: actorId,
    activity_type: 'revision_requested',
    message: 'Revision requested for quotation.',
  });

  return { data: mapQuotationRow(quoteResult.data), error: null };
}

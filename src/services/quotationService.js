import supabase from '../lib/supabase';
import {
  buildQuotationFinancials,
  calculateQuotationItem,
  calculateQuotationTotals,
} from './quotationCalculationService';
import {
  fetchNextQuotationNumberPreview,
  persistQuotationCreate,
  persistQuotationUpdate,
  prepareQuotationRecord,
  prepareQuotationItemsForDb,
} from './quotationPersistence';

export { calculateQuotationItem, calculateQuotationTotals, buildQuotationFinancials };

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

/**
 * Client-side quotation number preview (DB trigger assigns authoritative number on insert).
 */
export function generateQuotationNumber(sequence = 1) {
  const year = new Date().getFullYear();
  const seq = Math.max(Number(sequence) || 1, 1);
  return `QTN-${year}-${String(seq).padStart(4, '0')}`;
}

export async function resolveQuotationNumberPreview() {
  const { data: nextSeq, error } = await fetchNextQuotationNumberPreview();
  if (error) {
    return generateQuotationNumber(1);
  }
  return generateQuotationNumber(nextSeq);
}

export function validateQuotationData({ quotation = {}, items = [] } = {}) {
  const errors = [];

  if (!quotation.customer_id) {
    errors.push('Customer is required.');
  }

  const activeItems = (items || []).filter((item) => String(item.item_name || '').trim());

  if (!activeItems.length) {
    errors.push('At least one line item with a name is required.');
  }

  activeItems.forEach((item, index) => {
    const label = `Line ${index + 1}`;

    if (!String(item.item_name || '').trim()) {
      errors.push(`${label}: item name is required.`);
    }

    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.push(`${label}: quantity must be greater than 0.`);
    }

    const unitPrice = Number(item.unit_price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      errors.push(`${label}: unit price cannot be negative.`);
    }

    const discount = Number(item.discount_amount) || 0;
    if (discount < 0) {
      errors.push(`${label}: discount cannot be negative.`);
    }

    const lineBase = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
    if (discount > lineBase) {
      errors.push(`${label}: discount cannot exceed line subtotal.`);
    }
  });

  const financials = buildQuotationFinancials(quotation, items);
  if (!Number.isFinite(financials.totals.total) || financials.totals.total < 0) {
    errors.push('Quotation total is invalid.');
  }

  return {
    valid: errors.length === 0,
    errors,
    message: errors[0] || '',
    financials,
  };
}

function filterPersistableItems(items = []) {
  return (items || []).filter((item) => String(item.item_name || '').trim());
}

/**
 * Create quotation — set persist:false to prepare payload without Supabase write.
 */
export async function createQuotation({ quotation = {}, items = [], persist = true, actorId = null } = {}) {
  const validation = validateQuotationData({ quotation, items });
  if (!validation.valid) {
    return { data: null, error: new Error(validation.message), errors: validation.errors };
  }

  const persistableItems = filterPersistableItems(validation.financials.items);
  const quotationNumber = quotation.quotation_number || (await resolveQuotationNumberPreview());
  const record = prepareQuotationRecord(
    {
      ...validation.financials.quotation,
      quotation_number: quotationNumber,
      quote_number: quotationNumber,
      created_by: actorId || quotation.created_by || null,
      dimensions:
        quotation.dimensions ||
        (quotation.length && quotation.width && quotation.height
          ? `${quotation.length}x${quotation.width}x${quotation.height}`
          : null),
    },
    validation.financials
  );

  if (!persist) {
    return {
      data: {
        ...record,
        items: prepareQuotationItemsForDb(persistableItems),
        _prepared: true,
      },
      error: null,
    };
  }

  return persistQuotationCreate(record, persistableItems);
}

/**
 * Update quotation — set persist:false to prepare payload without Supabase write.
 */
export async function updateQuotationRecord({
  id,
  quotation = {},
  items = [],
  persist = true,
} = {}) {
  if (!id && persist) {
    return { data: null, error: new Error('Quotation id is required for update.') };
  }

  const validation = validateQuotationData({ quotation, items });
  if (!validation.valid) {
    return { data: null, error: new Error(validation.message), errors: validation.errors };
  }

  const persistableItems = filterPersistableItems(validation.financials.items);
  const record = prepareQuotationRecord(
    {
      ...validation.financials.quotation,
      dimensions:
        quotation.dimensions ||
        (quotation.length && quotation.width && quotation.height
          ? `${quotation.length}x${quotation.width}x${quotation.height}`
          : null),
    },
    validation.financials
  );

  if (!persist) {
    return {
      data: {
        id,
        ...record,
        items: prepareQuotationItemsForDb(persistableItems, id),
        _prepared: true,
      },
      error: null,
    };
  }

  return persistQuotationUpdate(id, record, persistableItems);
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
  return createQuotation({ quotation, items, persist: true, actorId: quotation.created_by });
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
  return updateQuotationRecord({ id, quotation: updates, items, persist: true });
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

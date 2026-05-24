import { approveQuotationAndCreateOrder } from './orderService';
import {
  fetchQuotationById,
  normalizeQuotationStatus,
  QUOTATION_STATUSES,
  requestQuotationRevision,
  addQuotationComment,
  logQuotationActivity,
  duplicateQuotation,
  updateQuotation,
} from './quotationService';

export async function approveQuotationWorkflow({ quotationId, note = '', actorId = null }) {
  return approveQuotationAndCreateOrder({ quotationId, customerNote: note, actorId });
}

export async function rejectQuotationWorkflow({ quotationId, note = '', actorId = null }) {
  const { data: quote, error: quoteError } = await fetchQuotationById(quotationId);
  if (quoteError) return { data: null, error: quoteError };

  const status = normalizeQuotationStatus(quote.status);
  if ([QUOTATION_STATUSES.CONVERTED, QUOTATION_STATUSES.CONVERTED_TO_ORDER, QUOTATION_STATUSES.EXPIRED].includes(status)) {
    return { data: null, error: new Error('This quotation can no longer be rejected.') };
  }

  const updateResult = await updateQuotation(quotationId, {
    status: QUOTATION_STATUSES.REJECTED,
    rejected_at: new Date().toISOString(),
  });
  if (updateResult.error) return updateResult;

  if (note.trim()) {
    const noteResult = await addQuotationComment({
      quotationId,
      authorId: actorId,
      comment: note.trim(),
      commentType: 'rejection',
    });
    if (noteResult.error) return { data: updateResult.data, error: noteResult.error };
  }

  await logQuotationActivity({
    quotation_id: quotationId,
    customer_id: quote.customer_id,
    actor_id: actorId,
    activity_type: 'quotation_rejected',
    message: 'Quotation rejected during approval workflow.',
  });

  return updateResult;
}

export async function requestRevisionWorkflow({ quotationId, note = '', actorId = null }) {
  const result = await requestQuotationRevision({ quotationId, note, actorId });
  if (result.error) return result;

  await logQuotationActivity({
    quotation_id: quotationId,
    customer_id: result.data.customer_id,
    actor_id: actorId,
    activity_type: 'quotation_revision_requested',
    message: 'Revision requested for quotation.',
  });

  return result;
}

export async function duplicateQuotationForRevision(originalQuotation, actorId = null) {
  const duplicateResult = await duplicateQuotation(originalQuotation);
  if (duplicateResult.error) return duplicateResult;

  await logQuotationActivity({
    quotation_id: originalQuotation.id,
    customer_id: originalQuotation.customer_id,
    actor_id: actorId,
    activity_type: 'quotation_revision_created',
    message: 'Revision copy created from quotation.',
    metadata: { revision_id: duplicateResult.data.id },
  });

  return duplicateResult;
}

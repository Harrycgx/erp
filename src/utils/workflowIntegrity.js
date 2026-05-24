/**
 * Cross-module workflow validation helpers (no Supabase writes).
 */

import { normalizeQuotationStatus, QUOTATION_STATUSES } from '../services/quotationService';

export const PIPELINE_STAGES = [
  'quotation',
  'sales_order',
  'inventory',
  'production',
  'invoice',
  'payment',
];

export function assertQuotationCustomerAccess(quotation, customerId) {
  if (!quotation?.id) {
    return { valid: false, message: 'Quotation not found.' };
  }
  if (!customerId) {
    return { valid: false, message: 'Customer context is required.' };
  }
  if (quotation.customer_id !== customerId) {
    return { valid: false, message: 'You do not have access to this quotation.' };
  }
  return { valid: true, message: '' };
}

export function canCustomerActOnQuotation(quotation) {
  const status = normalizeQuotationStatus(quotation?.status);
  return ['sent', 'approved', 'revision_requested', 'revised', 'draft'].includes(status);
}

export function isQuotationTerminal(status) {
  const normalized = normalizeQuotationStatus(status);
  return [
    QUOTATION_STATUSES.CONVERTED,
    QUOTATION_STATUSES.REJECTED,
    QUOTATION_STATUSES.EXPIRED,
  ].includes(normalized);
}

export function summarizeConversionResult(result) {
  if (!result?.data) return null;
  const data = result.data;
  return {
    quotationId: data.quotation?.id,
    salesOrderId: data.salesOrder?.id,
    salesOrderNumber: data.salesOrder?.sales_order_number,
    productionJobId: data.productionJob?.id,
    productionError: data.productionError?.message || null,
    reservations: data.reservations?.length ?? 0,
  };
}

import { DEFAULT_TAX_RATE } from '../services/quotationCalculationService';

export const QUOTATION_DRAFT_STATUS = 'draft';

export function createEmptyQuotationItem(overrides = {}) {
  return {
    item_name: '',
    description: '',
    quantity: 1,
    unit_price: '',
    discount_amount: '',
    tax_rate: DEFAULT_TAX_RATE,
    ...overrides,
  };
}

export function createEmptyQuotation(overrides = {}) {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  return {
    customer_id: '',
    inquiry_id: '',
    status: QUOTATION_DRAFT_STATUS,
    box_type: '',
    length: '',
    width: '',
    height: '',
    quantity: '',
    flute_type: '',
    ply: '',
    gsm: '',
    printing_type: 'None',
    lamination: 'None',
    tooling_cost: '',
    stitching: '',
    urgency: 'Standard',
    header_discount_percent: 0,
    header_discount_amount: 0,
    notes: '',
    valid_until: validUntil.toISOString().slice(0, 10),
    ...overrides,
  };
}

/**
 * Normalize API / draft shapes into builder-friendly values.
 */
export function normalizeQuotationDraft(quotation = {}) {
  return createEmptyQuotation({
    ...quotation,
    status: quotation.status || QUOTATION_DRAFT_STATUS,
    valid_until: quotation.valid_until || createEmptyQuotation().valid_until,
    tooling_cost: quotation.tooling_cost ?? '',
    header_discount_percent: quotation.metadata?.header_discount_percent ?? 0,
    header_discount_amount: quotation.metadata?.header_discount_amount ?? 0,
  });
}

export function normalizeQuotationItems(items = []) {
  if (!items?.length) {
    return [createEmptyQuotationItem()];
  }

  return items.map((item) =>
    createEmptyQuotationItem({
      ...item,
      quantity: item.quantity ?? 1,
      unit_price: item.unit_price ?? '',
      discount_amount: item.discount_amount ?? '',
      tax_rate: item.tax_rate ?? DEFAULT_TAX_RATE,
    })
  );
}

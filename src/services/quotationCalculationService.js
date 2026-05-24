/**
 * Centralized quotation financial calculations.
 * All line-item and header totals must flow through this module.
 */

export const DEFAULT_TAX_RATE = 0.18;

/**
 * Normalize tax rate input: accepts 0.18 or 18 (percent).
 */
export function normalizeTaxRate(rate, fallback = DEFAULT_TAX_RATE) {
  const value = rate === '' || rate === null || rate === undefined ? fallback : Number(rate);
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > 1) return Number((value / 100).toFixed(4));
  return value;
}

export function calculateQuotationItem(item = {}) {
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.unit_price) || 0;
  const discountAmount = Math.max(Number(item.discount_amount) || 0, 0);
  const taxRate = normalizeTaxRate(item.tax_rate, DEFAULT_TAX_RATE);
  const lineBase = quantity * unitPrice;
  const subtotal = Math.max(lineBase - discountAmount, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return {
    ...item,
    quantity,
    unit_price: unitPrice,
    discount_amount: discountAmount,
    tax_rate: taxRate,
    tax_amount: roundMoney(taxAmount),
    subtotal: roundMoney(subtotal),
    total: roundMoney(total),
    total_price: roundMoney(total),
  };
}

export function calculateQuotationTotals(items = [], options = {}) {
  const {
    headerDiscountPercent = 0,
    headerDiscountAmount = 0,
    toolingCost = 0,
  } = options;

  const calculatedItems = (items || []).map(calculateQuotationItem);

  const itemsSubtotal = calculatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const itemsDiscount = calculatedItems.reduce((sum, item) => sum + item.discount_amount, 0);
  const itemsTax = calculatedItems.reduce((sum, item) => sum + item.tax_amount, 0);

  const percentDiscount =
    headerDiscountPercent > 0 ? itemsSubtotal * (Number(headerDiscountPercent) / 100) : 0;
  const extraHeaderDiscount = Math.max(Number(headerDiscountAmount) || 0, 0);
  const headerDiscount = roundMoney(percentDiscount + extraHeaderDiscount);

  const subtotalBeforeTooling = Math.max(itemsSubtotal - headerDiscount, 0);
  const tooling = Math.max(Number(toolingCost) || 0, 0);
  const subtotal = roundMoney(subtotalBeforeTooling + tooling);

  // GST on remaining taxable base after header discount (items tax already per line)
  const taxAmount = roundMoney(itemsTax);
  const total = roundMoney(subtotal + taxAmount);

  return {
    items: calculatedItems,
    items_subtotal: roundMoney(itemsSubtotal),
    subtotal,
    discount_amount: roundMoney(itemsDiscount + headerDiscount),
    line_discount_amount: roundMoney(itemsDiscount),
    header_discount_amount: headerDiscount,
    tax_amount: taxAmount,
    gst_amount: taxAmount,
    tooling_cost: tooling,
    total,
    total_amount: total,
  };
}

/**
 * Merge calculated financials onto a quotation draft for UI and persistence.
 */
export function buildQuotationFinancials(quotation = {}, items = []) {
  const totals = calculateQuotationTotals(items, {
    headerDiscountPercent: quotation.header_discount_percent,
    headerDiscountAmount: quotation.header_discount_amount,
    toolingCost: quotation.tooling_cost,
  });

  return {
    items: totals.items,
    quotation: {
      ...quotation,
      subtotal: totals.subtotal,
      discount_amount: totals.discount_amount,
      tax_amount: totals.tax_amount,
      gst: totals.gst_amount,
      gst_amount: totals.gst_amount,
      total: totals.total,
      total_amount: totals.total_amount,
      quantity: totals.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    },
    totals,
  };
}

function roundMoney(value) {
  return Number((Number(value) || 0).toFixed(2));
}

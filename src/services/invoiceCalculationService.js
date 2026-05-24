/**
 * Centralized invoice and payment financial calculations.
 */

export const INVOICE_STATUSES = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
};

export function normalizeGstRate(rate, fallback = 0.18) {
  const value = rate === '' || rate === null || rate === undefined ? fallback : Number(rate);
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > 1) return Number((value / 100).toFixed(4));
  return value;
}

function roundMoney(value) {
  return Number((Number(value) || 0).toFixed(2));
}

export function calculateInvoiceItem(item = {}) {
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.unit_price) || 0;
  const discountAmount = Math.max(Number(item.discount_amount) || 0, 0);
  const gstRate = normalizeGstRate(item.gst_percentage ?? item.tax_rate ?? item.gst_rate, 0.18);
  const lineBase = quantity * unitPrice;
  const subtotal = Math.max(lineBase - discountAmount, 0);
  const taxAmount = subtotal * gstRate;
  const totalPrice = subtotal + taxAmount;

  return {
    ...item,
    quantity,
    unit_price: unitPrice,
    discount_amount: discountAmount,
    gst_percentage: gstRate,
    tax_rate: gstRate,
    subtotal: roundMoney(subtotal),
    tax_amount: roundMoney(taxAmount),
    total_price: roundMoney(totalPrice),
  };
}

export function calculateInvoiceTotals(items = [], options = {}) {
  const headerDiscount = Math.max(Number(options.headerDiscountAmount) || 0, 0);
  const calculatedItems = (items || []).map(calculateInvoiceItem);

  const itemsSubtotal = calculatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const lineDiscount = calculatedItems.reduce((sum, item) => sum + item.discount_amount, 0);
  const gstAmount = calculatedItems.reduce((sum, item) => sum + item.tax_amount, 0);

  const subtotal = roundMoney(Math.max(itemsSubtotal - headerDiscount, 0));
  const totalAmount = roundMoney(subtotal + gstAmount);

  return {
    items: calculatedItems,
    subtotal,
    discount_amount: roundMoney(lineDiscount + headerDiscount),
    line_discount_amount: roundMoney(lineDiscount),
    header_discount_amount: roundMoney(headerDiscount),
    gst_amount: roundMoney(gstAmount),
    tax_amount: roundMoney(gstAmount),
    total_amount: totalAmount,
    total: totalAmount,
  };
}

export function reconcilePaymentBalance({ totalAmount = 0, paidAmount = 0 } = {}) {
  const total = roundMoney(totalAmount);
  const paid = roundMoney(paidAmount);
  const dueAmount = roundMoney(Math.max(total - paid, 0));
  return { total_amount: total, paid_amount: paid, due_amount: dueAmount };
}

export function deriveInvoiceStatus({ totalAmount = 0, paidAmount = 0, dueDate = null, now = new Date() } = {}) {
  const { due_amount: dueAmount } = reconcilePaymentBalance({ totalAmount, paidAmount });

  if (dueAmount <= 0 && paidAmount > 0) {
    return INVOICE_STATUSES.PAID;
  }
  if (paidAmount > 0 && dueAmount > 0) {
    return INVOICE_STATUSES.PARTIAL;
  }

  const due = dueDate ? new Date(dueDate) : null;
  if (due && due < now && dueAmount > 0) {
    return INVOICE_STATUSES.OVERDUE;
  }

  return INVOICE_STATUSES.UNPAID;
}

export function validatePaymentAmount({ amount, dueAmount, paidAmount = 0, totalAmount = 0 }) {
  const payment = roundMoney(amount);
  const due = roundMoney(dueAmount ?? Math.max(totalAmount - paidAmount, 0));

  if (!Number.isFinite(payment) || payment <= 0) {
    return { valid: false, message: 'Payment amount must be greater than zero.' };
  }
  if (payment > due + 0.01) {
    return { valid: false, message: `Payment exceeds outstanding balance (${due}).` };
  }
  return { valid: true, message: '' };
}

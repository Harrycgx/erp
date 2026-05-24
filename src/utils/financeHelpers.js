import {
  calculateInvoiceTotals,
  deriveInvoiceStatus,
  INVOICE_STATUSES,
} from '../services/invoiceCalculationService';

export { INVOICE_STATUSES };

export function buildInvoiceNumber(sequence) {
  const year = new Date().getFullYear();
  const seq = Math.max(Number(sequence) || 1, 1);
  return `INV-${year}-${String(seq).padStart(4, '0')}`;
}

export function calculateGST({ subtotal = 0, gstRate = 0 }) {
  return Number(subtotal) * Number(gstRate);
}

export function calculateInvoiceTotalsLegacy({ subtotal = 0, gstRate = 0 }) {
  return calculateInvoiceTotals(
    [{ item_name: 'Line', quantity: 1, unit_price: subtotal, tax_rate: gstRate }],
    {}
  );
}

export { calculateInvoiceTotals } from '../services/invoiceCalculationService';

export function getInvoiceStatus({ total = 0, paid = 0, dueDate, status }) {
  if (status) {
    const normalized = String(status).toLowerCase();
    if (normalized === 'paid') return 'Paid';
    if (normalized === 'partial') return 'Partial';
    if (normalized === 'overdue') return 'Overdue';
    if (normalized === 'unpaid') return 'Unpaid';
  }

  const derived = deriveInvoiceStatus({
    totalAmount: total,
    paidAmount: paid,
    dueDate,
  });

  if (derived === INVOICE_STATUSES.PAID) return 'Paid';
  if (derived === INVOICE_STATUSES.PARTIAL) return 'Partial';
  if (derived === INVOICE_STATUSES.OVERDUE) return 'Overdue';
  return 'Unpaid';
}

export function getStatusClass(status) {
  const label = String(status || '');
  if (label === 'Paid' || label === 'paid') return 'bg-emerald-900/80 text-emerald-100';
  if (label === 'Partial' || label === 'partial') return 'bg-amber-900/80 text-amber-100';
  if (label === 'Overdue' || label === 'overdue') return 'bg-rose-900/80 text-rose-100';
  return 'bg-slate-700 text-slate-100';
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN');
}

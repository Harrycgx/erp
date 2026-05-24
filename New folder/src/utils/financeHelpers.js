export function buildInvoiceNumber() {
  return `INV-${Date.now().toString().slice(-6)}`;
}

export function calculateGST({ subtotal = 0, gstRate = 0 }) {
  return Number(subtotal) * Number(gstRate);
}

export function calculateInvoiceTotals({ subtotal = 0, gstRate = 0 }) {
  const subtotalNumber = Number(subtotal) || 0;
  const gst = calculateGST({ subtotal: subtotalNumber, gstRate: Number(gstRate) || 0 });
  return {
    subtotal: subtotalNumber,
    gst,
    total: subtotalNumber + gst,
  };
}

export function getInvoiceStatus({ total = 0, paid = 0, dueDate }) {
  const due = dueDate ? new Date(dueDate) : null;
  const now = new Date();
  if (Number(paid) >= Number(total)) return 'Paid';
  if (due && due < now) return 'Overdue';
  return 'Open';
}

export function getStatusClass(status) {
  if (status === 'Paid') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Overdue') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-700';
}

export function getPaymentStatus(payment) {
  return payment?.amount ? 'Recorded' : 'Pending';
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN');
}

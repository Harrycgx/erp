export function formatCurrency(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '₹0.00';
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getValidityDate(createdAt, days = 15) {
  const base = createdAt ? new Date(createdAt) : new Date();
  base.setDate(base.getDate() + days);
  return formatDate(base.toISOString());
}

export function buildQuoteNumber(quote) {
  if (!quote) return 'Q-0000';
  if (quote.order_number) return `Q-${quote.order_number}`;
  if (quote.id) return `Q-${quote.id.toString().slice(0, 8).toUpperCase()}`;
  return `Q-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function buildDocumentFilename(quote) {
  const quoteNumber = buildQuoteNumber(quote).replace(/[^A-Za-z0-9_-]/g, '_');
  return `${quoteNumber}-Mayur-Packaging-Quote.pdf`;
}

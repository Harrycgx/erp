import { formatCurrency, formatDate, getValidityDate } from './pdfHelpers';

export function normalizeQuoteForDocument(quote) {
  return {
    quoteNumber: quote?.quote_number || quote?.id || 'N/A',
    boxType: quote?.box_type || 'Corrugated box',
    dimensions: `${quote?.length || 0} × ${quote?.width || 0} × ${quote?.height || 0} mm`,
    quantity: quote?.quantity || 0,
    fluteType: quote?.flute_type || 'Standard',
    ply: quote?.ply || 'N/A',
    gsm: quote?.gsm || 'N/A',
    printing: quote?.printing_type || 'None',
    lamination: quote?.lamination || 'None',
    tooling: quote?.tooling_cost ? formatCurrency(quote.tooling_cost) : formatCurrency(0),
    subtotal: formatCurrency(quote.subtotal || 0),
    gst: formatCurrency(quote.gst || 0),
    total: formatCurrency(quote.total || 0),
    validUntil: getValidityDate(quote.created_at, 15),
    createdAt: formatDate(quote.created_at),
    terms: quote?.terms || 'Standard payment terms apply. Delivery subject to stock availability and factory schedule.',
  };
}

export function buildQuoteSummary(quote, customer) {
  return `${customer?.company_name || 'Customer'} · ${quote?.box_type || 'Corrugated box'} · ${quote?.quantity || 0} pcs`;
}

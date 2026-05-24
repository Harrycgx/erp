export const QUOTE_STATUSES = ['draft', 'sent', 'approved', 'rejected', 'expired', 'revision_requested', 'revised', 'converted'];
export const BOX_TYPES = ['Regular slotted box', 'Mailer box', 'Die cut box', 'Rigid box'];
export const FLUTE_TYPES = ['A flute', 'B flute', 'C flute', 'BC flute'];
export const PLY_OPTIONS = ['1 ply', '2 ply', '3 ply', '5 ply'];
export const GSM_OPTIONS = ['120', '150', '200', '250', '300'];
export const PRINTING_TYPES = ['None', 'Single color', 'Spot color', 'Full color'];
export const LAMINATION_OPTIONS = ['None', 'Matte', 'Gloss', 'Soft touch'];
export const URGENCY_OPTIONS = ['Standard', 'Rush'];

export const quoteStatusClasses = (status) => {
  switch (String(status || '').toLowerCase().replace(/\s+/g, '_')) {
    case 'draft':
      return 'bg-slate-700 text-slate-100';
    case 'sent':
      return 'bg-blue-700 text-white';
    case 'approved':
      return 'bg-emerald-600 text-white';
    case 'rejected':
      return 'bg-rose-600 text-white';
    case 'expired':
      return 'bg-amber-600 text-slate-950';
    case 'revision_requested':
      return 'bg-cyan-700 text-white';
    case 'revised':
      return 'bg-sky-700 text-white';
    case 'converted':
      return 'bg-purple-700 text-white';
    case 'converted_to_order':
      return 'bg-purple-700 text-white';
    default:
      return 'bg-slate-700 text-slate-100';
  }
};

export const buildQuoteTitle = (quote) => `${quote.box_type || 'Packaging quote'} — ${quote.quantity || '0'} pcs`;

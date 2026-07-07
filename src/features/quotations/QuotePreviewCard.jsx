import QuoteStatusBadge from './QuoteStatusBadge';

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export default function QuotePreviewCard({ quote, customer }) {
  return (
    <div className="rounded-[28px] border border-slate-700 bg-slate-950/90 p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quotation preview</p>
          <h3 className="mt-2 text-xl font-black text-white">{customer?.company_name || 'Customer quote'}</h3>
          <p className="mt-1 text-sm text-slate-500">{customer?.full_name || 'No customer selected'}</p>
        </div>
        <QuoteStatusBadge status={quote.status || 'Draft'} />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-300">
        <p><span className="font-semibold text-white">Box type:</span> {quote.box_type}</p>
        <p><span className="font-semibold text-white">Dimensions:</span> {quote.length}×{quote.width}×{quote.height} mm</p>
        <p><span className="font-semibold text-white">Quantity:</span> {quote.quantity}</p>
        <p><span className="font-semibold text-white">Flute:</span> {quote.flute_type}</p>
        <p><span className="font-semibold text-white">Printing:</span> {quote.printing_type}</p>
        <p><span className="font-semibold text-white">Lamination:</span> {quote.lamination}</p>
        <p><span className="font-semibold text-white">Created:</span> {quote.created_at ? formatDate(quote.created_at) : 'Draft'}</p>
      </div>
    </div>
  );
}

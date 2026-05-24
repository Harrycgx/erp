import QuoteStatusBadge from './QuoteStatusBadge';

export default function QuoteCard({ quote, customer, onView, onEdit }) {
  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-5 shadow-xl shadow-black/20 sm:hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quote</p>
          <p className="mt-2 text-lg font-black text-white">{quote.quote_number || quote.id || 'Quote'}</p>
          <p className="mt-2 text-sm text-slate-400">{customer?.company_name || 'No customer selected'}</p>
        </div>
        <QuoteStatusBadge status={quote.status} />
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-300">
        <p><span className="font-semibold text-slate-100">Box:</span> {quote.box_type || 'Unknown'}</p>
        <p><span className="font-semibold text-slate-100">Qty:</span> {quote.quantity || 0}</p>
        <p><span className="font-semibold text-slate-100">Total:</span> Rs {Number(quote.total || 0).toFixed(2)}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onView(quote)}
          className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800"
        >
          View
        </button>
        <button
          type="button"
          onClick={() => onEdit(quote)}
          className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

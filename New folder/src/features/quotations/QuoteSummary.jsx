import QuoteStatusBadge from './QuoteStatusBadge';

export default function QuoteSummary({ quote, pricing }) {
  return (
    <div className="rounded-[28px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quote summary</p>
          <h2 className="mt-2 text-2xl font-black text-white">{quote.box_type || 'Packaging quotation'}</h2>
          <p className="mt-2 text-sm text-slate-400">{quote.quantity} units • {quote.flute_type}</p>
        </div>
        <QuoteStatusBadge status={quote.status || 'Draft'} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dimensions</p>
          <p className="mt-2 text-sm text-slate-200">{quote.length} x {quote.width} x {quote.height} mm</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Production estimate</p>
          <p className="mt-2 text-sm text-slate-200">{quote.urgency === 'Rush' ? '3–4 business days' : '5–7 business days'}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex items-center justify-between gap-4 text-slate-400">
          <span className="text-sm">Subtotal</span>
          <span className="text-base font-semibold">₹{pricing.subtotal.toFixed(2)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 text-slate-400">
          <span className="text-sm">GST</span>
          <span className="text-base font-semibold">₹{pricing.gst.toFixed(2)}</span>
        </div>
        <div className="mt-4 border-t border-slate-800 pt-4 flex items-center justify-between gap-4 text-white">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-black">₹{pricing.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

import { formatCurrency, formatDate, getValidityDate } from '../../utils/pdfHelpers';

export default function QuoteTemplate({ quote, customer }) {
  return (
    <div className="space-y-8 rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Mayur Packaging</p>
            <h1 className="mt-2 text-2xl font-black text-white">Quotation document</h1>
            <p className="mt-2 text-sm text-slate-400">Industry-grade corrugated packaging optimized for scale and reliability.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Quote</p>
              <p className="mt-2 text-sm text-slate-300">{quote?.quote_number || quote?.id || 'Draft'}</p>
              <p className="mt-1 text-sm text-slate-400">Valid until {getValidityDate(quote?.created_at)}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Customer</p>
              <p className="mt-2 text-sm text-slate-300">{customer?.company_name || 'Customer name'}</p>
              <p className="mt-1 text-sm text-slate-400">{customer?.full_name || 'Contact person'}</p>
              <p className="mt-1 text-sm text-slate-400">{customer?.email || 'email@example.com'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Overview</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p><span className="font-semibold text-white">Created</span>: {formatDate(quote?.created_at)}</p>
            <p><span className="font-semibold text-white">Box type</span>: {quote?.box_type}</p>
            <p><span className="font-semibold text-white">Quantity</span>: {quote?.quantity}</p>
            <p><span className="font-semibold text-white">Total</span>: {formatCurrency(quote?.total)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-base font-semibold text-white">Box specification</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p><span className="font-semibold text-white">Dimensions:</span> {quote?.length} × {quote?.width} × {quote?.height} mm</p>
              <p><span className="font-semibold text-white">Flute:</span> {quote?.flute_type}</p>
              <p><span className="font-semibold text-white">Ply:</span> {quote?.ply}</p>
              <p><span className="font-semibold text-white">GSM:</span> {quote?.gsm}</p>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">Finishing</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p><span className="font-semibold text-white">Printing:</span> {quote?.printing_type}</p>
              <p><span className="font-semibold text-white">Lamination:</span> {quote?.lamination}</p>
              <p><span className="font-semibold text-white">Urgency:</span> {quote?.urgency}</p>
              <p><span className="font-semibold text-white">Tooling:</span> {formatCurrency(quote?.tooling_cost)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
          <h3 className="text-base font-semibold text-white">Pricing breakdown</h3>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <p><span className="font-semibold text-white">Subtotal</span>: {formatCurrency(quote?.subtotal)}</p>
            <p><span className="font-semibold text-white">GST</span>: {formatCurrency(quote?.gst)}</p>
            <p><span className="font-semibold text-white">Total</span>: {formatCurrency(quote?.total)}</p>
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6">
          <h3 className="text-base font-semibold text-white">Terms & conditions</h3>
          <p className="mt-4 text-sm leading-6 text-slate-400">All quotations are valid for 15 days. Delivery depends on material and schedule availability. 50% advance payment is required to confirm production.</p>
          <p className="mt-4 text-sm leading-6 text-slate-400">Mayur Packaging reserves the right to revise the quote if specifications change or raw material costs fluctuate.</p>
        </div>
      </div>
    </div>
  );
}

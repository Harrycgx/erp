import { X, CheckCircle2 } from 'lucide-react';

export default function QuoteConversionModal({ open, quote, onClose, onConfirm, loading }) {
  if (!open || !quote) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-700 bg-slate-950 p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Convert quote</p>
            <h2 className="mt-2 text-3xl font-black text-white">Convert quotation to order</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Confirm production staging and dispatch expectations before converting this quote into a live order.</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 transition hover:text-slate-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Production stage</p>
            <p className="mt-3 text-lg font-semibold text-white">Pending confirmation</p>
            <p className="mt-2 text-sm text-slate-400">Box type: {quote.box_type || 'Corrugated packaging'}</p>
            <p className="mt-1 text-sm text-slate-400">Qty: {quote.quantity || 0}</p>
          </div>
          <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Estimated dispatch</p>
            <p className="mt-3 text-lg font-semibold text-white">{quote.urgency === 'Rush' ? '2–3 business days' : '5–7 business days'}</p>
            <p className="mt-2 text-sm text-slate-400">Delivery depends on material availability and production load.</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Order readiness</p>
          <ul className="mt-3 space-y-2">
            <li>• Pricing locked once converted</li>
            <li>• Production schedule reserved after confirmation</li>
            <li>• Customer approval status is preserved</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? 'Converting…' : 'Confirm conversion'}
          </button>
        </div>
      </div>
    </div>
  );
}

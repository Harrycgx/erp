import { useState } from 'react';

export default function QuoteToOrderModal({ open, quote, onClose, onConvert }) {
  const [staff, setStaff] = useState('Production team');
  const [notes, setNotes] = useState('Converted from approved quotation.');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-xl rounded-[36px] border border-slate-700 bg-slate-950/95 p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Convert quote</p>
            <h2 className="mt-2 text-2xl font-black text-white">Quote to order</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 transition hover:text-white">✕</button>
        </div>

        <div className="mt-6 space-y-5">
          <p className="text-sm text-slate-300">Convert quotation {quote?.quote_number || quote?.id} into a new production order. The order will be created in the pending stage and can be tracked on the orders dashboard.</p>
          <label className="block text-sm font-semibold text-slate-300">
            Assign staff
            <input
              type="text"
              value={staff}
              onChange={(event) => setStaff(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none focus:border-orange-400"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-300">
            Notes
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none focus:border-orange-400"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 bg-slate-900/90 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConvert({ assigned_staff: staff, notes })}
            className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
          >
            Confirm conversion
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuoteApprovalPanel({ quote, onApprove, onReject, onRequestRevision, loading }) {
  if (!quote) return null;
  const canAct = ['sent', 'draft', 'revision_requested', 'revised'].includes(String(quote.status || '').toLowerCase());
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-5 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Customer actions</p>
          <h3 className="mt-2 text-xl font-black text-white">Approval workflow</h3>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Status: {quote.status}</span>
      </div>
      <p className="text-sm leading-6 text-slate-400">Approve, reject, or ask for revisions before converting this quote into production. Keep comments clear and factory-ready.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          disabled={!canAct || loading}
          onClick={onApprove}
          className="rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={!canAct || loading}
          onClick={onRequestRevision}
          className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Request revision
        </button>
        <button
          type="button"
          disabled={!canAct || loading}
          onClick={onReject}
          className="rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

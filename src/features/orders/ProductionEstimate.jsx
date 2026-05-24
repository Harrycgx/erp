import { formatDate } from '../../utils/pdfHelpers';

export default function ProductionEstimate({ order }) {
  const created = order?.created_at ? new Date(order.created_at) : new Date();
  const estimated = new Date(created);
  estimated.setDate(estimated.getDate() + 14);

  return (
    <div className="rounded-[28px] border border-slate-700 bg-slate-950/90 p-6 text-sm text-slate-300">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Production estimate</p>
      <h3 className="mt-3 text-xl font-black text-white">Forecasted completion</h3>
      <div className="mt-5 space-y-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Estimated release to dispatch</p>
          <p className="mt-2 text-lg font-semibold text-white">{formatDate(estimated.toISOString())}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Current stage</p>
          <p className="mt-2 text-lg font-semibold text-white">{order?.production_stage || 'Pending'}</p>
        </div>
      </div>
    </div>
  );
}

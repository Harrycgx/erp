import { isOverdue } from '../../utils/productionHelpers';

export default function ProductionAlerts({ jobs = [] }) {
  const delayedJobs = jobs.filter(isOverdue);
  const urgentOrders = jobs.filter((job) => job.priority === 'Urgent');
  const dispatchReady = jobs.filter((job) => job.production_stage === 'dispatch_ready');

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Production alerts</p>
          <h2 className="mt-2 text-xl font-black text-white">Operational flags</h2>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{jobs.length} jobs</span>
      </div>

      <div className="space-y-3 text-sm text-slate-300">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="font-semibold text-white">Delayed production</p>
          <p className="mt-2 text-slate-400">{delayedJobs.length} job{delayedJobs.length === 1 ? '' : 's'} are overdue for completion.</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="font-semibold text-white">Pending dispatch</p>
          <p className="mt-2 text-slate-400">{dispatchReady.length} orders are staged and ready for logistics.</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="font-semibold text-white">Urgent orders</p>
          <p className="mt-2 text-slate-400">{urgentOrders.length} high-priority job{urgentOrders.length === 1 ? '' : 's'} need attention.</p>
        </div>
      </div>
    </div>
  );
}

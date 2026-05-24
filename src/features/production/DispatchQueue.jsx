import { formatDate, normalizeStage } from '../../utils/productionHelpers';

export default function DispatchQueue({ jobs }) {
  const readyJobs = jobs.filter((job) => normalizeStage(job.production_stage) === 'dispatch_ready');

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dispatch queue</p>
          <h2 className="mt-2 text-2xl font-black text-white">Ready to ship</h2>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">{readyJobs.length}</span>
      </div>

      <div className="space-y-3">
        {readyJobs.length ? (
          readyJobs.map((job) => (
            <div key={job.id} className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{job.order_number || `Order ${job.order_id || job.id}`}</p>
                  <p className="text-sm text-slate-400">{job.box_type || 'Corrugated pack'}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">ETA {formatDate(job.estimated_completion)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-300">
                <span>{job.assigned_staff || 'Unassigned'}</span>
                <span>{job.priority || 'Normal'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 text-sm text-slate-400">No orders are ready for dispatch. Complete QC and staging to move jobs here.</div>
        )}
      </div>
    </div>
  );
}

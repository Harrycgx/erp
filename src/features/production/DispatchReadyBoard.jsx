import { Link } from 'react-router-dom';
import ProductionStageBadge from './ProductionStageBadge';
import { formatDate } from '../../utils/productionHelpers';

export default function DispatchReadyBoard({ jobs = [], onSelectJob, linkToDetail = false }) {
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dispatch ready</p>
          <h2 className="mt-2 text-xl font-black text-white">Staged orders</h2>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{jobs.length}</span>
      </div>

      <div className="space-y-3 text-sm text-slate-300">
        {jobs.length ? (
          jobs.slice(0, 6).map((job) => {
            const inner = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{job.production_number || job.order_number}</p>
                    <p className="mt-1 text-xs text-slate-400">ETA {formatDate(job.estimated_completion)}</p>
                  </div>
                  <ProductionStageBadge stage={job.production_stage} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-slate-400">
                  <span>{job.metadata?.sales_order_number || job.order_number || 'SO'}</span>
                  <span>{job.priority || 'Normal'}</span>
                </div>
              </>
            );

            if (linkToDetail) {
              return (
                <Link
                  key={job.id}
                  to={`/production/${job.id}`}
                  className="block w-full rounded-3xl border border-slate-800 bg-slate-900/85 p-4 text-left transition hover:border-slate-500"
                >
                  {inner}
                </Link>
              );
            }

            return (
              <button
                key={job.id}
                type="button"
                onClick={() => onSelectJob?.(job)}
                className="w-full rounded-3xl border border-slate-800 bg-slate-900/85 p-4 text-left transition hover:border-slate-500"
              >
                {inner}
              </button>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-5 text-sm text-slate-500">No orders are currently staged for dispatch.</div>
        )}
      </div>
    </div>
  );
}

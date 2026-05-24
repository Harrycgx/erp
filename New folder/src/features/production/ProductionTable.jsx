import ProductionStageBadge from './ProductionStageBadge';
import { formatDate } from '../../utils/productionHelpers';

export default function ProductionTable({ jobs, onSelectJob }) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-700 bg-slate-950/95 shadow-xl shadow-black/20">
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90">
        <h2 className="text-lg font-semibold text-white">Production list</h2>
        <p className="mt-2 text-sm text-slate-400">Browse active factory jobs and choose one to manage.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-300">
          <thead>
            <tr>
              <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.3em] text-slate-500">Order</th>
              <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.3em] text-slate-500">Stage</th>
              <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.3em] text-slate-500">Staff</th>
              <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.3em] text-slate-500">ETA</th>
              <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.3em] text-slate-500">Priority</th>
              <th className="px-5 py-4 text-left text-xs uppercase tracking-[0.3em] text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-900/80">
                <td className="px-5 py-4">
                  <p className="font-semibold text-white">{job.order_number || `Order ${job.order_id || job.id}`}</p>
                  <p className="mt-1 text-slate-400 text-xs">{job.box_type || 'Corrugated pack'}</p>
                </td>
                <td className="px-5 py-4"><ProductionStageBadge stage={job.production_stage} /></td>
                <td className="px-5 py-4">{job.assigned_staff || 'Unassigned'}</td>
                <td className="px-5 py-4">{formatDate(job.estimated_completion)}</td>
                <td className="px-5 py-4">{job.priority || 'Normal'}</td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onSelectJob(job)}
                    className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

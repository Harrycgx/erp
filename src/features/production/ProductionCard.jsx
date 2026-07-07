import ProductionStageBadge from './ProductionStageBadge';
import {
  buildJobHeadline,
  formatDate,
  getPriorityClass,
  isOverdue,
  getStageProgress,
} from '../../utils/productionHelpers';

export default function ProductionCard({ job, selected, onSelect }) {
  const progress = getStageProgress(job.production_stage);
  const customerName = job.customer_name || job.customer || job.client || 'Client unknown';

  return (
    <article
      draggable
      onDragStart={(event) => event.dataTransfer.setData('text/plain', job.id?.toString())}
      onClick={onSelect}
      className={`cursor-pointer rounded-3xl border p-4 transition ${selected ? 'border-orange-500 bg-slate-900/95' : 'border-slate-700 bg-slate-900/80 hover:border-slate-500'} ${isOverdue(job) ? 'ring-2 ring-rose-500/40' : ''}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{buildJobHeadline(job)}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{customerName}</p>
          <p className="mt-2 text-xs text-slate-400">{job.box_type || 'Corrugated pack'} · {job.quantity || 0} pcs</p>
        </div>
        <div className="space-y-2 text-right">
          <ProductionStageBadge stage={job.production_stage} />
          <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${getPriorityClass(job.priority)}`}>{job.priority || 'Normal'}</span>
        </div>
      </div>

      <div className="mb-4 rounded-3xl bg-slate-800/70 p-3">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
          <span>Estimated dispatch</span>
          <span>{formatDate(job.estimated_completion)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-900">
          <div className={`h-full rounded-full ${progress >= 80 ? 'bg-emerald-500' : progress >= 50 ? 'bg-orange-500' : 'bg-slate-500'}`} style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-400">Production progress: {progress}%</p>
      </div>

      <div className="text-sm text-slate-300">
        <p><span className="font-semibold text-white">Product:</span> {job.box_type || 'Corrugated pack'}</p>
        <p className="mt-1"><span className="font-semibold text-white">Customer:</span> {customerName}</p>
      </div>
    </article>
  );
}

import ProductionCard from './ProductionCard';
import ProductionAlerts from './ProductionAlerts';
import ProductionQueue from './ProductionQueue';
import DispatchReadyBoard from './DispatchReadyBoard';
import ProductionStageBadge from './ProductionStageBadge';
import ProductionTimeline from './ProductionTimeline';
import {
  PRODUCTION_STAGES,
  normalizeStage,
  formatStageLabel,
  formatDate,
  getPriorityClass,
  isOverdue,
} from '../../utils/productionHelpers';

export default function ProductionBoard({ jobs = [], onStageChange, onSelectJob, selectedJob }) {
  const normalizedJobs = jobs.map((job) => ({
    ...job,
    normalizedStage: normalizeStage(job.production_stage),
  }));

  const stageColumns = PRODUCTION_STAGES.map((stage) => ({
    key: stage,
    title: formatStageLabel(stage),
    items: normalizedJobs.filter((job) => job.normalizedStage === stage),
  }));

  const queueCount = normalizedJobs.length;
  const activeJobs = normalizedJobs.filter((job) => !['pending', 'delivered'].includes(job.normalizedStage));
  const delayedJobs = normalizedJobs.filter(isOverdue);
  const dispatchReadyJobs = normalizedJobs.filter((job) => job.normalizedStage === 'dispatch_ready');
  const completedJobs = normalizedJobs.filter((job) => job.normalizedStage === 'delivered');
  const pendingJobs = normalizedJobs.filter((job) => ['pending', 'paper_ordered', 'printing', 'punching', 'pasting', 'qc'].includes(job.normalizedStage));

  const priorityCounts = normalizedJobs.reduce(
    (acc, job) => {
      const level = job.priority || 'Normal';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    },
    { Urgent: 0, High: 0, Normal: 0 }
  );

  const handleDrop = (event, stage) => {
    event.preventDefault();
    const jobId = event.dataTransfer.getData('text/plain');
    const job = normalizedJobs.find((item) => item.id?.toString() === jobId?.toString());
    if (job && job.normalizedStage !== stage) {
      onStageChange?.(job, stage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Production board</p>
              <h2 className="mt-2 text-3xl font-black text-white">Factory workflow</h2>
            </div>
            <p className="text-sm text-slate-400">Shift orders through the shop floor from raw materials to dispatch.</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-700 bg-slate-950/95 p-4 shadow-xl shadow-black/20">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Production queue</p>
              <p className="mt-3 text-3xl font-black text-white">{queueCount}</p>
              <p className="mt-2 text-sm text-slate-400">Total jobs on the factory floor.</p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-950/95 p-4 shadow-xl shadow-black/20">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Active jobs</p>
              <p className="mt-3 text-3xl font-black text-white">{activeJobs.length}</p>
              <p className="mt-2 text-sm text-slate-400">Orders currently in production.</p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-950/95 p-4 shadow-xl shadow-black/20">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Delayed jobs</p>
              <p className="mt-3 text-3xl font-black text-white">{delayedJobs.length}</p>
              <p className="mt-2 text-sm text-slate-400">Jobs overdue for dispatch.</p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-950/95 p-4 shadow-xl shadow-black/20">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Completed jobs</p>
              <p className="mt-3 text-3xl font-black text-white">{completedJobs.length}</p>
              <p className="mt-2 text-sm text-slate-400">Orders finished and delivered.</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="grid auto-cols-[320px] grid-flow-col gap-4 pb-4">
              {stageColumns.map((column) => (
                <section
                  key={column.key}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, column.key)}
                  className="min-w-[320px] rounded-[32px] border border-slate-700 bg-slate-950/95 p-5 shadow-xl shadow-black/20"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">{column.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{column.items.length} jobs</p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{column.items.length}</span>
                  </div>
                  <div className="space-y-3 min-h-[180px]">
                    {column.items.length ? (
                      column.items.map((job) => (
                        <ProductionCard
                          key={job.id}
                          job={job}
                          selected={selectedJob?.id === job.id}
                          onSelect={() => onSelectJob(job)}
                        />
                      ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-500">No jobs in this stage</div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <ProductionAlerts jobs={normalizedJobs} />
          <ProductionQueue jobs={pendingJobs} onSelectJob={onSelectJob} />
          <DispatchReadyBoard jobs={dispatchReadyJobs} onSelectJob={onSelectJob} />
        </aside>
      </div>
    </div>
  );
}

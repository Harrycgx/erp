import { useMemo } from 'react';
import { normalizeStage } from '../../utils/productionHelpers';

const machineCatalog = [
  { name: 'Corrugator A', status: 'Running', activeJobs: 12 },
  { name: 'Printer B', status: 'Idle', activeJobs: 4 },
  { name: 'Punching Line 1', status: 'Maintenance', activeJobs: 0 },
  { name: 'Pasting Station 3', status: 'Running', activeJobs: 8 },
];

export default function MachineStatus({ jobs }) {
  const summary = useMemo(() => ({
    running: jobs.filter((job) => ['printing', 'pasting', 'punching'].includes(normalizeStage(job.production_stage))).length,
    ready: jobs.filter((job) => normalizeStage(job.production_stage) === 'dispatch_ready').length,
    pending: jobs.filter((job) => normalizeStage(job.production_stage) === 'pending').length,
  }), [jobs]);

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Machine status</p>
          <h2 className="mt-2 text-2xl font-black text-white">Factory equipment</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
          <span>Running {summary.running}</span>
          <span>Ready {summary.ready}</span>
          <span>Pending {summary.pending}</span>
        </div>
      </div>
      <div className="space-y-4">
        {machineCatalog.map((machine) => (
          <div key={machine.name} className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{machine.name}</p>
                <p className="text-sm text-slate-400">{machine.activeJobs} active jobs</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${machine.status === 'Running' ? 'bg-emerald-900 text-emerald-100' : machine.status === 'Idle' ? 'bg-slate-700 text-slate-100' : 'bg-amber-900 text-amber-100'}`}>
                {machine.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

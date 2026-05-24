import { PRODUCTION_STAGES, formatStageLabel, formatDateTime, normalizeStage } from '../../utils/productionHelpers';

export default function ProductionTimeline({ currentStage = 'pending', stageTimestamps = {} }) {
  const currentIndex = PRODUCTION_STAGES.indexOf(normalizeStage(currentStage));

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Stage timeline</p>
          <p className="text-sm text-slate-400">Completed, active, and upcoming production checkpoints.</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{formatStageLabel(currentStage)}</span>
      </div>
      <div className="space-y-3">
        {PRODUCTION_STAGES.map((stage, index) => {
          const normalized = normalizeStage(stage);
          const state = index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'pending';
          const timestamp = stageTimestamps[normalized];

          return (
            <div key={stage} className="flex items-start gap-3">
              <div className="mt-1 flex h-3 w-3 items-center justify-center rounded-full border border-slate-700 bg-slate-950">
                <div
                  className={`h-2 w-2 rounded-full ${state === 'completed' ? 'bg-emerald-500' : state === 'active' ? 'bg-orange-500' : 'bg-slate-700'}`}
                />
              </div>
              <div className="min-w-0">
                <p className={`text-sm ${state === 'active' ? 'font-semibold text-white' : 'text-slate-400'}`}>{formatStageLabel(stage)}</p>
                <p className="text-xs text-slate-500">{timestamp ? formatDateTime(timestamp) : state === 'completed' ? 'Completed earlier' : state === 'active' ? 'In progress' : 'Awaiting start'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

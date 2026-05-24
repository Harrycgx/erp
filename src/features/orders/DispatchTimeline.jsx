import { PRODUCTION_STAGES } from '../../utils/orderHelpers';

export default function DispatchTimeline({ order }) {
  return (
    <div className="rounded-[28px] border border-slate-700 bg-slate-950/90 p-6 text-sm text-slate-300">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dispatch timeline</p>
          <h3 className="mt-2 text-xl font-black text-white">Production stages</h3>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{order?.production_stage}</span>
      </div>

      <div className="space-y-4">
        {PRODUCTION_STAGES.map((stage, index) => {
          const complete = order && PRODUCTION_STAGES.findIndex((item) => item.key === order.production_stage) >= index;
          return (
            <div key={stage.key} className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${complete ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {index + 1}
              </div>
              <div>
                <p className={`font-semibold ${complete ? 'text-white' : 'text-slate-300'}`}>{stage.label}</p>
                <p className="text-xs text-slate-500">{complete ? 'Completed' : 'Pending'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

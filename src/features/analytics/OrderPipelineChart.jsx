export default function OrderPipelineChart({ stages = [] }) {
  const total = stages.reduce((sum, stage) => sum + stage.value, 0) || 1;

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Order pipeline</p>
      <h2 className="mt-2 text-2xl font-black text-white">Status by stage</h2>
      <div className="mt-6 space-y-4">
        {stages.map((stage) => (
          <div key={stage.label}>
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>{stage.label}</span>
              <span>{((stage.value / total) * 100).toFixed(0)}%</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-slate-900/90">
              <div className="h-full rounded-full bg-cyan-500" style={{ width: `${(stage.value / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

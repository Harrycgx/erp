export default function ProductionEfficiencyChart({ efficiency = 0 }) {
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Production efficiency</p>
      <h2 className="mt-2 text-2xl font-black text-white">Overall efficiency</h2>
      <div className="mt-6 rounded-3xl bg-slate-900/90 p-6 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Efficiency score</p>
        <p className="mt-4 text-5xl font-black text-white">{efficiency}%</p>
        <div className="mt-6 h-4 rounded-full bg-slate-900/80">
          <div className="h-full rounded-full bg-sky-500" style={{ width: `${efficiency}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function AIProductionInsights({ production = {} }) {
  const { current = 0, forecast = 0, trend = 'Stable' } = production;
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Production intelligence</p>
      <h2 className="mt-2 text-3xl font-black text-white">Capacity forecast</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-900/95 p-4">
          <p className="text-sm text-slate-400">Current load</p>
          <p className="mt-3 text-2xl font-semibold text-white">{current.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl bg-slate-900/95 p-4">
          <p className="text-sm text-slate-400">Forecast load</p>
          <p className="mt-3 text-2xl font-semibold text-white">{forecast.toLocaleString()}</p>
        </div>
      </div>
      <p className="mt-5 text-sm text-slate-400">Trend: <span className="font-semibold text-white">{trend}</span></p>
    </div>
  );
}

export default function AIRevenueForecast({ revenue = {} }) {
  const { current = 0, nextPeriod = 0, growth = '0%' } = revenue;
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Revenue forecast</p>
      <h2 className="mt-2 text-3xl font-black text-white">Sales outlook</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-slate-900/95 p-4">
          <p className="text-sm text-slate-400">This period</p>
          <p className="mt-3 text-2xl font-semibold text-white">₹{current?.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl bg-slate-900/95 p-4">
          <p className="text-sm text-slate-400">Next period</p>
          <p className="mt-3 text-2xl font-semibold text-white">₹{nextPeriod?.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl bg-slate-900/95 p-4">
          <p className="text-sm text-slate-400">Growth</p>
          <p className="mt-3 text-2xl font-semibold text-white">{growth}</p>
        </div>
      </div>
    </div>
  );
}

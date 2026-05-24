export default function AIInventoryForecast({ inventory = {} }) {
  const { level = 0, risk = 'Low', reorder = 0 } = inventory;
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Inventory forecast</p>
      <h2 className="mt-2 text-3xl font-black text-white">Stock risk profile</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-slate-900/95 p-4">
          <p className="text-sm text-slate-400">Current units</p>
          <p className="mt-3 text-2xl font-semibold text-white">{level?.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl bg-slate-900/95 p-4">
          <p className="text-sm text-slate-400">Reorder qty</p>
          <p className="mt-3 text-2xl font-semibold text-white">{reorder?.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl bg-slate-900/95 p-4">
          <p className="text-sm text-slate-400">Risk</p>
          <p className="mt-3 text-2xl font-semibold text-white">{risk}</p>
        </div>
      </div>
    </div>
  );
}

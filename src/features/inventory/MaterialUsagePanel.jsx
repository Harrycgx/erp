export default function MaterialUsagePanel({ items = [], selectedItem }) {
  const topUsage = [...items]
    .sort((a, b) => (b.reserved_stock || 0) - (a.reserved_stock || 0))
    .slice(0, 4);

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Material usage</p>
          <h2 className="mt-2 text-xl font-black text-white">Consumption highlights</h2>
        </div>
        {selectedItem ? <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">Selected</span> : null}
      </div>

      <div className="space-y-4 text-sm text-slate-300">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-slate-400">Highest reserved materials</p>
          <p className="mt-2 text-2xl font-black text-white">{topUsage[0] ? topUsage[0].reserved_stock : 0}</p>
        </div>

        {topUsage.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-white">{item.material_name || item.name}</p>
              <span className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.reserved_stock ?? 0} reserved</span>
            </div>
            <p className="mt-2 text-slate-400">Available {item.stock_level ?? item.current_stock ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

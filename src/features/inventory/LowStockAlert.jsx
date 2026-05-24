export default function LowStockAlert({ items }) {
  const lowStock = items.filter((item) => item.current_stock <= item.minimum_stock);

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Low stock alert</p>
          <h2 className="mt-2 text-2xl font-black text-white">Reorder recommendations</h2>
        </div>
        <span className="rounded-full bg-rose-900 px-3 py-1 text-xs uppercase tracking-[0.3em] text-rose-100">{lowStock.length} items</span>
      </div>
      <div className="space-y-3">
        {lowStock.length ? (
          lowStock.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{item.material_name}</p>
                  <p className="text-slate-400">{item.category || 'Raw material'}</p>
                </div>
                <p className="text-sm text-rose-300">{item.current_stock}/{item.minimum_stock} {item.unit}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-3xl border border-slate-800 bg-slate-900/85 p-5 text-sm text-slate-400">All inventory levels are healthy.</p>
        )}
      </div>
    </div>
  );
}

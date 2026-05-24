import { isLowStock } from '../../utils/inventoryHelpers';

export default function LowStockAlerts({ items = [] }) {
  const lowItems = items.filter(isLowStock);

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Low stock</p>
          <h2 className="mt-2 text-xl font-black text-white">Materials flagged</h2>
        </div>
        <span className="rounded-full bg-rose-900 px-3 py-1 text-xs uppercase tracking-[0.3em] text-rose-200">{lowItems.length}</span>
      </div>

      <div className="space-y-4 text-sm text-slate-300">
        {lowItems.length ? (
          lowItems.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{item.material_name || item.name}</p>
                <span className="text-xs uppercase tracking-[0.24em] text-rose-300">{item.stock_level ?? item.current_stock} left</span>
              </div>
              <p className="mt-2 text-slate-400">Reorder threshold {(item.reorder_level ?? item.minimum_stock) || 'N/A'}</p>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-5 text-sm text-slate-500">All tracked materials are above reorder thresholds.</div>
        )}
      </div>
    </div>
  );
}

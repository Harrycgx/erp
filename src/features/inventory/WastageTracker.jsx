import { calculateWastageValue } from '../../utils/stockCalculations';

export default function WastageTracker({ items }) {
  const totalWastage = items.reduce((sum, item) => sum + calculateWastageValue(item), 0);
  const totalStock = items.reduce((sum, item) => sum + Number(item.current_stock || 0), 0);
  const wastageRatio = totalStock ? Math.round((totalWastage / totalStock) * 100) : 0;

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Wastage tracker</p>
          <h2 className="mt-2 text-2xl font-black text-white">Material efficiency</h2>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{wastageRatio}%</span>
      </div>
      <div className="mt-6 space-y-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-sm text-slate-400">Estimated material lost</p>
          <p className="mt-2 text-3xl font-black text-white">{totalWastage}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-sm text-slate-400">Average wastage rate</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.min(100, wastageRatio)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

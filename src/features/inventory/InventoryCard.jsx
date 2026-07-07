import { getStockStatus, buildMaterialLabel, formatUnit } from '../../utils/inventoryHelpers';

export default function InventoryCard({ item, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="w-full rounded-3xl border border-slate-700 bg-slate-950/95 p-5 text-left transition hover:border-orange-500"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{buildMaterialLabel(item)}</p>
          <p className="mt-1 text-sm text-slate-400">{item.category || 'Raw material'}</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{getStockStatus(item)}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-300">
        <div>
          <p className="text-slate-400">Stock</p>
          <p className="font-semibold text-white">{formatUnit(item.stock_quantity ?? item.current_stock, item.unit)}</p>
        </div>
        <div>
          <p className="text-slate-400">Reserved</p>
          <p className="font-semibold text-white">{formatUnit(item.reserved_quantity ?? item.reserved_stock, item.unit)}</p>
        </div>
        <div>
          <p className="text-slate-400">Available</p>
          <p className="font-semibold text-white">{formatUnit(item.available_quantity, item.unit)}</p>
        </div>
        <div>
          <p className="text-slate-400">Min stock</p>
          <p className="font-semibold text-white">{formatUnit(item.reorder_level ?? item.minimum_stock, item.unit)}</p>
        </div>
      </div>
    </button>
  );
}

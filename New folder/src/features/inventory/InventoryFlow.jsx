import InventoryCard from './InventoryCard';
import LowStockAlerts from './LowStockAlerts';
import MaterialUsagePanel from './MaterialUsagePanel';
import InventoryMovementTable from './InventoryMovementTable';
import { isLowStock } from '../../utils/inventoryHelpers';

export default function InventoryFlow({ items = [], selectedItem, movements = [], onSelectItem = () => {} }) {
  const rawMaterials = items.slice(0, 4);
  const lowStockCount = items.filter(isLowStock).length;
  const reservedTotal = items.reduce((sum, item) => sum + Number(item.reserved_stock || 0), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Inventory flow</p>
            <h2 className="mt-2 text-3xl font-black text-white">Raw material movement</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">Track stock levels, reserved consumption, and the next incoming shipments for corrugated production.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-300">
              <p className="text-slate-400">Low stock alerts</p>
              <p className="mt-2 text-2xl font-black text-white">{lowStockCount}</p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-300">
              <p className="text-slate-400">Reserved inventory</p>
              <p className="mt-2 text-2xl font-black text-white">{reservedTotal}</p>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-300">
              <p className="text-slate-400">Tracked materials</p>
              <p className="mt-2 text-2xl font-black text-white">{items.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {rawMaterials.map((item) => (
              <InventoryCard key={item.id} item={item} onSelect={onSelectItem} />
            ))}
          </div>

          <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Stock movement preview</p>
            <InventoryMovementTable movements={movements} />
          </div>
        </div>

        <div className="space-y-6">
          <LowStockAlerts items={items} />
          <MaterialUsagePanel items={items} selectedItem={selectedItem} />
        </div>
      </div>
    </div>
  );
}

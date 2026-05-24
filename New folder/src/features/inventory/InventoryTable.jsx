import { formatUnit } from '../../utils/inventoryHelpers';

export default function InventoryTable({ items, suppliers, onSelectItem, onEditItem }) {
  const supplierLookup = suppliers?.reduce((acc, supplier) => {
    acc[supplier.supplier_name] = supplier.supplier_name;
    acc[supplier.id] = supplier.supplier_name;
    return acc;
  }, {}) || {};

  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-700 bg-slate-950/95 shadow-xl shadow-black/20">
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90">
        <h2 className="text-lg font-semibold text-white">Inventory register</h2>
        <p className="mt-2 text-sm text-slate-400">Material stock, warehouse location and supplier availability.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-300">
          <thead>
            <tr>
              <th className="px-5 py-4 text-left uppercase tracking-[0.3em] text-slate-500">Material</th>
              <th className="px-5 py-4 text-left uppercase tracking-[0.3em] text-slate-500">Category</th>
              <th className="px-5 py-4 text-left uppercase tracking-[0.3em] text-slate-500">Location</th>
              <th className="px-5 py-4 text-right uppercase tracking-[0.3em] text-slate-500">Stock</th>
              <th className="px-5 py-4 text-right uppercase tracking-[0.3em] text-slate-500">Reserved</th>
              <th className="px-5 py-4 text-right uppercase tracking-[0.3em] text-slate-500">Available</th>
              <th className="px-5 py-4 text-left uppercase tracking-[0.3em] text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-900/80">
                <td className="px-5 py-4 text-white">{item.material_name}</td>
                <td className="px-5 py-4">{item.category}</td>
                <td className="px-5 py-4">{item.warehouse_location || item.storage_location || 'Unknown'}</td>
                <td className="px-5 py-4 text-right">{formatUnit(item.stock_quantity ?? item.current_stock, item.unit)}</td>
                <td className="px-5 py-4 text-right">{formatUnit(item.reserved_quantity ?? item.reserved_stock, item.unit)}</td>
                <td className="px-5 py-4 text-right">{formatUnit(item.available_quantity, item.unit)}</td>
                <td className="px-5 py-4">{supplierLookup[item.supplier] || supplierLookup[item.supplier_id] || item.supplier || item.supplier_id || 'Unknown'}</td>
                <td className="px-5 py-4 space-x-2">
                  <button
                    type="button"
                    onClick={() => onSelectItem(item)}
                    className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    Review
                  </button>
                  {onEditItem ? (
                    <button
                      type="button"
                      onClick={() => onEditItem(item)}
                      className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      Edit
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

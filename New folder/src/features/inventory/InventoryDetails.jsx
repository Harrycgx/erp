import { useEffect, useState } from 'react';
import StockMovementTable from './StockMovementTable';
import { getStockStatus, formatUnit } from '../../utils/inventoryHelpers';
import { calculateWastageValue, getInventoryHealth } from '../../utils/stockCalculations';
import { fetchStockMovements, insertStockMovement, updateInventoryItem } from '../../services/inventoryService';

const getStockDelta = (movementType, quantity) => {
  const qty = Number(quantity || 0);
  switch (movementType) {
    case 'IN':
    case 'RETURN':
      return qty;
    case 'OUT':
    case 'WASTAGE':
      return -qty;
    case 'ADJUSTMENT':
      return qty;
    default:
      return 0;
  }
};

export default function InventoryDetails({ item, supplier, onReloadItem }) {
  const [movements, setMovements] = useState([]);
  const [notes, setNotes] = useState(item?.notes || '');
  const [quantity, setQuantity] = useState('');
  const [movementType, setMovementType] = useState('IN');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(item?.notes || '');
    if (!item) return;
    const loadMovements = async () => {
      const { data } = await fetchStockMovements(item.id);
      setMovements(data || []);
    };
    loadMovements();
  }, [item]);

  const handleSaveNotes = async () => {
    if (!item) return;
    setSaving(true);
    await updateInventoryItem(item.id, { notes });
    await onReloadItem();
    setSaving(false);
  };

  const handleAddMovement = async () => {
    if (!item || !quantity) return;
    setSaving(true);
    const movement = {
      inventory_item_id: item.id,
      movement_type: movementType,
      quantity: Number(quantity),
      reference_order_id: null,
      notes: `${movementType} recorded via inventory dashboard`,
      created_by: 'system',
      created_at: new Date().toISOString(),
    };

    await insertStockMovement(movement);
    await updateInventoryItem(item.id, {
      current_stock: Math.max(0, Number(item.current_stock || 0) + getStockDelta(movementType, quantity)),
    });
    await onReloadItem();
    setQuantity('');
    setMovementType('IN');
    setSaving(false);
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Inventory details</p>
        <h2 className="mt-2 text-2xl font-black text-white">{item?.material_name || 'Select material'}</h2>
        {supplier ? (
          <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/85 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Primary supplier</p>
            <p className="mt-2 text-slate-400">{supplier.supplier_name}</p>
            <p className="text-slate-500">{supplier.contact_person || 'Contact person not specified'}</p>
            <p className="mt-2 text-slate-400">{supplier.phone || 'Phone not available'}</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-sm text-slate-400">Status</p>
          <p className="mt-2 text-lg font-semibold text-white">{getStockStatus(item)}</p>
          <p className="mt-1 text-sm text-slate-500">Health: {getInventoryHealth(item)}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-sm text-slate-400">Wastage estimate</p>
          <p className="mt-2 text-lg font-semibold text-white">{calculateWastageValue(item)} {item?.unit || 'units'}</p>
          <p className="mt-1 text-sm text-slate-500">{item?.wastage_percentage || 0}% of stock</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Remarks</p>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={5}
            className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 p-4 text-sm text-white outline-none"
            placeholder="Material notes, storage instructions, quality comments"
          />
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={saving}
            className="mt-4 rounded-full border border-slate-700 bg-slate-900/90 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save notes'}
          </button>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Stock movement</p>
          <div className="mt-4 space-y-4">
            <select
              value={movementType}
              onChange={(event) => setMovementType(event.target.value)}
              className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none"
            >
              {['IN', 'OUT', 'WASTAGE', 'RETURN', 'ADJUSTMENT'].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Quantity"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none"
            />
            <button
              type="button"
              onClick={handleAddMovement}
              disabled={saving || !quantity}
              className="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Recording…' : 'Record movement'}
            </button>
          </div>
        </div>
      </div>

      <StockMovementTable movements={movements} />
    </div>
  );
}

// ============================================================
// inventoryLedgerService.js
// Location: src/services/inventoryLedgerService.js
// ============================================================

import supabase from '../../../lib/supabase';

export const MOVEMENT_TYPES = ['Stock In', 'Stock Out', 'Adjustment'];

// ─── FETCH ledger entries ─────────────────────────────────────

export async function fetchLedgerEntries() {
  const { data, error } = await supabase
    .from('inventory_ledger')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// ─── FETCH materials for dropdown ────────────────────────────

export async function fetchMaterialsForSelect() {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('id, material_name, material_code, current_stock, unit')
    .order('material_name');

  if (error) throw new Error(error.message);
  return data || [];
}

// ─── POST transaction (ledger row + stock update, atomic) ─────

export async function postTransaction({ materialId, materialName, movementType, quantity, referenceNumber, notes, createdBy }) {
  const qty = Number(quantity);
  if (!qty || qty === 0) throw new Error('Quantity must be non-zero.');

  // 1. Fetch current stock
  const { data: item, error: fetchErr } = await supabase
    .from('inventory_items')
    .select('id, current_stock, material_name')
    .eq('id', materialId)
    .single();

  if (fetchErr) throw new Error(fetchErr.message);

  const currentStock = Number(item.current_stock ?? 0);

  // 2. Calculate new stock
  let delta = 0;
  if (movementType === 'Stock In')    delta = qty;
  if (movementType === 'Stock Out')   delta = -Math.abs(qty);
  if (movementType === 'Adjustment')  delta = qty; // signed by caller

  const newStock = currentStock + delta;
  if (newStock < 0) throw new Error(`Insufficient stock. Available: ${currentStock}. Cannot go below zero.`);

  // 3. Insert ledger row
  const { error: ledgerErr } = await supabase
    .from('inventory_ledger')
    .insert([{
      material_name:    materialName || item.material_name,
      movement_type:    movementType,
      quantity:         qty,
      reference_number: referenceNumber?.trim() || null,
      notes:            notes?.trim()           || null,
      created_by:       createdBy               || null,
    }]);

  if (ledgerErr) throw new Error(ledgerErr.message);

  // 4. Update inventory stock
  const { error: stockErr } = await supabase
    .from('inventory_items')
    .update({ current_stock: newStock })
    .eq('id', materialId);

  if (stockErr) throw new Error(stockErr.message);

  return { newStock, delta };
}
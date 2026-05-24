import supabase from '../lib/supabase';

export const INVENTORY_MOVEMENT_TYPES = {
  STOCK_IN: 'stock_in',
  STOCK_OUT: 'stock_out',
  RESERVED: 'reserved',
  DAMAGED: 'damaged',
  PRODUCTION_CONSUMPTION: 'production_consumption',
  RESERVATION_RELEASE: 'reservation_release',
  PURCHASE_RECEIPT: 'purchase_receipt',
};

export const INVENTORY_MOVEMENT_TYPES_EXTRA = {
  WASTAGE: 'wastage',
};

export const INVENTORY_MOVEMENT_TYPE_LIST = [
  INVENTORY_MOVEMENT_TYPES.STOCK_IN,
  INVENTORY_MOVEMENT_TYPES.STOCK_OUT,
  INVENTORY_MOVEMENT_TYPES.RESERVED,
  INVENTORY_MOVEMENT_TYPES.DAMAGED,
  INVENTORY_MOVEMENT_TYPES.PRODUCTION_CONSUMPTION,
  INVENTORY_MOVEMENT_TYPES_EXTRA.WASTAGE,
];

export function normalizeMovementType(type) {
  return String(type || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

export async function fetchInventoryMovements(itemId) {
  return supabase
    .from('inventory_movements')
    .select('*')
    .eq('inventory_item_id', itemId)
    .order('created_at', { ascending: false });
}

export async function fetchMovementsByReference({ referenceType, referenceId }) {
  return supabase
    .from('inventory_movements')
    .select('*, inventory_items(item_name, material_name)')
    .eq('reference_type', referenceType)
    .eq('reference_id', referenceId)
    .order('created_at', { ascending: false });
}

export async function insertInventoryMovement(movement) {
  const payload = {
    ...movement,
    movement_type: normalizeMovementType(movement.movement_type),
  };
  return supabase.from('inventory_movements').insert([payload]).select('*');
}

export async function recordInventoryMovement({
  inventoryItemId,
  movementType,
  quantity,
  referenceType = null,
  referenceId = null,
  notes = '',
  actorId = null,
}) {
  return insertInventoryMovement({
    inventory_item_id: inventoryItemId,
    movement_type: movementType,
    quantity: Number(quantity) || 0,
    reference_type: referenceType,
    reference_id: referenceId,
    notes,
    created_by: actorId,
  });
}

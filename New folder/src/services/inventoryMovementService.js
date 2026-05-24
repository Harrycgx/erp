import supabase from '../lib/supabase';

export async function fetchInventoryMovements(itemId) {
  return supabase
    .from('inventory_movements')
    .select('*')
    .eq('inventory_item_id', itemId)
    .order('created_at', { ascending: false });
}

export async function insertInventoryMovement(movement) {
  return supabase.from('inventory_movements').insert([movement]);
}

export const INVENTORY_MOVEMENT_TYPES = [
  'stock_in',
  'stock_out',
  'reserved',
  'damaged',
  'production_consumption',
  'purchase_receipt',
  'reservation_release',
];

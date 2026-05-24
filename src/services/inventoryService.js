import supabase from '../lib/supabase';

function normalizeInventoryItem(item) {
  const stockQuantity = Number(item.stock_quantity ?? item.current_stock ?? 0);
  const reservedQuantity = Number(item.reserved_quantity ?? item.reserved_stock ?? 0);
  const availableQuantity = Number(item.available_quantity ?? stockQuantity - reservedQuantity);

  return {
    ...item,
    item_name: item.item_name || item.material_name,
    material_name: item.material_name || item.item_name,
    stock_quantity: stockQuantity,
    reserved_quantity: reservedQuantity,
    available_quantity: availableQuantity,
    reorder_level: Number(item.reorder_level ?? item.minimum_stock ?? 0),
    warehouse_location: item.warehouse_location || item.storage_location || '',
  };
}

function normalizeMutations(updates) {
  const stockQuantity = updates.stock_quantity ?? updates.current_stock;
  const reservedQuantity = updates.reserved_quantity ?? updates.reserved_stock;
  const availableQuantity = updates.available_quantity ?? (stockQuantity !== undefined && reservedQuantity !== undefined ? Number(stockQuantity) - Number(reservedQuantity) : undefined);

  return {
    ...updates,
    stock_quantity: stockQuantity,
    reserved_quantity: reservedQuantity,
    available_quantity: availableQuantity,
    item_name: updates.item_name ?? updates.material_name,
    warehouse_location: updates.warehouse_location ?? updates.storage_location,
  };
}

export async function fetchInventoryItems() {
  const result = await supabase.from('inventory_items').select('*').order('material_name', { ascending: true });
  if (result.error) return result;
  return { data: (result.data || []).map(normalizeInventoryItem), error: null };
}

export async function fetchInventoryItemById(id) {
  const result = await supabase.from('inventory_items').select('*').eq('id', id).single();
  if (result.error) return result;
  return { data: normalizeInventoryItem(result.data), error: null };
}

export async function insertInventoryItem(item) {
  const payload = normalizeMutations({
    ...item,
    stock_quantity: item.stock_quantity ?? item.current_stock,
    reserved_quantity: item.reserved_quantity ?? item.reserved_stock,
    available_quantity: item.available_quantity ?? (Number((item.stock_quantity ?? item.current_stock) || 0) - Number((item.reserved_quantity ?? item.reserved_stock) || 0)),
    item_name: item.item_name ?? item.material_name,
    warehouse_location: item.warehouse_location ?? item.storage_location,
  });
  return supabase.from('inventory_items').insert([payload]);
}

export async function updateInventoryItem(id, updates) {
  const payload = normalizeMutations({
    ...updates,
    stock_quantity: updates.stock_quantity ?? updates.current_stock,
    reserved_quantity: updates.reserved_quantity ?? updates.reserved_stock,
    available_quantity: updates.available_quantity,
  });
  return supabase.from('inventory_items').update(payload).eq('id', id);
}

export async function deleteInventoryItem(id) {
  return supabase.from('inventory_items').delete().eq('id', id);
}

export async function fetchStockMovements(itemId) {
  const result = await supabase
    .from('inventory_movements')
    .select('*')
    .eq('inventory_item_id', itemId)
    .order('created_at', { ascending: false });
  if (result.error) {
    return supabase
      .from('stock_movements')
      .select('*')
      .eq('inventory_item_id', itemId)
      .order('created_at', { ascending: false });
  }
  return result;
}

export async function insertStockMovement(movement) {
  return supabase.from('inventory_movements').insert([movement]);
}

export async function fetchLowStockItems() {
  const { data, error } = await fetchInventoryItems();
  if (error) return { data: [], error };

  return {
    data: (data || []).filter((item) => Number(item.available_quantity || 0) <= Number(item.reorder_level || 0)),
    error: null,
  };
}

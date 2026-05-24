import supabase from '../lib/supabase';

export async function fetchPurchaseOrders() {
  return supabase.from('purchase_orders').select('*').order('expected_delivery', { ascending: false });
}

export async function fetchPurchaseOrderById(id) {
  return supabase.from('purchase_orders').select('*').eq('id', id).single();
}

export async function insertPurchaseOrder(order) {
  return supabase.from('purchase_orders').insert([order]);
}

export async function updatePurchaseOrder(id, updates) {
  return supabase.from('purchase_orders').update(updates).eq('id', id);
}

export async function fetchGoodsReceipts() {
  return supabase.from('goods_receipts').select('*').order('received_at', { ascending: false });
}

export async function fetchProcurementRequests() {
  return supabase.from('procurement_requests').select('*').order('created_at', { ascending: false });
}

export async function createProcurementRequest(request) {
  return supabase.from('procurement_requests').insert([request]);
}

export async function updateProcurementRequest(id, updates) {
  return supabase.from('procurement_requests').update(updates).eq('id', id);
}

export async function receivePurchaseOrder({ purchaseOrderId, inventoryItemId, quantity, actorId }) {
  const receiptResult = await supabase.from('goods_receipts').insert([
    {
      purchase_order_id: purchaseOrderId,
      status: 'Received',
      metadata: { inventory_item_id: inventoryItemId, quantity },
    },
  ]);
  if (receiptResult.error) return receiptResult;

  const itemResult = await supabase.from('inventory_items').select('*').eq('id', inventoryItemId).single();
  if (itemResult.error) return itemResult;

  const nextStock = Number(itemResult.data.current_stock || 0) + Number(quantity || 0);
  const updateResult = await supabase.from('inventory_items').update({ current_stock: nextStock }).eq('id', inventoryItemId);
  if (updateResult.error) return updateResult;

  await supabase.from('inventory_movements').insert([
    {
      inventory_item_id: inventoryItemId,
      movement_type: 'purchase_receipt',
      reference_type: 'purchase_order',
      reference_id: purchaseOrderId,
      quantity: Number(quantity || 0),
      notes: `Received purchase order ${purchaseOrderId}`,
      created_by: actorId,
    },
  ]);

  return receiptResult;
}

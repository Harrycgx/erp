import supabase from '../lib/supabase';

export async function fetchPurchaseOrders() {
  return supabase.from('purchase_orders').select('*').order('created_at', { ascending: false });
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

export async function approvePurchaseOrder(id) {
  return updatePurchaseOrder(id, { po_status: 'Approved' });
}

export async function cancelPurchaseOrder(id) {
  return updatePurchaseOrder(id, { po_status: 'Cancelled' });
}

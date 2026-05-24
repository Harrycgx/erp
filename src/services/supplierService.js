import supabase from '../lib/supabase';

export async function fetchSuppliers() {
  return supabase.from('suppliers').select('*').order('supplier_name', { ascending: true });
}

export async function fetchSupplierById(id) {
  return supabase.from('suppliers').select('*').eq('id', id).single();
}

export async function insertSupplier(supplier) {
  return supabase.from('suppliers').insert([supplier]);
}

export async function updateSupplier(id, updates) {
  return supabase.from('suppliers').update(updates).eq('id', id);
}

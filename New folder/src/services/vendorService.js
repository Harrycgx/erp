import supabase from '../lib/supabase';

export async function fetchVendors() {
  return supabase.from('vendors').select('*').order('vendor_name', { ascending: true });
}

export async function fetchVendorById(id) {
  return supabase.from('vendors').select('*').eq('id', id).single();
}

export async function insertVendor(vendor) {
  return supabase.from('vendors').insert([vendor]);
}

export async function updateVendor(id, updates) {
  return supabase.from('vendors').update(updates).eq('id', id);
}

export async function deleteVendor(id) {
  return supabase.from('vendors').delete().eq('id', id);
}

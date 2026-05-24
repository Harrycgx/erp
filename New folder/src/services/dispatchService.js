import supabase from '../lib/supabase';

export async function fetchDispatchRecords() {
  return supabase.from('dispatch_records').select('*').order('dispatch_date', { ascending: false });
}

export async function insertDispatchRecord(record) {
  return supabase.from('dispatch_records').insert([record]);
}

export async function updateDispatchRecord(id, updates) {
  return supabase.from('dispatch_records').update(updates).eq('id', id);
}

export async function fetchDispatchRecordById(id) {
  return supabase.from('dispatch_records').select('*').eq('id', id).single();
}

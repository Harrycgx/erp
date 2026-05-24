import supabase from '../lib/supabase';

export async function fetchEmployees() {
  return supabase.from('employees').select('*').order('full_name', { ascending: true });
}

export async function fetchEmployeeById(id) {
  return supabase.from('employees').select('*').eq('id', id).single();
}

export async function insertEmployee(employee) {
  return supabase.from('employees').insert([employee]);
}

export async function updateEmployee(id, updates) {
  return supabase.from('employees').update(updates).eq('id', id);
}

export async function deactivateEmployee(id) {
  return updateEmployee(id, { status: 'Inactive', employment_status: 'inactive' });
}

import supabase from '../lib/supabase';

export async function fetchEmployees() {
  return supabase.from('employees').select('*').order('full_name', { ascending: true });
}

export async function fetchEmployeeById(id) {
  return supabase.from('employees').select('*').eq('id', id).single();
}

export async function insertEmployee(employee) {
  // Check for duplicate code or email
  const { data: existing } = await supabase
    .from('employees')
    .select('id')
    .or(`employee_code.eq.${employee.employee_code},email.eq.${employee.email}`)
    .maybeSingle();

  if (existing) {
    return { error: new Error('An employee with this code or email already exists.') };
  }

  return supabase.from('employees').insert([employee]);
}

export async function updateEmployee(id, updates) {
  return supabase.from('employees').update(updates).eq('id', id);
}

export async function deactivateEmployee(id) {
  return updateEmployee(id, { status: 'Inactive', employment_status: 'inactive' });
}

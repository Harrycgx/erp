import supabase from '../lib/supabase';

export async function fetchLeaveRequests() {
  return supabase.from('leave_requests').select('*').order('created_at', { ascending: false });
}

export async function fetchLeaveRequestsByEmployee(employeeId) {
  return supabase.from('leave_requests').select('*').eq('employee_id', employeeId).order('created_at', { ascending: false });
}

export async function insertLeaveRequest(request) {
  return supabase.from('leave_requests').insert([request]);
}

export async function updateLeaveRequest(id, updates) {
  return supabase.from('leave_requests').update(updates).eq('id', id);
}

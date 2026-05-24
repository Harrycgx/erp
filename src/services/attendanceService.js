import supabase from '../lib/supabase';

export async function fetchAttendanceRecords() {
  return supabase.from('attendance').select('*').order('attendance_date', { ascending: false });
}

export async function fetchAttendanceByEmployee(employeeId) {
  return supabase.from('attendance').select('*').eq('employee_id', employeeId).order('attendance_date', { ascending: false });
}

export async function insertAttendance(record) {
  return supabase.from('attendance').insert([record]);
}

export async function updateAttendance(id, updates) {
  return supabase.from('attendance').update(updates).eq('id', id);
}

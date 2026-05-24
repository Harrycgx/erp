import supabase from '../lib/supabase';

export async function fetchActivityLogs(limit = 25) {
  return supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit);
}

export async function insertActivityLog(activity) {
  return supabase.from('activity_logs').insert([activity]);
}

export async function fetchNotifications() {
  return supabase.from('notifications').select('*').order('created_at', { ascending: false });
}

export async function markNotificationRead(id) {
  return supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

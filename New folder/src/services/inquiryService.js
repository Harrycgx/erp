import supabase from '../lib/supabase';

export async function fetchInquiries() {
  return supabase.from('inquiries').select('*').order('created_at', { ascending: false });
}

export async function fetchInquiryById(id) {
  return supabase.from('inquiries').select('*').eq('id', id).single();
}

export async function insertInquiry(inquiry) {
  return supabase.from('inquiries').insert([inquiry]);
}

export async function updateInquiry(id, updates) {
  return supabase.from('inquiries').update(updates).eq('id', id);
}

export async function deleteInquiry(id) {
  return supabase.from('inquiries').delete().eq('id', id);
}

export async function fetchCustomers() {
  return supabase.from('customers').select('*').order('created_at', { ascending: false });
}

export async function fetchCustomerById(id) {
  return supabase.from('customers').select('*').eq('id', id).single();
}

export async function insertCustomer(customer) {
  return supabase.from('customers').insert([customer]);
}

export async function updateCustomer(id, updates) {
  return supabase.from('customers').update(updates).eq('id', id);
}

export async function fetchInquiriesByCustomer(customerId) {
  return supabase.from('inquiries').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
}

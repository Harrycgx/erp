import supabase from '../lib/supabase';
import { ROLES } from '../config/permissions';

const PROFILE_SELECT = 'id, auth_user_id, full_name, email, phone, avatar_url, role, is_active, created_at';

export async function getProfileById(id) {
  return supabase.from('profiles').select(PROFILE_SELECT).eq('id', id).single();
}

export async function createProfile(profileData) {
  const payload = {
    id: profileData.id,
    auth_user_id: profileData.auth_user_id || profileData.id,
    full_name: profileData.full_name,
    email: profileData.email,
    phone: profileData.phone,
    avatar_url: profileData.avatar_url || null,
    role: profileData.role,
  };
  return supabase.from('profiles').insert([payload]).select(PROFILE_SELECT).single();
}

export async function upsertProfile(profileData) {
  const payload = {
    id: profileData.id,
    auth_user_id: profileData.auth_user_id || profileData.id,
    full_name: profileData.full_name,
    email: profileData.email,
    phone: profileData.phone,
    avatar_url: profileData.avatar_url || null,
    role: profileData.role,
  };
  return supabase.from('profiles').upsert([payload], { onConflict: 'id' }).select(PROFILE_SELECT).single();
}

export async function createCustomerForProfile(profileId, customerData) {
  return supabase
    .from('customers')
    .insert([
      {
        profile_id: profileId,
        full_name: customerData.full_name,
        company_name: customerData.company_name,
        contact_name: customerData.full_name,
        email: customerData.email,
        phone: customerData.phone,
        gst_number: customerData.gst_number,
        billing_address: customerData.billing_address,
        shipping_address: customerData.shipping_address,
      },
    ])
    .select('*')
    .single();
}

export async function createVendorForProfile(profileId, vendorData) {
  return supabase
    .from('vendors')
    .insert([
      {
        profile_id: profileId,
        vendor_name: vendorData.company_name || vendorData.full_name,
        contact_person: vendorData.full_name,
        phone: vendorData.phone,
        email: vendorData.email,
        address: vendorData.address || vendorData.billing_address,
        category: vendorData.vendor_type || vendorData.category || 'general',
        vendor_type: vendorData.vendor_type || vendorData.category || 'general',
        gst_number: vendorData.gst_number,
        payment_terms: vendorData.payment_terms,
      },
    ])
    .select('*')
    .single();
}

export async function createEmployeeForProfile(profileId, employeeData) {
  return supabase
    .from('employees')
    .insert([
      {
        profile_id: profileId,
        employee_code: employeeData.employee_code,
        full_name: employeeData.full_name,
        email: employeeData.email,
        phone: employeeData.phone,
        department: employeeData.department || 'Operations',
        designation: employeeData.designation,
        joining_date: employeeData.joining_date,
        salary: employeeData.salary ? Number(employeeData.salary) : 0,
      },
    ])
    .select('*')
    .single();
}

export async function createRoleLinkedRecord(profileId, role, payload) {
  if (role === ROLES.CUSTOMER) {
    return createCustomerForProfile(profileId, payload);
  }

  if (role === ROLES.VENDOR) {
    return createVendorForProfile(profileId, payload);
  }

  if (role === ROLES.STAFF || role === ROLES.ADMIN) {
    return createEmployeeForProfile(profileId, payload);
  }

  return {
    error: new Error(`Unsupported role: ${role}`),
  };
}

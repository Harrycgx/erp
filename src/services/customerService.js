import supabase from "../lib/supabase";

export async function fetchCustomers() {
  return supabase
    .from("customers")
    .select("*")
    .order("created_at", {
      ascending: false,
    });
}

export async function createCustomer(
  payload
) {
  return supabase
    .from("customers")
    .insert(payload)
    .select()
    .single();
}

export async function updateCustomer(
  id,
  payload
) {
  return supabase
    .from("customers")
    .update(payload)
    .eq("id", id);
}
import supabase from "../lib/supabase";

export async function fetchCustomers() {
  // Only selects the 3 columns verified to exist in your live database
  const { data, error } = await supabase
    .from("customers")
    .select("customer_id, legal_entity_name, plant_id")
    .order("legal_entity_name", { ascending: true });

  if (error) {
    console.error("BoxIQ fetchCustomers Error:", error.message);
    return { data: [], error };
  }

  return { data, error: null };
}

export async function createCustomer(payload) {
  // Maps fields safely to match only your live table columns
  const dbPayload = {
    legal_entity_name: payload.company_name,
    plant_id: payload.plant_id || null, // Structural fallback for your schema
  };

  const { data, error } = await supabase
    .from("customers")
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error("BoxIQ createCustomer Error:", error.message);
    return { data: null, error };
  }

  return { data, error: null };
}
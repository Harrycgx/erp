import supabase from "../lib/supabase";

export async function fetchQuotations() {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch Error:", error);
    return [];
  }

  return data;
}

export async function createQuotation(quotation) {
  const payload = {
    ...quotation,

    customer_id: quotation.customer_id || null,
    product_id: quotation.product_id || null,
    artwork_id: quotation.artwork_id || null,
  };

  const { data, error } = await supabase
    .from("quotations")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Create Error:", error);
    return null;
  }

  return data;
}

export async function updateQuotation(id, updates) {
  const payload = {
    ...updates,

    customer_id: updates.customer_id || null,
    product_id: updates.product_id || null,
    artwork_id: updates.artwork_id || null,
  };

  const { data, error } = await supabase
    .from("quotations")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Error:", error);
    return null;
  }

  return data;
}
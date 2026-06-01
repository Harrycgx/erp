import supabase from "../../../lib/supabase";

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
  const { data, error } = await supabase
    .from("quotations")
    .insert([quotation])
    .select()
    .single();

  if (error) {
    console.error("Create Error:", error);
    return null;
  }
  return data;
}

export async function updateQuotation(id, updates) {
  const { data, error } = await supabase
    .from("quotations")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Error:", error);
    return null;
  }

  return data;
}
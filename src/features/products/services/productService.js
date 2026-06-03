import supabase from "../../../lib/supabase";

export async function fetchProducts({ search = "", activeOnly = false } = {}) {
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });
  if (activeOnly) query = query.eq("is_active", true);
  if (search.trim()) {
    query = query.or(`product_name.ilike.%${search}%,product_code.ilike.%${search}%,customer_name.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchProductById(id) {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createProduct(payload) {
  const { data, error } = await supabase.from("products").insert([sanitize(payload)]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(id, payload) {
  const { data, error } = await supabase.from("products").update(sanitize(payload)).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function toggleProductActive(id, isActive) {
  return updateProduct(id, { is_active: isActive });
}

export async function fetchCustomersForSelect() {
  const { data, error } = await supabase
    .from("customers")
    .select("id, company_name, phone")
    .order("company_name");
  if (error) throw new Error(error.message);
  return (data || []).map((c) => ({ id: c.id, customer_name: c.company_name, phone: c.phone }));
}

const PRODUCT_FIELDS = [
  "product_code","product_name","customer_id","customer_name",
  "box_type","length","width","height","ply_type","flute_type",
  "gsm","printing_type","is_active","notes",
];

function sanitize(payload) {
  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([k]) =>
      PRODUCT_FIELDS.includes(k)
    )
  );

  if (cleaned.customer_id === "") {
    cleaned.customer_id = null;
  }

  return cleaned;
}

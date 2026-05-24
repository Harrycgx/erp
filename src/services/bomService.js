import supabase from '../lib/supabase';

export async function fetchBOMs() {
  return supabase.from('bill_of_materials').select('*').order('created_at', { ascending: false });
}

export async function fetchBOMById(id) {
  return supabase.from('bill_of_materials').select('*').eq('id', id).single();
}

export async function fetchBOMItems(bomId) {
  return supabase.from('bom_items').select('*').eq('bom_id', bomId).order('created_at', { ascending: true });
}

export async function fetchBOMForProduct(productName) {
  return supabase
    .from('bill_of_materials')
    .select('*, bom_items(*)')
    .ilike('product_name', `%${String(productName || '').trim()}%`)
    .limit(1)
    .maybeSingle();
}

export async function insertBillOfMaterials(bom) {
  return supabase.from('bill_of_materials').insert([bom]);
}

export async function insertBOMItem(item) {
  return supabase.from('bom_items').insert([item]);
}

export function calculateMaterialRequirements(bom, quantity = 1) {
  if (!bom?.bom_items?.length) return [];
  const factor = Number(quantity || 0);
  return bom.bom_items.map((item) => ({
    ...item,
    quantity_required: Number(item.quantity_required || 0) * factor,
  }));
}

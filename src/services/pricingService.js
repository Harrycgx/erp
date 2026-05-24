import supabase from '../lib/supabase';

export async function fetchPricingRule() {
  return supabase.from('pricing_rules').select('*').order('updated_at', { ascending: false }).limit(1).single();
}

export async function insertPricingRule(rule) {
  return supabase.from('pricing_rules').insert([rule]);
}

export async function updatePricingRule(id, updates) {
  return supabase.from('pricing_rules').update(updates).eq('id', id);
}

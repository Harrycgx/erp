import supabase from '../lib/supabase';

export async function fetchProductionPlans() {
  return supabase.from('production_plans').select('*').order('planned_start', { ascending: true });
}

export async function fetchProductionPlanById(id) {
  return supabase.from('production_plans').select('*').eq('id', id).single();
}

export async function insertProductionPlan(plan) {
  return supabase.from('production_plans').insert([plan]);
}

export async function updateProductionPlan(id, updates) {
  return supabase.from('production_plans').update(updates).eq('id', id);
}

import supabase from '../lib/supabase';
import { buildProductionNumber, estimateCompletionDate } from '../utils/productionHelpers';

export async function fetchProductionJobs() {
  return supabase.from('production_jobs').select('*').order('created_at', { ascending: false });
}

export async function fetchProductionJobById(id) {
  return supabase.from('production_jobs').select('*').eq('id', id).single();
}

export async function fetchProductionStages(jobId) {
  return supabase.from('production_stages').select('*').eq('production_job_id', jobId).order('created_at', { ascending: true });
}

export async function insertProductionJob(job) {
  return supabase.from('production_jobs').insert([job]);
}

export async function insertProductionStages(stages) {
  return supabase.from('production_stages').insert(stages);
}

export async function updateProductionJob(id, updates) {
  return supabase.from('production_jobs').update(updates).eq('id', id);
}

export async function deleteProductionJob(id) {
  return supabase.from('production_jobs').delete().eq('id', id);
}

export async function createProductionJobFromOrder(order, bomRequirements = []) {
  const jobPayload = {
    production_number: buildProductionNumber(),
    order_id: order.id,
    order_number: order.order_number,
    box_type: order.box_type,
    quantity: Number(order.quantity || 0),
    production_stage: 'pending',
    status: 'Pending',
    priority: order.priority || 'Normal',
    assigned_to: order.assigned_to || null,
    estimated_completion_date: order.estimated_completion_date || estimateCompletionDate(order.quantity, order.priority),
    notes: `Production job created from sales order ${order.order_number}`,
    metadata: {
      ...(order.metadata || {}),
      bom_requirements: bomRequirements,
      quotation_id: order.quotation_id,
    },
  };

  const jobResult = await insertProductionJob(jobPayload).select('*').single();
  if (jobResult.error) return jobResult;

  if (bomRequirements.length) {
    await insertProductionStages([
      {
        production_job_id: jobResult.data.id,
        stage_name: 'pending',
        status: 'completed',
        started_at: new Date().toISOString(),
      },
    ]);
  }

  return { data: jobResult.data, error: null };
}

export async function updateProductionStatus(id, status) {
  const allowed = ['pending', 'paper_ordered', 'printing', 'punching', 'pasting', 'qc', 'dispatch_ready', 'dispatched', 'delivered'];
  if (!allowed.includes(status)) {
    return { data: null, error: new Error('Invalid production status.') };
  }
  return updateProductionJob(id, { production_stage: status });
}

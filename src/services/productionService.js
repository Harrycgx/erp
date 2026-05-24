import supabase from '../lib/supabase';
import { fetchBOMForProduct, calculateMaterialRequirements } from './bomService';
import { fetchReservationsForSalesOrder } from './inventoryReservationService';
import { fetchSalesOrderWithItems, updateSalesOrderStatus } from './salesOrderService';
import { SALES_ORDER_STATUSES } from '../utils/salesOrderHelpers';
import {
  estimateCompletionDate,
  generateProductionNumber,
  normalizeStage,
  PRODUCTION_STAGES,
} from '../utils/productionHelpers';

export const PRODUCTION_JOB_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

function mapJobRow(row = {}) {
  return {
    ...row,
    production_stage: normalizeStage(row.production_stage),
    sales_order_id: row.sales_order_id || row.metadata?.sales_order_id || null,
  };
}

export function validateStageTransition(currentStage, nextStage) {
  const current = normalizeStage(currentStage);
  const next = normalizeStage(nextStage);
  const currentIndex = PRODUCTION_STAGES.indexOf(current);
  const nextIndex = PRODUCTION_STAGES.indexOf(next);

  if (nextIndex === -1) {
    return { valid: false, message: `Invalid production stage: ${next}.` };
  }
  if (currentIndex === -1) {
    return { valid: true, message: '' };
  }
  if (nextIndex < currentIndex) {
    return { valid: false, message: `Cannot move backward from ${current} to ${next}.` };
  }
  return { valid: true, message: '' };
}

export async function fetchNextProductionNumberPreview() {
  const { count, error } = await supabase.from('production_jobs').select('id', { count: 'exact', head: true });
  if (error) return generateProductionNumber(1);
  return generateProductionNumber((count || 0) + 1);
}

export async function fetchProductionJobBySalesOrderId(salesOrderId) {
  const byColumn = await supabase
    .from('production_jobs')
    .select('*')
    .eq('sales_order_id', salesOrderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!byColumn.error && byColumn.data) {
    return { data: mapJobRow(byColumn.data), error: null };
  }

  const byMetadata = await supabase
    .from('production_jobs')
    .select('*')
    .contains('metadata', { sales_order_id: salesOrderId })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byMetadata.error) return { data: null, error: byMetadata.error };
  return { data: byMetadata.data ? mapJobRow(byMetadata.data) : null, error: null };
}

export async function fetchProductionJobs(filters = {}) {
  let query = supabase.from('production_jobs').select('*').order('created_at', { ascending: false });

  if (filters.stage) {
    query = query.eq('production_stage', normalizeStage(filters.stage));
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const result = await query;
  if (result.error) return result;
  return { data: (result.data || []).map(mapJobRow), error: null };
}

export async function fetchProductionJobById(id) {
  const result = await supabase.from('production_jobs').select('*').eq('id', id).single();
  if (result.error) return result;
  return { data: mapJobRow(result.data), error: null };
}

export async function fetchProductionJobWithDetails(id) {
  const [jobResult, stagesResult] = await Promise.all([
    fetchProductionJobById(id),
    fetchProductionStages(id),
  ]);

  if (jobResult.error) return { data: null, error: jobResult.error };

  let salesOrder = null;
  const salesOrderId = jobResult.data.sales_order_id || jobResult.data.metadata?.sales_order_id;
  if (salesOrderId) {
    const soResult = await fetchSalesOrderWithItems(salesOrderId);
    if (!soResult.error) salesOrder = soResult.data;
  }

  let reservationMovements = [];
  if (salesOrderId) {
    const { data } = await fetchReservationsForSalesOrder(salesOrderId);
    reservationMovements = data || [];
  }

  return {
    data: {
      ...jobResult.data,
      stages: stagesResult.data || [],
      sales_order: salesOrder,
      reservation_movements: reservationMovements,
    },
    error: stagesResult.error,
  };
}

export async function fetchProductionStages(jobId) {
  const result = await supabase
    .from('production_stages')
    .select('*')
    .eq('production_job_id', jobId)
    .order('created_at', { ascending: true });

  if (result.error) return result;

  const sorted = (result.data || []).sort(
    (a, b) => PRODUCTION_STAGES.indexOf(normalizeStage(a.stage_name)) - PRODUCTION_STAGES.indexOf(normalizeStage(b.stage_name))
  );

  return { data: sorted, error: null };
}

function buildInitialStageRows(productionJobId) {
  const now = new Date().toISOString();
  return PRODUCTION_STAGES.map((stageName, index) => ({
    production_job_id: productionJobId,
    stage_name: stageName,
    status: index === 0 ? 'in_progress' : 'pending',
    started_at: index === 0 ? now : null,
    completed_at: null,
    notes: null,
  }));
}

async function syncStageRowsForTransition(jobId, previousStage, nextStage) {
  const { data: stages } = await fetchProductionStages(jobId);
  if (!stages?.length) return;

  const now = new Date().toISOString();
  const updates = stages.map((stage) => {
    const name = normalizeStage(stage.stage_name);
    const next = normalizeStage(nextStage);
    const prev = normalizeStage(previousStage);

    if (name === prev && stage.status !== 'completed') {
      return { id: stage.id, status: 'completed', completed_at: now };
    }
    if (name === next && stage.status === 'pending') {
      return { id: stage.id, status: 'in_progress', started_at: stage.started_at || now };
    }
    return null;
  }).filter(Boolean);

  for (const patch of updates) {
    const { id, ...fields } = patch;
    await supabase.from('production_stages').update(fields).eq('id', id);
  }
}

export async function createProductionJob({
  salesOrder,
  bomRequirements = [],
  reservations = [],
  actorId = null,
  notes = '',
} = {}) {
  if (!salesOrder?.id) {
    return { data: null, error: new Error('Sales order is required to create a production job.') };
  }

  const existing = await fetchProductionJobBySalesOrderId(salesOrder.id);
  if (existing.error) return { data: null, error: existing.error };
  if (existing.data?.id) {
    return {
      data: null,
      error: new Error(
        `Production job already exists for this sales order (${existing.data.production_number || existing.data.id}).`
      ),
    };
  }

  const previewNumber = await fetchNextProductionNumberPreview();
  const estimatedCompletion = estimateCompletionDate(salesOrder.quantity, salesOrder.priority);

  const jobPayload = {
    production_number: previewNumber,
    sales_order_id: salesOrder.id,
    order_id: salesOrder.metadata?.legacy_order_id || null,
    order_number: salesOrder.sales_order_number,
    box_type: salesOrder.box_type,
    quantity: Number(salesOrder.quantity) || 0,
    production_stage: 'pending',
    status: PRODUCTION_JOB_STATUS.ACTIVE,
    dispatch_status: 'not_ready',
    priority: salesOrder.priority === 'high' ? 'High' : 'Normal',
    assigned_to: salesOrder.assigned_to || null,
    estimated_completion: estimatedCompletion,
    estimated_completion_date: estimatedCompletion,
    started_at: new Date().toISOString(),
    notes: notes || `Production for SO ${salesOrder.sales_order_number}`,
    metadata: {
      sales_order_id: salesOrder.id,
      sales_order_number: salesOrder.sales_order_number,
      quotation_id: salesOrder.quotation_id,
      sales_order_snapshot: {
        id: salesOrder.id,
        sales_order_number: salesOrder.sales_order_number,
        customer_id: salesOrder.customer_id,
        box_type: salesOrder.box_type,
        quantity: salesOrder.quantity,
        total_amount: salesOrder.total_amount,
        items: salesOrder.items || [],
      },
      bom_requirements: bomRequirements,
      reservation_refs: reservations,
      created_by: actorId,
    },
  };

  const jobResult = await supabase.from('production_jobs').insert([jobPayload]).select('*').single();
  if (jobResult.error) return { data: null, error: jobResult.error };

  const stageRows = buildInitialStageRows(jobResult.data.id);
  const stagesResult = await supabase.from('production_stages').insert(stageRows).select('*');
  if (stagesResult.error) {
    await supabase.from('production_jobs').delete().eq('id', jobResult.data.id);
    return { data: null, error: stagesResult.error };
  }

  await updateSalesOrderStatus(salesOrder.id, SALES_ORDER_STATUSES.IN_PRODUCTION, {
    production_stage: 'pending',
  });

  await supabase.from('activity_logs').insert([
    {
      actor_id: actorId,
      customer_id: salesOrder.customer_id,
      activity_type: 'production_job_created',
      message: `Production job ${jobResult.data.production_number} created for sales order ${salesOrder.sales_order_number}.`,
      metadata: {
        production_job_id: jobResult.data.id,
        sales_order_id: salesOrder.id,
      },
    },
  ]);

  return {
    data: {
      ...mapJobRow(jobResult.data),
      stages: stagesResult.data || [],
    },
    error: null,
  };
}

/**
 * Start production from a confirmed sales order (SO → PRD + stage rows).
 */
export async function startProductionFromSalesOrder({ salesOrderId, actorId = null, notes = '' } = {}) {
  const soResult = await fetchSalesOrderWithItems(salesOrderId);
  if (soResult.error) return { data: null, error: soResult.error };

  const salesOrder = soResult.data;
  const bomResult = await fetchBOMForProduct(salesOrder.box_type || '');
  const requirements =
    bomResult.error || !bomResult.data
      ? salesOrder.metadata?.bom_requirements || []
      : calculateMaterialRequirements(bomResult.data, salesOrder.quantity || 0);

  const { data: reservationMovements } = await fetchReservationsForSalesOrder(salesOrderId);
  const reservations = (reservationMovements || [])
    .filter((m) => m.movement_type === 'reserved')
    .map((m) => ({
      inventory_item_id: m.inventory_item_id,
      quantity: m.quantity,
    }));

  return createProductionJob({
    salesOrder,
    bomRequirements: requirements,
    reservations,
    actorId,
    notes,
  });
}

export async function updateProductionJob(id, updates) {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };
  if (updates.production_stage) {
    payload.production_stage = normalizeStage(updates.production_stage);
  }

  const result = await supabase.from('production_jobs').update(payload).eq('id', id).select('*').single();
  if (result.error) return result;
  return { data: mapJobRow(result.data), error: null };
}

export async function updateProductionStage(jobId, nextStage, options = {}) {
  const { actorId = null, consumeMaterials = false } = options;
  const jobResult = await fetchProductionJobById(jobId);
  if (jobResult.error) return { data: null, error: jobResult.error };

  const job = jobResult.data;
  const transition = validateStageTransition(job.production_stage, nextStage);
  if (!transition.valid) {
    return { data: null, error: new Error(transition.message) };
  }

  const stage = normalizeStage(nextStage);
  const updates = {
    production_stage: stage,
    updated_at: new Date().toISOString(),
  };

  if (stage === 'dispatch_ready') {
    updates.dispatch_status = 'ready';
    const salesOrderId = job.sales_order_id || job.metadata?.sales_order_id;
    if (salesOrderId) {
      await updateSalesOrderStatus(salesOrderId, SALES_ORDER_STATUSES.DISPATCH_READY, {
        production_stage: stage,
      });
    }
  }

  if (stage === 'dispatched') {
    updates.dispatch_status = 'dispatched';
    const salesOrderId = job.sales_order_id || job.metadata?.sales_order_id;
    if (salesOrderId) {
      await updateSalesOrderStatus(salesOrderId, SALES_ORDER_STATUSES.DISPATCHED, {
        production_stage: stage,
      });
    }
  }

  if (consumeMaterials && stage === 'printing') {
    const { consumeReservedInventory } = await import('./productionConsumptionService');
    const requirements = job.metadata?.bom_requirements || [];
    const consumption = await consumeReservedInventory({
      requirements,
      productionJobId: jobId,
      salesOrderId: job.sales_order_id || job.metadata?.sales_order_id,
      actorId,
    });
    if (consumption.error) {
      return { data: null, error: consumption.error };
    }
    updates.metadata = {
      ...(job.metadata || {}),
      materials_consumed_at: new Date().toISOString(),
      consumption: consumption.data,
    };
  }

  await syncStageRowsForTransition(jobId, job.production_stage, stage);

  const updateResult = await updateProductionJob(jobId, updates);
  if (updateResult.error) return updateResult;

  if (stage === 'dispatch_ready') {
    const salesOrderId = job.sales_order_id || job.metadata?.sales_order_id;
    if (salesOrderId) {
      const { generateInvoiceFromSalesOrder } = await import('./invoiceService');
      const invoiceResult = await generateInvoiceFromSalesOrder({
        salesOrderId,
        actorId,
        productionJobId: jobId,
        notes: `Invoice generated when job ${job.production_number} reached dispatch ready.`,
      });

      if (!invoiceResult.error && invoiceResult.data) {
        await updateProductionJob(jobId, {
          metadata: {
            ...(updateResult.data?.metadata || job.metadata || {}),
            invoice_id: invoiceResult.data.id,
            invoice_number: invoiceResult.data.invoice_number,
            invoiced_at: new Date().toISOString(),
          },
        });
      } else if (invoiceResult.error) {
        updateResult.data = {
          ...updateResult.data,
          metadata: {
            ...(updateResult.data?.metadata || {}),
            invoice_error: invoiceResult.error.message,
          },
        };
      }
    }
  }

  await supabase.from('activity_logs').insert([
    {
      actor_id: actorId,
      activity_type: 'production_stage_updated',
      message: `Production ${job.production_number} moved to ${stage}.`,
      metadata: { production_job_id: jobId, stage },
    },
  ]);

  return updateResult;
}

export async function completeProductionJob(jobId, { actorId = null } = {}) {
  const completeResult = await updateProductionStage(jobId, 'delivered', { actorId });
  if (completeResult.error) return completeResult;

  const updateResult = await updateProductionJob(jobId, {
    status: PRODUCTION_JOB_STATUS.COMPLETED,
    completed_at: new Date().toISOString(),
    dispatch_status: 'delivered',
  });

  const job = updateResult.data;
  const salesOrderId = job?.sales_order_id || job?.metadata?.sales_order_id;
  if (salesOrderId) {
    await updateSalesOrderStatus(salesOrderId, SALES_ORDER_STATUSES.COMPLETED, {
      production_stage: 'delivered',
      completed_at: new Date().toISOString(),
    });
  }

  return updateResult;
}

/** Legacy: create from old orders table */
export async function createProductionJobFromOrder(order, bomRequirements = []) {
  const salesOrderShim = {
    id: order.metadata?.sales_order_id || order.id,
    sales_order_number: order.order_number || order.sales_order_number,
    quotation_id: order.quotation_id,
    customer_id: order.customer_id,
    box_type: order.box_type,
    quantity: order.quantity,
    priority: order.priority,
    assigned_to: order.assigned_to,
    items: [],
    metadata: { legacy_order_id: order.id, ...order.metadata },
  };

  return createProductionJob({
    salesOrder: salesOrderShim,
    bomRequirements,
    actorId: order.created_by,
    notes: `Production job from legacy order ${order.order_number}`,
  });
}

export async function deleteProductionJob(id) {
  await supabase.from('production_stages').delete().eq('production_job_id', id);
  return supabase.from('production_jobs').delete().eq('id', id);
}

export async function updateProductionStatus(id, status, options = {}) {
  return updateProductionStage(id, status, options);
}

export { generateProductionNumber };

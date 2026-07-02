import supabase from "../lib/supabase";
import { fetchSalesOrderById } from "./salesOrderService";

// Strict validation registry matching the production_jobs_status_check database constraint check array
const ALLOWED_STATUSES = [
  'Scheduled',
  'Completed',
  'draft',
  'waiting_for_material',
  'ready',
  'released',
  'in_progress',
  'qc'
];

/**
 * Legacy CRUD function preserved intact for backward structural compatibility.
 */
export async function createProductionJob(job) {
  const { data, error } = await supabase
    .from("production_jobs")
    .insert([job])
    .select()
    .single();

  if (error) {
    console.error("BoxIQ createProductionJob Error:", error.message);
    return null;
  }
  return data;
}

/**
 * Legacy CRUD function preserved intact for backward structural compatibility.
 */
export async function fetchProductionJobs() {
  const { data, error } = await supabase
    .from("production_jobs")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("BoxIQ fetchProductionJobs Error:", error.message);
    return [];
  }
  return data;
}

/**
 * Legacy CRUD function preserved intact for backward structural compatibility.
 */
export async function updateProductionJob(id, updates) {
  const { data, error } = await supabase
    .from("production_jobs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("BoxIQ updateProductionJob Error:", error.message);
    return null;
  }
  return data;
}

/**
 * Fetches an active manufacturing job tracking against a canonical sales order identifier.
 * Includes property mapping normalization to safely satisfy conditional evaluation blocks upstream.
 */
export async function fetchProductionJobBySalesOrderId(salesOrderId) {
  if (!salesOrderId) {
    return { data: null, error: new Error("Missing required argument: salesOrderId") };
  }

  const { data, error } = await supabase
    .from("production_jobs")
    .select("*")
    .eq("sales_order_id", salesOrderId)
    .maybeSingle();

  if (error) {
    console.error("BoxIQ fetchProductionJobBySalesOrderId Failure:", error.message);
    return { data: null, error };
  }

  // Bridging Virtual Interface Isolation Strategy
  const normalizedJob = data 
    ? { ...data, production_number: data.job_number } 
    : null;

  return { data: normalizedJob, error: null };
}

/**
 * Transactional Sub-routine Orchestration: Resolves order metrics, assembles payloads 
 * passing strict database NOT NULL fields, and dispatches records safely into production lines.
 */
export async function startProductionFromSalesOrder({ salesOrderId, actorId = null, notes = '' } = {}) {
  if (!salesOrderId) {
    return { data: null, error: new Error("Pipeline Failure: Cannot start production without salesOrderId.") };
  }

  // 1. Context Hydration: Query parent context to satisfy database constraints (customer_name, box_type, quantity)
  const orderLookup = await fetchSalesOrderById(salesOrderId);
  if (orderLookup.error || !orderLookup.data) {
    return {
      data: null,
      error: orderLookup.error || new Error(`Could not construct execution context. Sales Order ${salesOrderId} missing.`)
    };
  }

  const salesOrder = orderLookup.data;
  const targetQuantity = Number(salesOrder.quantity || 0);

  if (!Number.isFinite(targetQuantity) || targetQuantity <= 0) {
    return { data: null, error: new Error(`Aborting job scheduling: Sales order contains invalid manufacturing quantity (${targetQuantity}).`) };
  }

  // 2. Build unique, distinct sequential alphanumeric job tokens
  const uniqueKey = Math.floor(1000 + Math.random() * 9000);
  const compiledJobNumber = `JOB-${Date.now()}-${uniqueKey}`;

  // 3. Assemble target DDL-aligned structure payload
  // Note: legacy order_id is completely omitted to avoid stepping on the orders foreign key rule constraint trap
  const finalJobPayload = {
    job_number: compiledJobNumber,
    sales_order_id: salesOrderId,
    quotation_id: salesOrder.quotation_id || null,
    customer_name: salesOrder.customer_name || salesOrder.customer?.name || "Unassigned Customer Entity",
    box_type: salesOrder.box_type || salesOrder.product_name || "Custom Specification Configuration",
    quantity: targetQuantity,
    status: 'Scheduled',
    qc_status: 'pending',
    actual_material_cost: 0,
    total_waste_kg: 0
  };

  const { data, error } = await supabase
    .from("production_jobs")
    .insert([finalJobPayload])
    .select()
    .single();

  if (error) {
    console.error("BoxIQ startProductionFromSalesOrder DB Commit Exception:", error.message);
    return { data: null, error };
  }

  // 4. Mirror properties cleanly across structural boundaries to insulate quotationConversionService.js metadata mappings
  const mappedOutputJob = {
    ...data,
    production_number: data.job_number
  };

  return { data: mappedOutputJob, error: null };
}

/**
 * Protected state mutator ensuring all runtime application events conform directly 
 * to backend schema check constraint assertions.
 */
export async function updateProductionStatus(id, status) {
  if (!id) {
    return { data: null, error: new Error("Target resource modification aborted: Missing ID field input parameter.") };
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return { 
      data: null, 
      error: new Error(`Database Integrity Invariant Breach Prevented: Status "${status}" rejected. Must resolve to one of: ${ALLOWED_STATUSES.join(', ')}`)
    };
  }

  const { data, error } = await supabase
    .from("production_jobs")
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("BoxIQ updateProductionStatus Modification Failure:", error.message);
    return { data: null, error };
  }

  const standardizedJob = data 
    ? { ...data, production_number: data.job_number } 
    : null;

  return { data: standardizedJob, error: null };
}
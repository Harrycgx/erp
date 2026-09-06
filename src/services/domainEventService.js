import supabase from "../lib/supabase";

/**
 * Domain Event Service
 * Inserts rows into public.business_events for key lifecycle transitions.
 * Caller should provide actorId (typically from auth.uid()).
 */

export async function quoteCreated(quotation, actorId) {
  const payload = {
    aggregate_type: 'quotation',
    aggregate_id: quotation.id,
    event_type: 'QUOTE_CREATED',
    payload: JSON.stringify({
      quotationId: quotation.id,
      quotationNumber: quotation.quotation_number,
      customerId: quotation.customer_id,
      totalAmount: quotation.total_amount,
      status: quotation.status,
    }),
    actor_id: actorId,
  };
  const { data, error } = await supabase.from('business_events').insert([payload]).single();
  if (error) throw error;
  return data;
}

export async function quoteAccepted(quotation, actorId) {
  const payload = {
    aggregate_type: 'quotation',
    aggregate_id: quotation.id,
    event_type: 'QUOTE_ACCEPTED',
    payload: JSON.stringify({
      quotationId: quotation.id,
      quotationNumber: quotation.quotation_number,
      customerId: quotation.customer_id,
      totalAmount: quotation.total_amount,
      acceptedAt: new Date().toISOString(),
    }),
    actor_id: actorId,
  };
  const { data, error } = await supabase.from('business_events').insert([payload]).single();
  if (error) throw error;
  return data;
}

export async function orderConfirmed(order, actorId) {
  const payload = {
    aggregate_type: 'order',
    aggregate_id: order.id,
    event_type: 'ORDER_CONFIRMED',
    payload: JSON.stringify({
      orderId: order.id,
      orderNumber: order.order_number,
      customerId: order.customer_id,
      totalAmount: order.total,
      confirmedAt: new Date().toISOString(),
    }),
    actor_id: actorId,
  };
  const { data, error } = await supabase.from('business_events').insert([payload]).single();
  if (error) throw error;
  return data;
}

export async function invoiceReady(invoice, actorId) {
  const payload = {
    aggregate_type: 'invoice',
    aggregate_id: invoice.id,
    event_type: 'INVOICE_READY',
    payload: JSON.stringify({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      customerId: invoice.customer_id,
      totalAmount: invoice.total,
      status: invoice.status,
    }),
    actor_id: actorId,
  };
  const { data, error } = await supabase.from('business_events').insert([payload]).single();
  if (error) throw error;
  return data;
}

export async function productionStarted(productionJob, actorId) {
  const payload = {
    aggregate_type: 'production_job',
    aggregate_id: productionJob.id,
    event_type: 'PRODUCTION_STARTED',
    payload: JSON.stringify({
      productionJobId: productionJob.id,
      productionNumber: productionJob.production_number,
      orderId: productionJob.order_id,
      boxType: productionJob.box_type,
      quantity: productionJob.quantity,
      startedAt: new Date().toISOString(),
    }),
    actor_id: actorId,
  };
  const { data, error } = await supabase.from('business_events').insert([payload]).single();
  if (error) throw error;
  return data;
}

export async function productionCompleted(productionJob, actorId) {
  const payload = {
    aggregate_type: 'production_job',
    aggregate_id: productionJob.id,
    event_type: 'PRODUCTION_COMPLETED',
    payload: JSON.stringify({
      productionJobId: productionJob.id,
      productionNumber: productionJob.production_number,
      orderId: productionJob.order_id,
      boxType: productionJob.box_type,
      quantity: productionJob.quantity,
      completedAt: new Date().toISOString(),
    }),
    actor_id: actorId,
  };
  const { data, error } = await supabase.from('business_events').insert([payload]).single();
  if (error) throw error;
  return data;
}

export async function dispatchCreated(dispatchRecord, actorId) {
  const payload = {
    aggregate_type: 'dispatch_record',
    aggregate_id: dispatchRecord.id,
    event_type: 'DISPATCH_CREATED',
    payload: JSON.stringify({
      dispatchId: dispatchRecord.id,
      orderId: dispatchRecord.order_id,
      vehicleNumber: dispatchRecord.vehicle_number,
      dispatchedAt: new Date().toISOString(),
    }),
    actor_id: actorId,
  };
  const { data, error } = await supabase.from('business_events').insert([payload]).single();
  if (error) throw error;
  return data;
}

// Additional event types can be added as needed (e.g., SCRAP_RECORDED, REWORK_RECORDED, etc.)

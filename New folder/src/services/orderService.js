import supabase from '../lib/supabase';
import { buildOrderNumber } from '../utils/orderHelpers';
import { addCustomerQuotationNote, fetchQuotationWithItems, normalizeQuotationStatus, QUOTATION_STATUSES } from './quotationService';
import { fetchBOMForProduct, calculateMaterialRequirements } from './bomService';
import { reserveInventoryForOrder, releaseInventoryReservationsForOrder } from './inventoryReservationService';
import { createProductionJobFromOrder } from './productionService';
import { createInvoiceForOrder } from './financeService';

export async function fetchOrders() {
  return supabase.from('orders').select('*').order('created_at', { ascending: false });
}

export async function fetchOrderById(id) {
  return supabase.from('orders').select('*').eq('id', id).single();
}

export async function fetchOrderWithItems(id) {
  const [orderResult, itemsResult] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase.from('order_items').select('*').eq('order_id', id).order('created_at', { ascending: true }),
  ]);

  const error = orderResult.error || itemsResult.error;
  if (error) return { data: null, error };

  return {
    data: {
      ...orderResult.data,
      items: itemsResult.data || [],
    },
    error: null,
  };
}

export async function insertOrder(order) {
  return supabase.from('orders').insert([order]);
}

export async function updateOrder(id, updates) {
  return supabase.from('orders').update(updates).eq('id', id);
}

export async function createOrderFromQuote(quote, customer) {
  const orderNumber = buildOrderNumber();
  const order = {
    quotation_id: quote.id,
    customer_id: quote.customer_id,
    order_number: orderNumber,
    status: 'Pending',
    production_stage: 'Pending',
    payment_status: 'Pending',
    assigned_staff: '',
    notes: `Converted from quote ${quote.id}`,
    created_at: new Date().toISOString(),
  };
  return supabase.from('orders').insert([order]);
}

export async function approveQuotationAndCreateOrder({ quotationId, customerNote = '', actorId = null }) {
  const workflowResult = await supabase.rpc('approve_quotation_to_order', {
    p_quotation_id: quotationId,
    p_actor_id: actorId,
    p_customer_note: customerNote,
  });

  if (!workflowResult.error) {
    return fetchOrderById(workflowResult.data);
  }

  const quotationResult = await fetchQuotationWithItems(quotationId);
  if (quotationResult.error) return { data: null, error: quotationResult.error };

  const quote = quotationResult.data;
  const currentStatus = normalizeQuotationStatus(quote.status);
  if ([QUOTATION_STATUSES.CONVERTED, QUOTATION_STATUSES.CONVERTED_TO_ORDER, QUOTATION_STATUSES.REJECTED, QUOTATION_STATUSES.EXPIRED].includes(currentStatus)) {
    return { data: null, error: new Error('This quotation can no longer be approved.') };
  }

  const orderNumber = buildOrderNumber();
  const orderPayload = {
    quotation_id: quote.id,
    customer_id: quote.customer_id,
    order_number: orderNumber,
    status: 'confirmed',
    production_stage: 'pending',
    payment_status: 'pending',
    priority: quote.urgency === 'Rush' ? 'High' : 'Normal',
    box_type: quote.box_type,
    quantity: Number(quote.quantity) || 0,
    total: Number(quote.total) || 0,
    notes: `Created from approved quotation ${quote.quotation_number || quote.id}`,
    metadata: {
      quotation_snapshot: {
        ...quote,
        notes: undefined,
        items: quote.items || [],
      },
      pricing_locked_at: new Date().toISOString(),
    },
  };

  const orderResult = await supabase.from('orders').insert([orderPayload]).select('*').single();
  if (orderResult.error) return { data: null, error: orderResult.error };

  const orderItems = (quote.items || []).map((item) => ({
    order_id: orderResult.data.id,
    quotation_item_id: item.id,
    item_name: item.item_name,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_amount: item.discount_amount,
    tax_rate: item.tax_rate,
    tax_amount: item.tax_amount,
    subtotal: item.subtotal,
    total: item.total,
    metadata: { copied_from_quotation_item_id: item.id },
  }));

  if (orderItems.length) {
    const itemResult = await supabase.from('order_items').insert(orderItems);
    if (itemResult.error) {
      await supabase.from('orders').delete().eq('id', orderResult.data.id);
      return { data: null, error: itemResult.error };
    }
  }

  const invoiceResult = await createInvoiceForOrder(orderResult.data, {
    notes: `Auto-generated invoice after approving quotation ${quote.quotation_number || quote.id}`,
    generated_by: actorId || 'system',
  });
  if (invoiceResult.error) {
    await supabase.from('order_items').delete().eq('order_id', orderResult.data.id);
    await supabase.from('orders').delete().eq('id', orderResult.data.id);
    return { data: null, error: invoiceResult.error };
  }

  const bomResult = await fetchBOMForProduct(quote.box_type || quote.product_name || '');
  const requirements = bomResult.error || !bomResult.data ? [] : calculateMaterialRequirements(bomResult.data, quote.quantity || 0);

  const reservationResult = await reserveInventoryForOrder({
    requirements,
    orderId: orderResult.data.id,
    quotationId: quote.id,
    actorId,
  });

  if (reservationResult.error) {
    await supabase.from('orders').delete().eq('id', orderResult.data.id);
    return { data: null, error: reservationResult.error };
  }

  const productionResult = await createProductionJobFromOrder(orderResult.data, requirements);
  if (productionResult.error) {
    await releaseInventoryReservationsForOrder({ requirements, orderId: orderResult.data.id, actorId });
    await supabase.from('orders').delete().eq('id', orderResult.data.id);
    return { data: null, error: productionResult.error };
  }

  const quoteUpdate = await supabase
    .from('quotations')
    .update({
      status: QUOTATION_STATUSES.CONVERTED,
      metadata: {
        ...(quote.metadata || {}),
        approved_at: new Date().toISOString(),
        converted_at: new Date().toISOString(),
        converted_order_id: orderResult.data.id,
        converted_order_number: orderNumber,
        production_job_id: productionResult.data.id,
      },
    })
    .eq('id', quote.id);
  if (quoteUpdate.error) return { data: orderResult.data, error: quoteUpdate.error };

  if (customerNote.trim()) {
    await addCustomerQuotationNote({
      quotationId: quote.id,
      customerId: quote.customer_id,
      authorId: actorId,
      note: customerNote.trim(),
      noteType: 'approval',
    });
  }

  await supabase.from('activity_logs').insert([
    {
      actor_id: actorId,
      customer_id: quote.customer_id,
      quotation_id: quote.id,
      order_id: orderResult.data.id,
      activity_type: 'quotation_approved',
      message: `Quotation approved and converted to order ${orderNumber}.`,
      metadata: { production_job_id: productionResult.data.id },
    },
  ]);

  return {
    data: orderResult.data,
    error: null,
  };
}

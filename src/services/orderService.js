import supabase from '../lib/supabase';
import { buildOrderNumber } from '../utils/orderHelpers';
import { approveQuotationWorkflow } from './quotationApprovalService';

/**
 * Legacy orders table — read-only support for /orders page.
 * New operational pipeline uses sales_orders via quotationConversionService.
 */

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

export async function createOrderFromQuote(quote) {
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

/**
 * Canonical entry for quotation approval → sales order pipeline.
 * @deprecated Prefer approveQuotationWorkflow from quotationApprovalService.
 */
export async function approveQuotationAndCreateOrder({ quotationId, customerNote = '', actorId = null }) {
  return approveQuotationWorkflow({ quotationId, note: customerNote, actorId });
}

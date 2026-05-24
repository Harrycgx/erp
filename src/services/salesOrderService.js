import supabase from '../lib/supabase';
import { buildQuotationFinancials } from './quotationCalculationService';
import {
  generateSalesOrderNumber,
  normalizeSalesOrderStatus,
  SALES_ORDER_STATUSES,
} from '../utils/salesOrderHelpers';

function mapSalesOrderRow(row = {}) {
  return {
    ...row,
    status: normalizeSalesOrderStatus(row.status),
  };
}

function buildQuotationSnapshot(quote) {
  const { notes, comments, activity_logs, ...rest } = quote;
  return {
    ...rest,
    items: (quote.items || []).map((item) => ({ ...item })),
    pricing_locked_at: new Date().toISOString(),
  };
}

export async function fetchNextSalesOrderNumberPreview() {
  const { count, error } = await supabase.from('sales_orders').select('id', { count: 'exact', head: true });
  if (error) return { data: generateSalesOrderNumber(1), error: null };
  return { data: generateSalesOrderNumber((count || 0) + 1), error: null };
}

export async function fetchSalesOrderByQuotationId(quotationId) {
  const result = await supabase
    .from('sales_orders')
    .select('*')
    .eq('quotation_id', quotationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (result.error) return { data: null, error: result.error };
  return { data: result.data ? mapSalesOrderRow(result.data) : null, error: null };
}

export function validateSalesOrderFromQuotation(quote, items = []) {
  const errors = [];

  if (!quote?.id) errors.push('Quotation reference is required.');
  if (!quote?.customer_id) errors.push('Quotation must have a customer.');

  const lineItems = items.length ? items : quote?.items || [];
  if (!lineItems.length) {
    errors.push('Quotation must have at least one line item.');
  }

  lineItems.forEach((item, index) => {
    const qty = Number(item.quantity);
    const unitPrice = Number(item.unit_price);
    if (!Number.isFinite(qty) || qty <= 0) {
      errors.push(`Line ${index + 1}: invalid quantity.`);
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      errors.push(`Line ${index + 1}: invalid unit price.`);
    }
  });

  const financials = buildQuotationFinancials(quote, lineItems);
  if (!Number.isFinite(financials.totals.total) || financials.totals.total < 0) {
    errors.push('Quotation total is invalid.');
  }

  return {
    valid: errors.length === 0,
    errors,
    message: errors[0] || '',
    financials,
    items: financials.items,
  };
}

export async function createSalesOrderFromQuotation(quote, options = {}) {
  const items = quote.items || [];
  const validation = validateSalesOrderFromQuotation(quote, items);
  if (!validation.valid) {
    return { data: null, error: new Error(validation.message), errors: validation.errors };
  }

  const previewNumber = options.sales_order_number || (await fetchNextSalesOrderNumberPreview()).data;
  const snapshot = buildQuotationSnapshot(quote);
  const { quotation: calculated, totals } = validation.financials;

  const salesOrderPayload = {
    sales_order_number: previewNumber,
    quotation_id: quote.id,
    customer_id: quote.customer_id,
    created_by: options.actorId || quote.created_by || null,
    status: SALES_ORDER_STATUSES.PENDING,
    production_stage: 'pending',
    payment_status: 'pending',
    priority: quote.urgency === 'Rush' ? 'high' : 'normal',
    box_type: quote.box_type || null,
    quantity: Number(calculated.quantity || quote.quantity) || 0,
    subtotal: totals.subtotal,
    gst_amount: totals.gst_amount,
    discount_amount: totals.discount_amount,
    total_amount: totals.total_amount,
    due_date: quote.valid_until || null,
    notes:
      options.notes ||
      `Sales order from quotation ${quote.quotation_number || quote.quote_number || quote.id}`,
    metadata: {
      quotation_snapshot: snapshot,
      pricing_locked_at: snapshot.pricing_locked_at,
      converted_by: options.actorId || null,
    },
  };

  const salesOrderResult = await supabase.from('sales_orders').insert([salesOrderPayload]).select('*').single();
  if (salesOrderResult.error) return { data: null, error: salesOrderResult.error };

  const itemRows = validation.items.map((item) => ({
    sales_order_id: salesOrderResult.data.id,
    quotation_item_id: item.id || null,
    item_name: item.item_name,
    description: item.description || null,
    box_type: item.box_type || quote.box_type || null,
    dimensions: item.dimensions || (quote.length ? `${quote.length}x${quote.width}x${quote.height}` : null),
    gsm: item.gsm || quote.gsm || null,
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unit_price) || 0,
    discount_amount: Number(item.discount_amount) || 0,
    tax_rate: Number(item.tax_rate) || 0,
    tax_amount: Number(item.tax_amount) || 0,
    subtotal: Number(item.subtotal) || 0,
    total_price: Number(item.total_price || item.total) || 0,
    notes: item.notes || '',
    metadata: { copied_from_quotation_item_id: item.id || null },
  }));

  if (itemRows.length) {
    const itemsResult = await supabase.from('sales_order_items').insert(itemRows).select('*');
    if (itemsResult.error) {
      await supabase.from('sales_orders').delete().eq('id', salesOrderResult.data.id);
      return { data: null, error: itemsResult.error };
    }

    return {
      data: {
        ...mapSalesOrderRow(salesOrderResult.data),
        items: itemsResult.data || [],
      },
      error: null,
    };
  }

  return {
    data: mapSalesOrderRow(salesOrderResult.data),
    error: null,
  };
}

export async function deleteSalesOrder(id) {
  await supabase.from('sales_order_items').delete().eq('sales_order_id', id);
  return supabase.from('sales_orders').delete().eq('id', id);
}

export async function fetchSalesOrders() {
  const result = await supabase.from('sales_orders').select('*').order('created_at', { ascending: false });
  if (result.error) return result;
  return { data: (result.data || []).map(mapSalesOrderRow), error: null };
}

export async function fetchSalesOrderById(id) {
  const result = await supabase.from('sales_orders').select('*').eq('id', id).single();
  if (result.error) return result;
  return { data: mapSalesOrderRow(result.data), error: null };
}

export async function fetchSalesOrderWithItems(id) {
  const [orderResult, itemsResult] = await Promise.all([
    supabase.from('sales_orders').select('*').eq('id', id).single(),
    supabase.from('sales_order_items').select('*').eq('sales_order_id', id).order('created_at', { ascending: true }),
  ]);

  const error = orderResult.error || itemsResult.error;
  if (error) return { data: null, error };

  return {
    data: {
      ...mapSalesOrderRow(orderResult.data),
      items: itemsResult.data || [],
    },
    error: null,
  };
}

export async function updateSalesOrderStatus(id, status, extra = {}) {
  const normalized = normalizeSalesOrderStatus(status);
  const payload = {
    status: normalized,
    ...extra,
    updated_at: new Date().toISOString(),
  };

  if (normalized === SALES_ORDER_STATUSES.COMPLETED) {
    payload.completed_at = new Date().toISOString();
  }

  const result = await supabase.from('sales_orders').update(payload).eq('id', id).select('*').single();
  if (result.error) return result;
  return { data: mapSalesOrderRow(result.data), error: null };
}

/** @deprecated Use createSalesOrderFromQuotation */
export async function createSalesOrderFromQuote(quote) {
  return createSalesOrderFromQuotation(quote);
}

export { generateSalesOrderNumber, SALES_ORDER_STATUSES };

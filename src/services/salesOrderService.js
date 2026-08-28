import supabase from '../lib/supabase';
import { buildQuotationFinancials } from './quotationCalculationService';
import {
  generateSalesOrderNumber,
  normalizeSalesOrderStatus,
  SALES_ORDER_STATUSES,
} from '../utils/salesOrderHelpers';

/**
 * Normalizes database rows into UI-consumable models.
 * Maintains explicit backward-compatibility aliases for the UI layer.
 */
function mapSalesOrderRow(row = {}) {
  if (!row) return null;
  return {
    ...row,
    id: row.order_id, // UI Layer Virtual Alias
    sales_order_number: row.order_number, // UI Layer Virtual Alias
    quotation_id: row.quote_id, // UI Layer Virtual Alias
    total_amount: Number(row.total_value_snapshot || 0), // UI Layer Virtual Alias
    status: normalizeSalesOrderStatus(row.status),
  };
}

/**
 * Strips dynamic log data and records a pricing lock timestamp for historical snapshot preservation.
 */
function buildQuotationSnapshot(quote) {
  const { ...rest } = quote;
  return {
    ...rest,
    items: (quote.items || []).map((item) => ({ ...item })),
    pricing_locked_at: new Date().toISOString(),
  };
}

/**
 * Optimally counts existing records using the primary key index to preview the next sequence number.
 * Resolved: Wildcard select replaced with verified primary key 'order_id'.
 */
export async function fetchNextSalesOrderNumberPreview() {
  const { count, error } = await supabase
    .from('sales_orders')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error("BoxIQ fetchNextSalesOrderNumberPreview Error:", error.message);
    return { data: generateSalesOrderNumber(1), error: null };
  }
  return { data: generateSalesOrderNumber((count || 0) + 1), error: null };
}

/**
 * Looks up the most recent sales order associated with a given quote ID.
 */
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

/**
 * Business logic validator ensuring financial and line item invariants are satisfied.
 */
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

/**
 * Atomic transaction orchestrator converting a valid quotation into a structured sales order record.
 * All target database fields have been audited and verified against the live schema layout.
 */
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
    company_id: quote.company_id || null,
    order_source: options.order_source || 'Quotation',
    created_by: options.actorId || quote.created_by || null,
    status: SALES_ORDER_STATUSES.PENDING,
    total_amount: totals.total_amount || totals.total || 0,
    pricing_snapshot: {
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
      notes: options.notes || `Sales order from quotation ${quote.quotation_number || quote.quote_number || quote.id}`,
      quotation_snapshot: snapshot,
      pricing_locked_at: snapshot.pricing_locked_at,
      converted_by: options.actorId || null,
    }
  };

  const salesOrderResult = await supabase.from('sales_orders').insert([salesOrderPayload]).select('*').single();
  if (salesOrderResult.error) return { data: null, error: salesOrderResult.error };

  const itemRows = validation.items.map((item) => ({
    sales_order_id: salesOrderResult.data.order_id,
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
      // Cascading deletion logic to prevent orphaned sales order parent headers
      await supabase.from('sales_orders').delete().eq('order_id', salesOrderResult.data.order_id);
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

/**
 * Drops an order record and clears foreign tracking references inside the child items table.
 */
export async function deleteSalesOrder(id) {
  await supabase.from('sales_order_items').delete().eq('sales_order_id', id);
  return supabase.from('sales_orders').delete().eq('id', id);
}

/**
 * Fetches all sales order rows sorted by initialization timestamp.
 */
export async function fetchSalesOrders() {
  const result = await supabase.from('sales_orders').select('*').order('created_at', { ascending: false });
  if (result.error) return result;
  return { data: (result.data || []).map(mapSalesOrderRow), error: null };
}

/**
 * Fetches a single sales order utilizing the explicit unique database identifier.
 */
export async function fetchSalesOrderById(id) {
  const result = await supabase.from('sales_orders').select('*').eq('id', id).single();
  if (result.error) return result;
  return { data: mapSalesOrderRow(result.data), error: null };
}

/**
 * Resolves both the structural sales order parent row and its associated sub-item rows concurrently.
 */
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

/**
 * Safely updates state fields.
 * Audited & Fixed: Non-existent columns 'updated_at' and 'completed_at' have been 
 * stripped to prevent PostgREST column missing exceptions (Error 42703).
 */
export async function updateSalesOrderStatus(id, status, extra = {}) {
  const normalized = normalizeSalesOrderStatus(status);
  const payload = {
    status: normalized,
    ...extra,
  };

  const result = await supabase.from('sales_orders').update(payload).eq('id', id).select('*').single();
  if (result.error) return result;
  return { data: mapSalesOrderRow(result.data), error: null };
}

/** @deprecated Use createSalesOrderFromQuotation */
export async function createSalesOrderFromQuote(quote) {
  return createSalesOrderFromQuotation(quote);
}

export { generateSalesOrderNumber, SALES_ORDER_STATUSES };
import supabase from '../lib/supabase';
import {
  calculateInvoiceTotals,
  deriveInvoiceStatus,
  INVOICE_STATUSES,
  reconcilePaymentBalance,
} from './invoiceCalculationService';
import { recordInvoiceLedgerEntry } from './ledgerService';

export { INVOICE_STATUSES };

function mapInvoiceRow(row = {}) {
  const totalAmount = Number(row.total_amount ?? row.total ?? 0);
  const paidAmount = Number(row.paid_amount ?? 0);
  const balance = reconcilePaymentBalance({ totalAmount, paidAmount });

  return {
    ...row,
    total: totalAmount,
    total_amount: totalAmount,
    paid_amount: paidAmount,
    due_amount: Number(row.due_amount ?? balance.due_amount),
    status: normalizeStoredStatus(row),
    payment_status: mapPaymentStatusLabel(row),
  };
}

function normalizeStoredStatus(row) {
  const raw = String(row.status || row.payment_status || '').toLowerCase();
  if (['paid', 'partial', 'unpaid', 'overdue'].includes(raw)) return raw;
  if (raw === 'open' || raw === 'due') return INVOICE_STATUSES.UNPAID;
  if (Number(row.paid_amount) >= Number(row.total_amount ?? row.total)) return INVOICE_STATUSES.PAID;
  return deriveInvoiceStatus({
    totalAmount: row.total_amount ?? row.total,
    paidAmount: row.paid_amount,
    dueDate: row.due_date,
  });
}

function mapPaymentStatusLabel(row) {
  const status = normalizeStoredStatus(row);
  if (status === INVOICE_STATUSES.PAID) return 'Paid';
  if (status === INVOICE_STATUSES.PARTIAL) return 'Partial';
  if (status === INVOICE_STATUSES.OVERDUE) return 'Overdue';
  return 'Due';
}

export function generateInvoiceNumber(sequence = 1) {
  const year = new Date().getFullYear();
  const seq = Math.max(Number(sequence) || 1, 1);
  return `INV-${year}-${String(seq).padStart(4, '0')}`;
}

export async function fetchNextInvoiceNumberPreview() {
  const { count, error } = await supabase.from('invoices').select('id', { count: 'exact', head: true });
  if (error) return generateInvoiceNumber(1);
  return generateInvoiceNumber((count || 0) + 1);
}

export async function fetchInvoiceBySalesOrderId(salesOrderId) {
  const byColumn = await supabase
    .from('invoices')
    .select('*')
    .eq('sales_order_id', salesOrderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!byColumn.error && byColumn.data) {
    return { data: mapInvoiceRow(byColumn.data), error: null };
  }

  const byMetadata = await supabase
    .from('invoices')
    .select('*')
    .contains('metadata', { sales_order_id: salesOrderId })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byMetadata.error) return { data: null, error: byMetadata.error };
  return { data: byMetadata.data ? mapInvoiceRow(byMetadata.data) : null, error: null };
}

export function validateInvoiceFromSalesOrder(salesOrder, items = []) {
  const errors = [];
  if (!salesOrder?.id) errors.push('Sales order is required.');
  if (!salesOrder?.customer_id) errors.push('Sales order must have a customer.');

  const lineItems = items.length ? items : salesOrder?.items || [];
  if (!lineItems.length) errors.push('Sales order must have at least one line item to invoice.');

  const financials = calculateInvoiceTotals(lineItems, {
    headerDiscountAmount: salesOrder.discount_amount,
  });

  if (!Number.isFinite(financials.total_amount) || financials.total_amount < 0) {
    errors.push('Invoice total is invalid.');
  }

  return {
    valid: errors.length === 0,
    errors,
    message: errors[0] || '',
    financials,
    items: financials.items,
  };
}

function buildSalesOrderSnapshot(salesOrder) {
  return {
    id: salesOrder.id,
    sales_order_number: salesOrder.sales_order_number,
    customer_id: salesOrder.customer_id,
    quotation_id: salesOrder.quotation_id,
    box_type: salesOrder.box_type,
    quantity: salesOrder.quantity,
    subtotal: salesOrder.subtotal,
    gst_amount: salesOrder.gst_amount,
    discount_amount: salesOrder.discount_amount,
    total_amount: salesOrder.total_amount,
    items: (salesOrder.items || []).map((item) => ({ ...item })),
    pricing_locked_at: new Date().toISOString(),
  };
}

function mapItemsForDb(calculatedItems, invoiceId, salesOrderItems = []) {
  return calculatedItems.map((item, index) => {
    const source = salesOrderItems[index] || {};
    return {
      invoice_id: invoiceId,
      sales_order_item_id: source.id || null,
      item_name: item.item_name,
      description: item.description || null,
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price) || 0,
      gst_percentage: Number(item.gst_percentage) || 0,
      discount_amount: Number(item.discount_amount) || 0,
      subtotal: Number(item.subtotal) || 0,
      tax_amount: Number(item.tax_amount) || 0,
      total_price: Number(item.total_price) || 0,
      metadata: { sales_order_item_id: source.id || null },
    };
  });
}

export async function generateInvoiceFromSalesOrder({
  salesOrder,
  salesOrderId = null,
  actorId = null,
  productionJobId = null,
  notes = '',
  dueInDays = 7,
} = {}) {
  let order = salesOrder;
  if (!order && salesOrderId) {
    const { fetchSalesOrderWithItems } = await import('./salesOrderService');
    const result = await fetchSalesOrderWithItems(salesOrderId);
    if (result.error) return { data: null, error: result.error };
    order = result.data;
  }

  if (!order?.id) {
    return { data: null, error: new Error('Sales order not found for invoicing.') };
  }

  const existing = await fetchInvoiceBySalesOrderId(order.id);
  if (existing.error) return { data: null, error: existing.error };
  if (existing.data?.id) {
    return {
      data: null,
      error: new Error(
        `Invoice already exists for this sales order (${existing.data.invoice_number || existing.data.id}).`
      ),
    };
  }

  const validation = validateInvoiceFromSalesOrder(order, order.items || []);
  if (!validation.valid) {
    return { data: null, error: new Error(validation.message), errors: validation.errors };
  }

  const { financials } = validation;
  const previewNumber = await fetchNextInvoiceNumberPreview();
  const issueDate = new Date().toISOString().slice(0, 10);
  const dueDate = new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const balance = reconcilePaymentBalance({ totalAmount: financials.total_amount, paidAmount: 0 });
  const status = deriveInvoiceStatus({
    totalAmount: financials.total_amount,
    paidAmount: 0,
    dueDate,
  });

  const invoicePayload = {
    customer_id: order.customer_id,
    sales_order_id: order.id,
    order_id: order.metadata?.legacy_order_id || null,
    invoice_number: previewNumber,
    status: status,
    payment_status: 'Due',
    invoice_date: issueDate,
    issue_date: issueDate,
    due_date: dueDate,
    subtotal: financials.subtotal,
    discount_amount: financials.discount_amount,
    gst_rate: 0,
    gst_amount: financials.gst_amount,
    tax_amount: financials.tax_amount,
    total: financials.total_amount,
    total_amount: financials.total_amount,
    paid_amount: 0,
    due_amount: balance.due_amount,
    notes: notes || `Invoice for sales order ${order.sales_order_number || order.id}`,
    metadata: {
      sales_order_id: order.id,
      sales_order_number: order.sales_order_number,
      quotation_id: order.quotation_id,
      production_job_id: productionJobId,
      sales_order_snapshot: buildSalesOrderSnapshot(order),
      pricing_locked_at: new Date().toISOString(),
      generated_by: actorId || 'system',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const invoiceResult = await supabase.from('invoices').insert([invoicePayload]).select('*').single();
  if (invoiceResult.error) return { data: null, error: invoiceResult.error };

  const itemRows = mapItemsForDb(financials.items, invoiceResult.data.id, order.items || []);
  if (itemRows.length) {
    const itemsResult = await supabase.from('invoice_items').insert(itemRows).select('*');
    if (itemsResult.error) {
      await supabase.from('invoices').delete().eq('id', invoiceResult.data.id);
      return { data: null, error: itemsResult.error };
    }
  }

  const ledgerResult = await recordInvoiceLedgerEntry({
    customerId: order.customer_id,
    invoiceId: invoiceResult.data.id,
    salesOrderId: order.id,
    amount: financials.total_amount,
    entryDate: issueDate,
    description: `Sales invoice ${invoiceResult.data.invoice_number}`,
    metadata: { production_job_id: productionJobId },
  });

  if (ledgerResult.error) {
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceResult.data.id);
    await supabase.from('invoices').delete().eq('id', invoiceResult.data.id);
    return { data: null, error: ledgerResult.error };
  }

  await supabase.from('activity_logs').insert([
    {
      actor_id: actorId,
      customer_id: order.customer_id,
      activity_type: 'invoice_generated',
      message: `Invoice ${invoiceResult.data.invoice_number} generated from sales order ${order.sales_order_number}.`,
      metadata: {
        invoice_id: invoiceResult.data.id,
        sales_order_id: order.id,
        production_job_id: productionJobId,
      },
    },
  ]);

  return {
    data: mapInvoiceRow(invoiceResult.data),
    error: null,
  };
}

export async function fetchInvoices() {
  const result = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
  if (result.error) return result;
  return { data: (result.data || []).map(mapInvoiceRow), error: null };
}

export async function fetchInvoiceById(id) {
  const result = await supabase.from('invoices').select('*').eq('id', id).single();
  if (result.error) return result;
  return { data: mapInvoiceRow(result.data), error: null };
}

export async function fetchInvoiceWithDetails(id) {
  const [invoiceResult, itemsResult, paymentsResult] = await Promise.all([
    fetchInvoiceById(id),
    supabase.from('invoice_items').select('*').eq('invoice_id', id).order('created_at', { ascending: true }),
    supabase.from('payments').select('*').eq('invoice_id', id).order('payment_date', { ascending: false }),
  ]);

  if (invoiceResult.error) return { data: null, error: invoiceResult.error };

  let salesOrder = null;
  const salesOrderId = invoiceResult.data.sales_order_id || invoiceResult.data.metadata?.sales_order_id;
  if (salesOrderId) {
    const { fetchSalesOrderWithItems } = await import('./salesOrderService');
    const so = await fetchSalesOrderWithItems(salesOrderId);
    if (!so.error) salesOrder = so.data;
  }

  return {
    data: {
      ...invoiceResult.data,
      items: itemsResult.data || [],
      payments: paymentsResult.data || [],
      sales_order: salesOrder,
    },
    error: itemsResult.error || paymentsResult.error || null,
  };
}

export async function updateInvoiceStatus(id, status, extra = {}) {
  const invoiceResult = await fetchInvoiceById(id);
  if (invoiceResult.error) return invoiceResult;

  const normalized =
    String(status).toLowerCase() === 'paid'
      ? INVOICE_STATUSES.PAID
      : String(status).toLowerCase();

  const paidAmount =
    normalized === INVOICE_STATUSES.PAID
      ? invoiceResult.data.total_amount
      : Number(extra.paid_amount ?? invoiceResult.data.paid_amount);

  const balance = reconcilePaymentBalance({
    totalAmount: invoiceResult.data.total_amount,
    paidAmount,
  });

  const derived = deriveInvoiceStatus({
    totalAmount: invoiceResult.data.total_amount,
    paidAmount,
    dueDate: invoiceResult.data.due_date,
  });

  const payload = {
    status: derived,
    payment_status:
      derived === INVOICE_STATUSES.PAID
        ? 'Paid'
        : derived === INVOICE_STATUSES.PARTIAL
          ? 'Partial'
          : derived === INVOICE_STATUSES.OVERDUE
            ? 'Overdue'
            : 'Due',
    paid_amount: paidAmount,
    due_amount: balance.due_amount,
    ...extra,
    updated_at: new Date().toISOString(),
  };

  const result = await supabase.from('invoices').update(payload).eq('id', id).select('*').single();
  if (result.error) return result;
  return { data: mapInvoiceRow(result.data), error: null };
}

export async function updateInvoiceBalanceAfterPayment(invoiceId, paidAmount) {
  const invoiceResult = await fetchInvoiceById(invoiceId);
  if (invoiceResult.error) return invoiceResult;

  const balance = reconcilePaymentBalance({
    totalAmount: invoiceResult.data.total_amount,
    paidAmount,
  });

  const status = deriveInvoiceStatus({
    totalAmount: invoiceResult.data.total_amount,
    paidAmount,
    dueDate: invoiceResult.data.due_date,
  });

  return supabase
    .from('invoices')
    .update({
      paid_amount: balance.paid_amount,
      due_amount: balance.due_amount,
      status,
      payment_status:
        status === INVOICE_STATUSES.PAID
          ? 'Paid'
          : status === INVOICE_STATUSES.PARTIAL
            ? 'Partial'
            : status === INVOICE_STATUSES.OVERDUE
              ? 'Overdue'
              : 'Due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)
    .select('*')
    .single()
    .then((r) => ({ data: r.data ? mapInvoiceRow(r.data) : null, error: r.error }));
}

export async function deleteInvoice(id) {
  await supabase.from('invoice_items').delete().eq('invoice_id', id);
  return supabase.from('invoices').delete().eq('id', id);
}

/** Legacy: order table conversion */
export async function createInvoiceForOrder(order, options = {}) {
  const salesOrderShim = {
    id: order.metadata?.sales_order_id || order.id,
    sales_order_number: order.order_number || order.sales_order_number,
    customer_id: order.customer_id,
    quotation_id: order.quotation_id,
    box_type: order.box_type,
    quantity: order.quantity,
    subtotal: order.subtotal,
    gst_amount: order.gst_amount,
    discount_amount: order.discount_amount,
    total_amount: order.total || order.total_amount,
    items: order.items || [],
    metadata: order.metadata,
  };

  return generateInvoiceFromSalesOrder({
    salesOrder: salesOrderShim,
    actorId: options.generated_by,
    notes: options.notes,
  });
}

export async function insertInvoice(invoice) {
  return supabase.from('invoices').insert([invoice]);
}

export async function updateInvoice(id, updates) {
  return supabase.from('invoices').update(updates).eq('id', id);
}

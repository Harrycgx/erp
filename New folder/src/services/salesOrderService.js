import supabase from '../lib/supabase';
import { buildSalesOrderNumber } from '../utils/orderHelpers';

export async function fetchSalesOrders() {
  return supabase.from('sales_orders').select('*').order('created_at', { ascending: false });
}

export async function fetchSalesOrderById(id) {
  return supabase.from('sales_orders').select('*').eq('id', id).single();
}

export async function createSalesOrderFromQuote(quote) {
  const salesOrderNumber = buildSalesOrderNumber();
  const salesOrderPayload = {
    sales_order_number: salesOrderNumber,
    quotation_id: quote.id,
    customer_id: quote.customer_id,
    created_by: quote.created_by || null,
    status: 'pending',
    production_stage: 'pending',
    payment_status: 'pending',
    priority: quote.urgency === 'Rush' ? 'high' : 'normal',
    box_type: quote.box_type,
    quantity: Number(quote.quantity) || 0,
    subtotal: Number(quote.subtotal || 0),
    gst_amount: Number(quote.gst_amount || quote.gst || quote.tax_amount || 0),
    discount_amount: Number(quote.discount_amount || 0),
    total_amount: Number(quote.total_amount || quote.total || 0),
    due_date: quote.valid_until || null,
    notes: `Sales order generated from quotation ${quote.quotation_number || quote.quote_number || quote.id}`,
    metadata: {
      quotation_snapshot: {
        ...quote,
        notes: undefined,
        comments: undefined,
        activity_logs: undefined,
      },
      pricing_locked_at: new Date().toISOString(),
    },
  };

  const salesOrderResult = await supabase.from('sales_orders').insert([salesOrderPayload]).select('*').single();
  if (salesOrderResult.error) return salesOrderResult;

  const itemRows = (quote.items || []).map((item) => ({
    sales_order_id: salesOrderResult.data.id,
    quotation_item_id: item.id,
    item_name: item.item_name,
    description: item.description,
    box_type: item.box_type || quote.box_type,
    dimensions: item.dimensions || `${quote.length}x${quote.width}x${quote.height}`,
    gsm: item.gsm || quote.gsm,
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unit_price) || 0,
    discount_amount: Number(item.discount_amount) || 0,
    tax_rate: Number(item.tax_rate) || 0,
    tax_amount: Number(item.tax_amount) || 0,
    subtotal: Number(item.subtotal) || 0,
    total_price: Number(item.total_price || item.total || 0),
    notes: item.notes || '',
    metadata: { copied_from_quotation_item_id: item.id },
  }));

  if (itemRows.length) {
    const itemsResult = await supabase.from('sales_order_items').insert(itemRows).select('*');
    if (itemsResult.error) return { data: salesOrderResult.data, error: itemsResult.error };
  }

  return {
    data: salesOrderResult.data,
    error: null,
  };
}

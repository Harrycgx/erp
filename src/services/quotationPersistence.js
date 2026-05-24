import supabase from '../lib/supabase';
import { buildQuotationFinancials } from './quotationCalculationService';

function normalizeStatus(status) {
  return String(status || 'draft').trim().toLowerCase().replace(/\s+/g, '_');
}

function mapQuotationRow(quote = {}) {
  return {
    ...quote,
    quote_number: quote.quote_number || quote.quotation_number,
    quotation_number: quote.quotation_number || quote.quote_number,
  };
}

/**
 * Shape quotation header for quotations table insert/update.
 */
export function prepareQuotationRecord(quotation = {}, financials = null) {
  const source = financials?.quotation
    ? { ...financials.quotation, ...quotation }
    : buildQuotationFinancials(quotation, quotation.items || []).quotation;

  return {
    customer_id: source.customer_id,
    inquiry_id: source.inquiry_id || null,
    created_by: source.created_by || null,
    status: normalizeStatus(source.status),
    box_type: source.box_type || '',
    length: Number(source.length) || 0,
    width: Number(source.width) || 0,
    height: Number(source.height) || 0,
    quantity: Number(source.quantity) || 0,
    flute_type: source.flute_type || null,
    ply: source.ply || null,
    gsm: source.gsm ? Number(source.gsm) : null,
    printing_type: source.printing_type || null,
    lamination: source.lamination || null,
    tooling_cost: Number(source.tooling_cost) || 0,
    stitching: source.stitching || null,
    urgency: source.urgency || null,
    subtotal: source.subtotal ?? 0,
    discount_amount: source.discount_amount ?? 0,
    gst: source.gst_amount ?? source.gst ?? 0,
    gst_amount: source.gst_amount ?? source.gst ?? 0,
    tax_amount: source.tax_amount ?? source.gst_amount ?? 0,
    total: source.total ?? 0,
    total_amount: source.total_amount ?? source.total ?? 0,
    valid_until: source.valid_until || null,
    notes: source.notes || null,
    quotation_number: source.quotation_number || source.quote_number || null,
    quote_number: source.quote_number || source.quotation_number || null,
    metadata: {
      ...(source.metadata || {}),
      header_discount_percent: source.header_discount_percent ?? 0,
      header_discount_amount: source.header_discount_amount ?? 0,
      dimensions: source.dimensions || null,
    },
  };
}

/**
 * Shape line items for quotation_items table.
 */
export function prepareQuotationItemsForDb(items = [], quotationId = null) {
  return items.map((item) => ({
    quotation_id: quotationId || item.quotation_id,
    item_name: item.item_name,
    description: item.description || null,
    box_type: item.box_type || null,
    dimensions: item.dimensions || null,
    gsm: item.gsm ? Number(item.gsm) : null,
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unit_price) || 0,
    discount_amount: Number(item.discount_amount) || 0,
    tax_rate: Number(item.tax_rate) || 0,
    tax_amount: Number(item.tax_amount) || 0,
    subtotal: Number(item.subtotal) || 0,
    total: Number(item.total) || 0,
    total_price: Number(item.total_price || item.total) || 0,
    notes: item.notes || null,
    metadata: item.metadata || {},
  }));
}

export async function persistQuotationCreate(record, items = []) {
  const result = await supabase.from('quotations').insert([record]).select('*').single();
  if (result.error) return result;

  if (!items.length) {
    return { data: mapQuotationRow(result.data), error: null };
  }

  const itemRows = prepareQuotationItemsForDb(items, result.data.id);
  const itemsResult = await supabase.from('quotation_items').insert(itemRows).select('*');
  if (itemsResult.error) {
    await supabase.from('quotations').delete().eq('id', result.data.id);
    return { data: null, error: itemsResult.error };
  }

  return {
    data: {
      ...mapQuotationRow(result.data),
      items: itemsResult.data || [],
    },
    error: null,
  };
}

export async function persistQuotationUpdate(id, record, items = []) {
  const result = await supabase.from('quotations').update(record).eq('id', id).select('*').single();
  if (result.error) return result;

  const deleteResult = await supabase.from('quotation_items').delete().eq('quotation_id', id);
  if (deleteResult.error) {
    return { data: mapQuotationRow(result.data), error: deleteResult.error };
  }

  if (!items.length) {
    return { data: mapQuotationRow(result.data), error: null };
  }

  const itemRows = prepareQuotationItemsForDb(items, id);
  const itemsResult = await supabase.from('quotation_items').insert(itemRows).select('*');
  if (itemsResult.error) {
    return { data: mapQuotationRow(result.data), error: itemsResult.error };
  }

  return {
    data: {
      ...mapQuotationRow(result.data),
      items: itemsResult.data || [],
    },
    error: null,
  };
}

export async function fetchNextQuotationNumberPreview() {
  const { count, error } = await supabase.from('quotations').select('id', { count: 'exact', head: true });
  if (error) {
    return { data: null, error };
  }
  return { data: (count || 0) + 1, error: null };
}

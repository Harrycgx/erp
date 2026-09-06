import supabase from "../lib/supabase";

/**
 * Projection Service
 * Provides customer-safe projections of operational data.
 * Masks sensitive fields such as internal costs, margins, etc.
 */

export async function getQuoteForCustomer(quoteId) {
  // Fetch quote with safe fields only
  const { data, error } = await supabase
    .from('quotations')
    .select('id, quotation_number, status, box_type, length, width, height, quantity, flute_type, ply, gsm, printing_type, lamination, urgency, valid_until, notes')
    .eq('id', quoteId)
    .single();

  if (error) throw error;
  return data;
}

export async function getOrderForCustomer(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, status, production_stage, payment_status, box_type, quantity, due_date, completed_at, notes')
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
}

export async function getInvoiceForCustomer(invoiceId) {
  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, invoice_date, issue_date, due_date, subtotal, gst_amount, tax_amount, paid_amount, payment_status, notes')
    .eq('id', invoiceId)
    .single();

  if (error) throw error;
  return data;
}

export async function getProductionStatusForCustomer(orderId) {
  // Get the production job for the order and return high-level status
  const { data, error } = await supabase
    .from('production_jobs')
    .select('id, production_number, production_stage, status, priority, assigned_to, estimated_completion, started_at, completed_at, notes')
    .eq('order_id', orderId)
    .single();

  if (error) throw error;
  return data;
}

// Additional projection functions can be added as needed, e.g., for customers to see their quote/order history.

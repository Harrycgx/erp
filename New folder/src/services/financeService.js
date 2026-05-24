import supabase from '../lib/supabase';

export async function fetchInvoices() {
  return supabase.from('invoices').select('*').order('created_at', { ascending: false });
}

export async function fetchInvoiceById(id) {
  return supabase.from('invoices').select('*').eq('id', id).single();
}

export async function insertInvoice(invoice) {
  return supabase.from('invoices').insert([invoice]);
}

export async function updateInvoice(id, updates) {
  return supabase.from('invoices').update(updates).eq('id', id);
}

export async function fetchPayments() {
  return supabase.from('payments').select('*').order('payment_date', { ascending: false });
}

export async function fetchPaymentsByInvoice(invoiceId) {
  return supabase.from('payments').select('*').eq('invoice_id', invoiceId).order('payment_date', { ascending: false });
}

export async function insertPayment(payment) {
  return supabase.from('payments').insert([payment]);
}

export async function createInvoiceForOrder(order, options = {}) {
  const invoicePayload = {
    customer_id: order.customer_id,
    order_id: order.id,
    invoice_number: options.invoice_number || `INV-${Date.now().toString().slice(-6)}`,
    issue_date: options.issue_date || new Date().toISOString().slice(0, 10),
    due_date: options.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    subtotal: Number(order.total || 0),
    gst_rate: Number(order.gst_rate || 0),
    gst_amount: Number(order.gst_amount || 0),
    tax_amount: Number(order.tax_amount || 0),
    paid_amount: 0,
    payment_status: 'Due',
    total: Number(order.total || 0),
    status: 'Open',
    notes: options.notes || `Auto-generated invoice for order ${order.order_number}`,
    metadata: {
      ...(order.metadata || {}),
      order_snapshot: {
        order_id: order.id,
        order_number: order.order_number,
        box_type: order.box_type,
        quantity: order.quantity,
        total: order.total,
      },
      generated_by: options.generated_by || 'system',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const invoiceResult = await supabase.from('invoices').insert([invoicePayload]).select('*').single();
  if (invoiceResult.error) return invoiceResult;

  const ledgerEntry = {
    customer_id: order.customer_id,
    entry_date: invoicePayload.issue_date,
    entry_type: 'Invoice',
    debit: invoicePayload.total,
    credit: 0,
    amount: invoicePayload.total,
    description: `Sales invoice ${invoicePayload.invoice_number}`,
    metadata: { invoice_id: invoiceResult.data.id, order_id: order.id },
    created_at: new Date().toISOString(),
  };

  const ledgerResult = await insertLedgerEntry(ledgerEntry);
  if (ledgerResult.error) {
    await supabase.from('invoices').delete().eq('id', invoiceResult.data.id);
    return { data: null, error: ledgerResult.error };
  }

  return invoiceResult;
}

export async function recordPayment({ invoiceId, customerId, amount, paymentMethod, paymentDate, notes, createdBy }) {
  const paymentPayload = {
    invoice_id: invoiceId,
    customer_id: customerId,
    amount: Number(amount || 0),
    payment_date: paymentDate || new Date().toISOString().slice(0, 10),
    payment_method: paymentMethod,
    notes,
    metadata: {},
    created_at: new Date().toISOString(),
  };

  const paymentResult = await insertPayment(paymentPayload);
  if (paymentResult.error) return paymentResult;

  const invoiceResult = await fetchInvoiceById(invoiceId);
  if (invoiceResult.error) return invoiceResult;

  const currentInvoice = invoiceResult.data;
  const paidAmount = Number(currentInvoice.paid_amount || 0) + Number(paymentPayload.amount || 0);
  const isPaid = paidAmount >= Number(currentInvoice.total || 0);
  const invoiceUpdates = {
    paid_amount: paidAmount,
    payment_status: isPaid ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Due',
    status: isPaid ? 'Paid' : currentInvoice.status || 'Open',
    updated_at: new Date().toISOString(),
  };

  const updateResult = await updateInvoice(invoiceId, invoiceUpdates);
  if (updateResult.error) return updateResult;

  const ledgerResult = await insertLedgerEntry({
    customer_id: customerId,
    entry_date: paymentPayload.payment_date,
    entry_type: 'Payment',
    debit: 0,
    credit: paymentPayload.amount,
    amount: paymentPayload.amount,
    description: notes || `Payment received for invoice ${currentInvoice.invoice_number}`,
    metadata: { invoice_id: invoiceId, payment_id: paymentResult.data?.[0]?.id || null },
    created_at: new Date().toISOString(),
  });

  if (ledgerResult.error) {
    return { data: paymentResult.data, error: ledgerResult.error };
  }

  const transactionResult = await insertFinancialTransaction({
    customer_id: customerId,
    invoice_id: invoiceId,
    order_id: currentInvoice.order_id,
    transaction_type: 'Receipt',
    amount: paymentPayload.amount,
    transaction_date: paymentPayload.payment_date,
    notes: notes || `Payment recorded for invoice ${currentInvoice.invoice_number}`,
    metadata: { payment_id: paymentResult.data?.[0]?.id || null },
    created_by: createdBy,
    created_at: new Date().toISOString(),
  });

  if (transactionResult.error) {
    return { data: paymentResult.data, error: transactionResult.error };
  }

  return paymentResult;
}

export async function insertFinancialTransaction(transaction) {
  return supabase.from('financial_transactions').insert([transaction]);
}

export async function fetchLedgerEntries() {
  return supabase.from('customer_ledgers').select('*').order('entry_date', { ascending: false });
}

export async function fetchLedgerEntriesByCustomer(customerId) {
  return supabase.from('customer_ledgers').select('*').eq('customer_id', customerId).order('entry_date', { ascending: false });
}

export async function insertLedgerEntry(entry) {
  return supabase.from('customer_ledgers').insert([entry]);
}

export async function fetchFinancialTransactions() {
  return supabase.from('financial_transactions').select('*').order('transaction_date', { ascending: false });
}

export async function fetchFinancialSummary() {
  const [invoicesResult, paymentsResult, transactionsResult] = await Promise.all([
    fetchInvoices(),
    fetchPayments(),
    fetchFinancialTransactions(),
  ]);

  const error = invoicesResult.error || paymentsResult.error || transactionsResult.error;
  if (error) return { data: null, error };

  const invoices = invoicesResult.data || [];
  const payments = paymentsResult.data || [];
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return {
    data: {
      total_invoiced: totalInvoiced,
      total_paid: totalPaid,
      outstanding: totalInvoiced - totalPaid,
      invoice_count: invoices.length,
      payment_count: payments.length,
      transactions: transactionsResult.data || [],
    },
    error: null,
  };
}

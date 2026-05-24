import supabase from '../lib/supabase';
import { reconcilePaymentBalance } from './invoiceCalculationService';

export const LEDGER_REFERENCE_TYPES = {
  INVOICE: 'invoice',
  PAYMENT: 'payment',
  SALES_ORDER: 'sales_order',
  ADJUSTMENT: 'adjustment',
};

export async function insertLedgerEntry(entry) {
  return supabase.from('customer_ledgers').insert([entry]).select('*');
}

export async function recordInvoiceLedgerEntry({
  customerId,
  invoiceId,
  salesOrderId = null,
  amount,
  entryDate,
  description,
  metadata = {},
}) {
  const debit = Number(amount) || 0;
  return insertLedgerEntry({
    customer_id: customerId,
    entry_date: entryDate || new Date().toISOString().slice(0, 10),
    entry_type: 'invoice',
    debit,
    credit: 0,
    amount: debit,
    description: description || `Sales invoice`,
    metadata: {
      ...metadata,
      reference_type: LEDGER_REFERENCE_TYPES.INVOICE,
      reference_id: invoiceId,
      invoice_id: invoiceId,
      sales_order_id: salesOrderId,
    },
    created_at: new Date().toISOString(),
  });
}

export async function recordPaymentLedgerEntry({
  customerId,
  invoiceId,
  paymentId = null,
  amount,
  entryDate,
  description,
  metadata = {},
}) {
  const credit = Number(amount) || 0;
  return insertLedgerEntry({
    customer_id: customerId,
    entry_date: entryDate || new Date().toISOString().slice(0, 10),
    entry_type: 'payment',
    debit: 0,
    credit,
    amount: credit,
    description: description || `Payment received`,
    metadata: {
      ...metadata,
      reference_type: LEDGER_REFERENCE_TYPES.PAYMENT,
      reference_id: paymentId,
      invoice_id: invoiceId,
      payment_id: paymentId,
    },
    created_at: new Date().toISOString(),
  });
}

export async function fetchLedgerEntries() {
  return supabase.from('customer_ledgers').select('*').order('entry_date', { ascending: false });
}

export async function fetchLedgerEntriesByCustomer(customerId) {
  return supabase
    .from('customer_ledgers')
    .select('*')
    .eq('customer_id', customerId)
    .order('entry_date', { ascending: false });
}

export async function calculateCustomerBalance(customerId) {
  const { data, error } = await fetchLedgerEntriesByCustomer(customerId);
  if (error) return { data: null, error };

  const totals = (data || []).reduce(
    (acc, entry) => {
      acc.debit += Number(entry.debit || 0);
      acc.credit += Number(entry.credit || 0);
      return acc;
    },
    { debit: 0, credit: 0 }
  );

  const balance = Number((totals.debit - totals.credit).toFixed(2));
  return {
    data: {
      ...totals,
      balance,
      outstanding: Math.max(balance, 0),
    },
    error: null,
  };
}

export async function fetchCustomerOutstandingFromInvoices(customerId) {
  const { data, error } = await supabase
    .from('invoices')
    .select('total, total_amount, paid_amount')
    .eq('customer_id', customerId);

  if (error) return { data: null, error };

  const outstanding = (data || []).reduce((sum, invoice) => {
    const { due_amount } = reconcilePaymentBalance({
      totalAmount: invoice.total_amount ?? invoice.total,
      paidAmount: invoice.paid_amount,
    });
    return sum + due_amount;
  }, 0);

  return { data: { outstanding: Number(outstanding.toFixed(2)) }, error: null };
}

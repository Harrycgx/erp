import supabase from '../lib/supabase';
import {
  deriveInvoiceStatus,
  reconcilePaymentBalance,
  validatePaymentAmount,
} from './invoiceCalculationService';
import { fetchInvoiceById, updateInvoiceBalanceAfterPayment } from './invoiceService';
import { recordPaymentLedgerEntry } from './ledgerService';

export async function fetchPayments() {
  return supabase.from('payments').select('*').order('payment_date', { ascending: false });
}

export async function fetchPaymentsByInvoice(invoiceId) {
  return supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('payment_date', { ascending: false });
}

export async function fetchPaymentHistory(invoiceId) {
  return fetchPaymentsByInvoice(invoiceId);
}

export function validatePayment({ invoice, amount }) {
  if (!invoice?.id) {
    return { valid: false, message: 'Invoice is required.' };
  }

  const balance = reconcilePaymentBalance({
    totalAmount: invoice.total_amount ?? invoice.total,
    paidAmount: invoice.paid_amount,
  });

  return validatePaymentAmount({
    amount,
    dueAmount: balance.due_amount,
    paidAmount: balance.paid_amount,
    totalAmount: balance.total_amount,
  });
}

export async function recordPayment({
  invoiceId,
  customerId,
  amount,
  paymentMethod = '',
  paymentDate = null,
  transactionReference = '',
  notes = '',
  createdBy = null,
}) {
  const invoiceResult = await fetchInvoiceById(invoiceId);
  if (invoiceResult.error) return { data: null, error: invoiceResult.error };

  const invoice = invoiceResult.data;
  const validation = validatePayment({ invoice, amount });
  if (!validation.valid) {
    return { data: null, error: new Error(validation.message) };
  }

  const paymentPayload = {
    invoice_id: invoiceId,
    customer_id: customerId || invoice.customer_id,
    amount: Number(amount),
    payment_date: paymentDate || new Date().toISOString().slice(0, 10),
    payment_method: paymentMethod || null,
    transaction_reference: transactionReference || null,
    notes: notes || null,
    metadata: {
      invoice_number: invoice.invoice_number,
      sales_order_id: invoice.sales_order_id || invoice.metadata?.sales_order_id,
    },
    created_at: new Date().toISOString(),
  };

  const paymentResult = await supabase.from('payments').insert([paymentPayload]).select('*').single();
  if (paymentResult.error) return { data: null, error: paymentResult.error };

  const newPaidAmount = Number(invoice.paid_amount || 0) + Number(amount);
  const balanceUpdate = await updateInvoiceBalanceAfterPayment(invoiceId, newPaidAmount);
  if (balanceUpdate.error) {
    await supabase.from('payments').delete().eq('id', paymentResult.data.id);
    return { data: null, error: balanceUpdate.error };
  }

  const ledgerResult = await recordPaymentLedgerEntry({
    customerId: paymentPayload.customer_id,
    invoiceId,
    paymentId: paymentResult.data.id,
    amount: paymentPayload.amount,
    entryDate: paymentPayload.payment_date,
    description: notes || `Payment for invoice ${invoice.invoice_number}`,
    metadata: { transaction_reference: transactionReference },
  });

  if (ledgerResult.error) {
    return { data: paymentResult.data, error: ledgerResult.error };
  }

  await supabase.from('financial_transactions').insert([
    {
      customer_id: paymentPayload.customer_id,
      invoice_id: invoiceId,
      order_id: invoice.order_id,
      transaction_type: 'receipt',
      amount: paymentPayload.amount,
      transaction_date: paymentPayload.payment_date,
      notes: notes || `Payment for invoice ${invoice.invoice_number}`,
      metadata: {
        payment_id: paymentResult.data.id,
        transaction_reference: transactionReference,
      },
      created_by: createdBy,
      created_at: new Date().toISOString(),
    },
  ]);

  await supabase.from('activity_logs').insert([
    {
      actor_id: createdBy,
      customer_id: paymentPayload.customer_id,
      activity_type: 'payment_recorded',
      message: `Payment ${paymentPayload.amount} recorded for invoice ${invoice.invoice_number}.`,
      metadata: {
        invoice_id: invoiceId,
        payment_id: paymentResult.data.id,
        status: deriveInvoiceStatus({
          totalAmount: invoice.total_amount,
          paidAmount: newPaidAmount,
          dueDate: invoice.due_date,
        }),
      },
    },
  ]);

  return {
    data: {
      payment: paymentResult.data,
      invoice: balanceUpdate.data,
    },
    error: null,
  };
}

export async function insertPayment(payment) {
  return supabase.from('payments').insert([payment]);
}

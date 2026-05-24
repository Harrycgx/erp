/**
 * Backward-compatible finance facade — prefer invoiceService, paymentService, ledgerService.
 */
export {
  fetchInvoices,
  fetchInvoiceById,
  fetchInvoiceWithDetails,
  fetchInvoiceBySalesOrderId,
  generateInvoiceFromSalesOrder,
  generateInvoiceNumber,
  createInvoiceForOrder,
  insertInvoice,
  updateInvoice,
  updateInvoiceStatus,
  INVOICE_STATUSES,
} from './invoiceService';

export {
  fetchPayments,
  fetchPaymentsByInvoice,
  fetchPaymentHistory,
  recordPayment,
  insertPayment,
  validatePayment,
} from './paymentService';

export {
  fetchLedgerEntries,
  fetchLedgerEntriesByCustomer,
  insertLedgerEntry,
  recordInvoiceLedgerEntry,
  recordPaymentLedgerEntry,
  calculateCustomerBalance,
  fetchCustomerOutstandingFromInvoices,
  LEDGER_REFERENCE_TYPES,
} from './ledgerService';

export {
  calculateInvoiceTotals,
  calculateInvoiceItem,
  deriveInvoiceStatus,
  reconcilePaymentBalance,
  validatePaymentAmount,
} from './invoiceCalculationService';

import { fetchInvoices } from './invoiceService';
import { fetchPayments } from './paymentService';
import { insertLedgerEntry } from './ledgerService';
import supabase from '../lib/supabase';

export async function insertFinancialTransaction(transaction) {
  return supabase.from('financial_transactions').insert([transaction]);
}

export async function fetchFinancialTransactions() {
  return supabase.from('financial_transactions').select('*').order('transaction_date', { ascending: false });
}

export async function fetchFinancialSummary() {
  const [invoicesResult, paymentsResult] = await Promise.all([fetchInvoices(), fetchPayments()]);
  const error = invoicesResult.error || paymentsResult.error;
  if (error) return { data: null, error };

  const invoices = invoicesResult.data || [];
  const payments = paymentsResult.data || [];
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount || invoice.total || 0), 0);
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return {
    data: {
      total_invoiced: totalInvoiced,
      total_paid: totalPaid,
      outstanding: Number((totalInvoiced - totalPaid).toFixed(2)),
      invoice_count: invoices.length,
      payment_count: payments.length,
    },
    error: null,
  };
}

import supabase from '../lib/supabase';

export async function fetchTallyExportRecords({ fromDate, toDate } = {}) {
  const invoiceQuery = supabase.from('invoices').select('*');
  const paymentQuery = supabase.from('payments').select('*');

  if (fromDate) {
    invoiceQuery.gte('issue_date', fromDate);
    paymentQuery.gte('payment_date', fromDate);
  }
  if (toDate) {
    invoiceQuery.lte('issue_date', toDate);
    paymentQuery.lte('payment_date', toDate);
  }

  const [invoiceResult, paymentResult] = await Promise.all([invoiceQuery.order('issue_date', { ascending: true }), paymentQuery.order('payment_date', { ascending: true })]);
  if (invoiceResult.error || paymentResult.error) {
    return { data: null, error: invoiceResult.error || paymentResult.error };
  }

  const customerIds = Array.from(new Set([
    ...(invoiceResult.data || []).map((invoice) => invoice.customer_id),
    ...(paymentResult.data || []).map((payment) => payment.customer_id),
  ].filter(Boolean)));

  const customerResult = await supabase.from('customers').select('id,company_name,full_name').in('id', customerIds);
  if (customerResult.error) {
    return { data: null, error: customerResult.error };
  }

  const customers = (customerResult.data || []).reduce((acc, customer) => {
    acc[customer.id] = customer;
    return acc;
  }, {});

  const records = [];
  (invoiceResult.data || []).forEach((invoice) => {
    const customer = customers[invoice.customer_id];
    records.push({
      type: 'Sales',
      date: invoice.issue_date || invoice.invoice_date || new Date().toISOString().slice(0, 10),
      voucher_number: invoice.invoice_number || invoice.id,
      ledger_name: 'Sales Account',
      party_name: customer?.company_name || customer?.full_name || invoice.customer_id || 'Unknown',
      amount: Number(invoice.total || 0),
      gst_amount: Number(invoice.gst_amount || invoice.tax_amount || 0),
      narration: `Invoice ${invoice.invoice_number || invoice.id}`,
      order_reference: invoice.order_id,
    });
  });

  (paymentResult.data || []).forEach((payment) => {
    const customer = customers[payment.customer_id];
    records.push({
      type: 'Receipt',
      date: payment.payment_date || new Date().toISOString().slice(0, 10),
      voucher_number: `PAY-${payment.id.toString().slice(-6)}`,
      ledger_name: payment.payment_method || 'Bank',
      party_name: customer?.company_name || customer?.full_name || payment.customer_id || 'Unknown',
      amount: Number(payment.amount || 0),
      gst_amount: 0,
      narration: `Payment received for invoice ${payment.invoice_id}`,
      order_reference: payment.order_id,
    });
  });

  return { data: records, error: null };
}

export function buildTallyCsv(records = []) {
  const header = ['Date', 'VoucherType', 'VoucherNumber', 'LedgerName', 'PartyName', 'Amount', 'GSTAmount', 'Narration', 'OrderReference'];
  const rows = records.map((record) => [
    record.date,
    record.type,
    record.voucher_number,
    record.ledger_name,
    record.party_name,
    record.amount.toFixed(2),
    record.gst_amount.toFixed(2),
    record.narration,
    record.order_reference || '',
  ].map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(','));
  return [header.map((value) => `"${value}"`).join(','), ...rows].join('\n');
}

export function downloadCsvFile(content, filename = 'tally-export.csv') {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

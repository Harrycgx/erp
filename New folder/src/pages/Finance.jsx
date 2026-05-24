import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import { fetchInvoices, fetchPayments } from '../services/financeService';
import { fetchCustomers } from '../services/inquiryService';
import { formatCurrency } from '../utils/formatters';
import { getInvoiceStatus, formatDate } from '../utils/financeHelpers';
import { fetchTallyExportRecords, buildTallyCsv, downloadCsvFile } from '../services/tallyExportService';

export default function Finance() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [invoiceResp, paymentResp, customerResp] = await Promise.all([
      fetchInvoices(),
      fetchPayments(),
      fetchCustomers(),
    ]);

    if (invoiceResp.error || paymentResp.error || customerResp.error) {
      setError(invoiceResp.error?.message || paymentResp.error?.message || customerResp.error?.message || 'Unable to load finance data.');
      setLoading(false);
      return;
    }

    setInvoices(invoiceResp.data || []);
    setPayments(paymentResp.data || []);
    setCustomers(customerResp.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportTally = async () => {
    setExporting(true);
    const { data, error: exportError } = await fetchTallyExportRecords();
    if (exportError) {
      setError(exportError.message || 'Unable to generate Tally export.');
      setExporting(false);
      return;
    }

    const csv = buildTallyCsv(data || []);
    downloadCsvFile(csv, 'tally-export.csv');
    setExporting(false);
  };

  const totalRevenue = useMemo(
    () => payments.reduce((total, payment) => total + Number(payment.amount || 0), 0),
    [payments]
  );

  const outstandingAmount = useMemo(
    () => invoices.reduce((total, invoice) => {
      const paid = Number(invoice.paid_amount || 0);
      const balance = Number(invoice.total || 0) - paid;
      return total + Math.max(0, balance);
    }, 0),
    [invoices]
  );

  const gstCollected = useMemo(
    () => invoices.reduce((total, invoice) => total + Number(invoice.gst_amount || 0), 0),
    [invoices]
  );

  const overdueCount = useMemo(
    () => invoices.filter((invoice) => getInvoiceStatus({ total: invoice.total, paid: invoice.paid_amount || 0, dueDate: invoice.due_date }) === 'Overdue').length,
    [invoices]
  );

  const recentPayments = useMemo(
    () => payments.slice(0, 5),
    [payments]
  );

  const openInvoices = useMemo(
    () => invoices.filter((invoice) => getInvoiceStatus({ total: invoice.total, paid: invoice.paid_amount || 0, dueDate: invoice.due_date }) !== 'Paid').slice(0, 5),
    [invoices]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090d16] text-white pt-28">
        <Container className="py-16">
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-10 text-center text-slate-300">Loading finance dashboard…</div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Finance operations"
              title="Manage billing, payments, and GST reports in one place"
              description="Track cash flow, invoice status, and customer collections with a finance dashboard built for manufacturing operations."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard value={formatCurrency(totalRevenue)} label="Revenue collected" />
              <StatCard value={formatCurrency(outstandingAmount)} label="Outstanding dues" />
              <StatCard value={formatCurrency(gstCollected)} label="GST collected" />
              <StatCard value={overdueCount} label="Overdue invoices" />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportTally}
                disabled={exporting}
                className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting ? 'Exporting Tally...' : 'Export Tally CSV'}
              </button>
              <p className="text-sm text-slate-400">Download sales and receipts for Tally import.</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Finance health</p>
            <h3 className="mt-3 text-3xl font-black text-white">Cash flow snapshot</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">Review collections, prioritize overdue accounts, and spot customer payment gaps before they affect production. All figures are refreshed from invoices and payments.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Recent collections</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Payments received</h2>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full table-auto text-left text-sm text-slate-300">
                  <thead className="border-b border-slate-800 text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.length > 0 ? recentPayments.map((payment) => {
                      const customer = customers.find((item) => item.id === payment.customer_id);
                      return (
                        <tr key={payment.id} className="border-b border-slate-800 hover:bg-slate-900/80">
                          <td className="px-4 py-4">{formatDate(payment.payment_date)}</td>
                          <td className="px-4 py-4 text-white">{customer?.company_name || 'N/A'}</td>
                          <td className="px-4 py-4">{formatCurrency(payment.amount)}</td>
                          <td className="px-4 py-4">{payment.payment_method || 'Unknown'}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-4 text-slate-500">No recent payments recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Priority invoices</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Open and overdue</h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {openInvoices.length > 0 ? openInvoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">{invoice.invoice_number}</p>
                        <p className="mt-1 text-white">{customers.find((item) => item.id === invoice.customer_id)?.company_name || 'Customer'} • {formatCurrency(invoice.total)}</p>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-xs font-semibold ${getInvoiceStatus({ total: invoice.total, paid: invoice.paid_amount || 0, dueDate: invoice.due_date }) === 'Overdue' ? 'bg-rose-500/10 text-rose-300' : 'bg-orange-500/10 text-orange-300'}`}>
                        {getInvoiceStatus({ total: invoice.total, paid: invoice.paid_amount || 0, dueDate: invoice.due_date })}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">Due {formatDate(invoice.due_date)} • Remaining {formatCurrency(Math.max(0, Number(invoice.total || 0) - Number(invoice.paid_amount || 0)))}</p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400">No open invoices at the moment.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

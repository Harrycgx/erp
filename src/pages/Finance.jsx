import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import { ErrorBanner, LoadingState } from '../components/ui/OperationalState';
import SectionHeading from '../components/ui/SectionHeading';
import FinanceInvoiceTable from '../features/finance/FinanceInvoiceTable';
import { fetchInvoices } from '../services/invoiceService';
import { fetchPayments } from '../services/paymentService';
import { fetchCustomers } from '../services/inquiryService';
import { deriveInvoiceStatus, INVOICE_STATUSES } from '../services/invoiceCalculationService';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/financeHelpers';
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
      setError(
        invoiceResp.error?.message || paymentResp.error?.message || customerResp.error?.message || 'Unable to load finance data.'
      );
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
    downloadCsvFile(buildTallyCsv(data || []), 'tally-export.csv');
    setExporting(false);
  };

  const unpaid = useMemo(
    () =>
      invoices.filter((inv) =>
        [INVOICE_STATUSES.UNPAID, INVOICE_STATUSES.PARTIAL].includes(
          deriveInvoiceStatus({
            totalAmount: inv.total_amount,
            paidAmount: inv.paid_amount,
            dueDate: inv.due_date,
          })
        )
      ),
    [invoices]
  );

  const overdue = useMemo(
    () =>
      invoices.filter(
        (inv) =>
          deriveInvoiceStatus({
            totalAmount: inv.total_amount,
            paidAmount: inv.paid_amount,
            dueDate: inv.due_date,
          }) === INVOICE_STATUSES.OVERDUE
      ),
    [invoices]
  );

  const outstanding = useMemo(
    () => invoices.reduce((sum, inv) => sum + Number(inv.due_amount || 0), 0),
    [invoices]
  );

  const recentPayments = useMemo(() => payments.slice(0, 8), [payments]);

  return (
    <main className="min-h-screen bg-[#090d16] pt-28 text-white">
      <Container className="space-y-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Finance"
            title="Invoices & collections"
            description="Operational billing after dispatch-ready production. GST totals, payments, and customer dues."
          />
          <div className="flex flex-wrap gap-2">
            <Link to="/invoices" className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800">
              All invoices
            </Link>
            <Link to="/payments" className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800">
              Record payment
            </Link>
            <button
              type="button"
              disabled={exporting}
              onClick={handleExportTally}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            >
              {exporting ? 'Exporting…' : 'Tally CSV'}
            </button>
          </div>
        </div>

        <ErrorBanner message={error} onDismiss={() => setError('')} />

        {loading ? <LoadingState message="Loading finance data…" /> : null}

        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-slate-300">
            Unpaid / partial: <strong className="text-white">{unpaid.length}</strong>
          </span>
          <span className="rounded-lg border border-rose-800/50 bg-rose-950/30 px-3 py-1.5 text-rose-100">
            Overdue: <strong>{overdue.length}</strong>
          </span>
          <span className="rounded-lg border border-amber-800/50 bg-amber-950/30 px-3 py-1.5 text-amber-100">
            Outstanding: <strong>{formatCurrency(outstanding)}</strong>
          </span>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Unpaid & overdue invoices</p>
            <FinanceInvoiceTable
              invoices={[...overdue, ...unpaid.filter((i) => !overdue.find((o) => o.id === i.id))].slice(0, 20)}
              customers={customers}
              loading={loading}
            />
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Recent payments</p>
            {recentPayments.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {recentPayments.map((payment) => (
                  <li key={payment.id} className="flex justify-between gap-3 border-b border-slate-800 py-2">
                    <span className="text-slate-400">
                      {formatDate(payment.payment_date)}
                      {payment.metadata?.invoice_number ? ` · ${payment.metadata.invoice_number}` : ''}
                    </span>
                    <span className="font-medium text-emerald-300">{formatCurrency(payment.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No payments yet.</p>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}

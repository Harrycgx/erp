import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import RecordPaymentForm from '../features/finance/RecordPaymentForm';
import { fetchInvoices } from '../services/invoiceService';
import { fetchPayments, recordPayment } from '../services/paymentService';
import { fetchCustomers } from '../services/inquiryService';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/financeHelpers';

export default function Payments() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
      setError(invoiceResp.error?.message || paymentResp.error?.message || customerResp.error?.message);
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

  const outstanding = useMemo(
    () => invoices.filter((inv) => Number(inv.due_amount || 0) > 0),
    [invoices]
  );

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || outstanding[0] || null;

  const handlePayment = async (payload) => {
    if (!selectedInvoice) return;
    setSaving(true);
    setError('');
    const { error: payError } = await recordPayment({
      invoiceId: selectedInvoice.id,
      customerId: selectedInvoice.customer_id,
      ...payload,
    });
    if (payError) {
      setError(payError.message || 'Unable to record payment.');
    } else {
      await loadData();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090d16] pt-28 text-white">
        <Container className="py-12 text-sm text-slate-400">Loading payments…</Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090d16] pt-28 text-white">
      <Container className="space-y-6 py-12">
        <SectionHeading
          eyebrow="Payments"
          title="Record customer receipts"
          description="Apply partial or full payments against open invoices. Ledger entries are created automatically."
        />

        {error ? (
          <div className="rounded-lg border border-rose-600/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Open invoices</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-2 text-left">Invoice</th>
                    <th className="pb-2">Due</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {outstanding.map((inv) => (
                    <tr key={inv.id} className="border-t border-slate-800">
                      <td className="py-2">
                        <Link to={`/invoices/${inv.id}`} className="text-orange-400 hover:text-orange-300">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="py-2 text-slate-300">{formatCurrency(inv.due_amount)}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceId(inv.id)}
                          className={`text-xs ${selectedInvoice?.id === inv.id ? 'text-orange-400' : 'text-slate-500'}`}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
            <RecordPaymentForm invoice={selectedInvoice} onSubmit={handlePayment} loading={saving} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Recent payments</p>
          <ul className="mt-3 space-y-2 text-sm">
            {payments.slice(0, 15).map((payment) => (
              <li key={payment.id} className="flex justify-between gap-3 border-b border-slate-800 py-2">
                <span className="text-slate-400">{formatDate(payment.payment_date)}</span>
                <span className="text-emerald-300">{formatCurrency(payment.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </main>
  );
}

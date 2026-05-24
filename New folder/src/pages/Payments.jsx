import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import { fetchInvoices, fetchPayments, recordPayment } from '../services/financeService';
import { fetchCustomers } from '../services/inquiryService';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/financeHelpers';

const defaultForm = {
  invoice_id: '',
  customer_id: '',
  amount: '',
  payment_method: '',
  payment_date: new Date().toISOString().slice(0, 10),
  notes: '',
};

export default function Payments() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(defaultForm);
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
      setError(invoiceResp.error?.message || paymentResp.error?.message || customerResp.error?.message || 'Unable to load payment data.');
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

  const outstandingInvoices = useMemo(
    () => invoices.filter((invoice) => Number(invoice.total || 0) > Number(invoice.paid_amount || 0)),
    [invoices]
  );

  const totals = useMemo(() => ({
    invoices: invoices.length,
    payments: payments.length,
    due: outstandingInvoices.reduce((sum, invoice) => sum + (Number(invoice.total || 0) - Number(invoice.paid_amount || 0)), 0),
  }), [invoices, payments, outstandingInvoices]);

  const handleChange = (field, value) => {
    setForm((current) => {
      const nextForm = { ...current, [field]: value };
      if (field === 'invoice_id') {
        const selectedInvoice = invoices.find((invoice) => invoice.id === value);
        if (selectedInvoice) {
          nextForm.customer_id = selectedInvoice.customer_id || nextForm.customer_id;
        }
      }
      return nextForm;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    if (!form.invoice_id || !form.customer_id || !form.amount) {
      setError('Choose an invoice, customer and payment amount.');
      setSaving(false);
      return;
    }

    const paymentPayload = {
      invoiceId: form.invoice_id,
      customerId: form.customer_id,
      amount: Number(form.amount),
      paymentMethod: form.payment_method,
      paymentDate: form.payment_date,
      notes: form.notes,
      createdBy: null,
    };

    const { error: paymentError } = await recordPayment(paymentPayload);
    if (paymentError) {
      setError(paymentError.message || 'Unable to record payment.');
      setSaving(false);
      return;
    }

    await loadData();
    setForm(defaultForm);
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090d16] text-white pt-28">
        <Container className="py-16">
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-10 text-center text-slate-300">Loading payments…</div>
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
              eyebrow="Payments"
              title="Record receipts and reconcile customer collections"
              description="Capture incoming payments against invoices, track cash collected, and keep receivables aligned with the order lifecycle."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard value={totals.invoices} label="Invoices tracked" />
              <StatCard value={totals.payments} label="Payments recorded" />
              <StatCard value={formatCurrency(totals.due)} label="Amount due" />
              <StatCard value={outstandingInvoices.length} label="Open invoices" />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Payment control</p>
            <h3 className="mt-3 text-3xl font-black text-white">Cash collection</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">Log receipts linked to invoices and customers so the finance team can close receivables and update ledger balances.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <h2 className="text-2xl font-black text-white">Register a payment</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-300">
                  Invoice
                  <select
                    value={form.invoice_id}
                    onChange={(event) => handleChange('invoice_id', event.target.value)}
                    required
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                  >
                    <option value="">Select invoice</option>
                    {outstandingInvoices.map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number || invoice.id} • {formatCurrency(Number(invoice.total || 0) - Number(invoice.paid_amount || 0))} due
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-2 text-sm text-slate-300">
                  Customer
                  <select
                    value={form.customer_id}
                    onChange={(event) => handleChange('customer_id', event.target.value)}
                    required
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>{customer.company_name || customer.full_name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <label className="block space-y-2 text-sm text-slate-300">
                  Amount
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(event) => handleChange('amount', event.target.value)}
                    required
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                  />
                </label>
                <label className="block space-y-2 text-sm text-slate-300">
                  Payment method
                  <input
                    type="text"
                    value={form.payment_method}
                    onChange={(event) => handleChange('payment_method', event.target.value)}
                    placeholder="Cash / Bank / UPI"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                  />
                </label>
                <label className="block space-y-2 text-sm text-slate-300">
                  Payment date
                  <input
                    type="date"
                    value={form.payment_date}
                    onChange={(event) => handleChange('payment_date', event.target.value)}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                  />
                </label>
              </div>

              <label className="block space-y-2 text-sm text-slate-300">
                Notes
                <input
                  type="text"
                  value={form.notes}
                  onChange={(event) => handleChange('notes', event.target.value)}
                  placeholder="Payment reference or comments"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-orange-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Recording payment…' : 'Record payment'}
              </button>
            </form>
          </div>

          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <h2 className="text-2xl font-black text-white">Recent payments</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full table-auto text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? payments.map((payment) => {
                    const invoice = invoices.find((item) => item.id === payment.invoice_id);
                    const customer = customers.find((item) => item.id === payment.customer_id);
                    return (
                      <tr key={payment.id} className="border-b border-slate-800 hover:bg-slate-900/80">
                        <td className="px-4 py-4">{formatDate(payment.payment_date)}</td>
                        <td className="px-4 py-4 text-white">{customer?.company_name || customer?.full_name || 'Unknown'}</td>
                        <td className="px-4 py-4">{invoice?.invoice_number || payment.invoice_id}</td>
                        <td className="px-4 py-4">{formatCurrency(payment.amount)}</td>
                        <td className="px-4 py-4">{payment.payment_method || 'Unknown'}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-slate-500">No payments recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

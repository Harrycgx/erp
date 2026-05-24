import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import { fetchInvoices, insertInvoice, updateInvoice } from '../services/financeService';
import { fetchCustomers } from '../services/inquiryService';
import { buildInvoiceNumber, calculateInvoiceTotals, getInvoiceStatus, formatDate } from '../utils/financeHelpers';
import { formatCurrency } from '../utils/formatters';

const defaultInvoiceForm = () => ({
  invoice_number: buildInvoiceNumber(),
  customer_id: '',
  issue_date: new Date().toISOString().slice(0, 10),
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  subtotal: '0',
  gst_rate: '0.18',
  notes: '',
});

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form, setForm] = useState(defaultInvoiceForm());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [invoiceResp, customerResp] = await Promise.all([fetchInvoices(), fetchCustomers()]);

    if (invoiceResp.error || customerResp.error) {
      setError(invoiceResp.error?.message || customerResp.error?.message || 'Unable to load invoice data.');
      setLoading(false);
      return;
    }

    setInvoices(invoiceResp.data || []);
    setCustomers(customerResp.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totals = useMemo(
    () => calculateInvoiceTotals({ subtotal: Number(form.subtotal), gstRate: Number(form.gst_rate) }),
    [form.subtotal, form.gst_rate]
  );

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateInvoice = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      invoice_number: form.invoice_number,
      customer_id: form.customer_id,
      issue_date: form.issue_date,
      due_date: form.due_date,
      subtotal: Number(form.subtotal) || 0,
      gst_rate: Number(form.gst_rate) || 0,
      gst_amount: totals.gst,
      total: totals.total,
      paid_amount: 0,
      status: getInvoiceStatus({ total: totals.total, paid: 0, dueDate: form.due_date }),
      payment_status: 'Due',
      notes: form.notes,
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await insertInvoice(payload);
    if (insertError) {
      setError(insertError.message || 'Unable to create invoice.');
      setSaving(false);
      return;
    }

    await loadData();
    setForm(defaultInvoiceForm());
    setSaving(false);
  };

  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleMarkPaid = async (invoice) => {
    setSaving(true);
    setError('');

    const updates = {
      payment_status: 'Paid',
      status: 'Paid',
      paid_amount: invoice.total,
    };

    const { error: updateError } = await updateInvoice(invoice.id, updates);
    if (updateError) {
      setError(updateError.message || 'Unable to update invoice.');
    } else {
      await loadData();
      if (selectedInvoice?.id === invoice.id) {
        setSelectedInvoice({ ...invoice, ...updates });
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090d16] text-white pt-28">
        <Container className="py-16">
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-10 text-center text-slate-300">Loading invoices…</div>
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
              eyebrow="Invoice management"
              title="Create, send, and reconcile invoices quickly"
              description="Build invoices with GST, track payment progress, and preview customer billing statements from a centralized finance module."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard value={formatCurrency(totals.total)} label="Draft invoice total" />
              <StatCard value={`${Number(form.gst_rate) * 100}%`} label="GST rate" />
              <StatCard value={customers.length} label="Active customers" />
              <StatCard value={invoices.length} label="Invoices created" />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Invoice flow</p>
            <h3 className="mt-3 text-3xl font-black text-white">Generate a bill</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">Fill in customer, amount, and due dates to generate a digital invoice with built-in GST totals and status tracking.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <form onSubmit={handleCreateInvoice} className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
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
                        <option key={customer.id} value={customer.id}>{customer.company_name}</option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-2 text-sm text-slate-300">
                      Issue date
                      <input
                        type="date"
                        value={form.issue_date}
                        onChange={(event) => handleChange('issue_date', event.target.value)}
                        className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                      />
                    </label>
                    <label className="block space-y-2 text-sm text-slate-300">
                      Due date
                      <input
                        type="date"
                        value={form.due_date}
                        onChange={(event) => handleChange('due_date', event.target.value)}
                        className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <label className="block space-y-2 text-sm text-slate-300">
                    Subtotal
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.subtotal}
                      onChange={(event) => handleChange('subtotal', event.target.value)}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                    />
                  </label>
                  <label className="block space-y-2 text-sm text-slate-300">
                    GST rate
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.gst_rate}
                      onChange={(event) => handleChange('gst_rate', event.target.value)}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                    />
                  </label>
                  <label className="block space-y-2 text-sm text-slate-300">
                    Notes
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(event) => handleChange('notes', event.target.value)}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">GST</p>
                    <p className="mt-3 text-2xl font-black text-white">{formatCurrency(totals.gst)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total</p>
                    <p className="mt-3 text-2xl font-black text-white">{formatCurrency(totals.total)}</p>
                  </div>
                  <button
                    type="submit"
                    disabled={saving || !form.customer_id}
                    className="rounded-full bg-orange-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Create invoice'}
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Invoice ledger</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Recent invoices</h2>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full table-auto text-left text-sm text-slate-300">
                  <thead className="border-b border-slate-800 text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Invoice</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length > 0 ? invoices.map((invoice) => {
                      const customer = customers.find((item) => item.id === invoice.customer_id);
                      const status = getInvoiceStatus({ total: invoice.total, paid: invoice.paid_amount || 0, dueDate: invoice.due_date });
                      return (
                        <tr key={invoice.id} className="border-b border-slate-800 hover:bg-slate-900/80">
                          <td className="px-4 py-4 text-white">{invoice.invoice_number}</td>
                          <td className="px-4 py-4">{customer?.company_name || 'N/A'}</td>
                          <td className="px-4 py-4">{formatCurrency(invoice.total)}</td>
                          <td className="px-4 py-4 text-slate-300">{status}</td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => handleSelectInvoice(invoice)}
                              className="rounded-full border border-slate-700 bg-slate-950/90 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-900"
                            >
                              Preview
                            </button>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-slate-500">No invoices created yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedInvoice ? (
              <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Invoice preview</p>
                    <h2 className="mt-2 text-2xl font-black text-white">{selectedInvoice.invoice_number}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMarkPaid(selectedInvoice)}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                  >
                    Mark paid
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-950/80 p-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Customer</p>
                      <p className="mt-2 text-lg font-semibold text-white">{customers.find((item) => item.id === selectedInvoice.customer_id)?.company_name || 'Unknown'}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/80 p-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Due date</p>
                      <p className="mt-2 text-lg font-semibold text-white">{formatDate(selectedInvoice.due_date)}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total amount</p>
                      <p className="text-xl font-black text-white">{formatCurrency(selectedInvoice.total)}</p>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl bg-slate-900 p-3">
                        <p className="text-sm text-slate-400">Subtotal</p>
                        <p className="mt-1 font-semibold text-white">{formatCurrency(selectedInvoice.subtotal)}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-900 p-3">
                        <p className="text-sm text-slate-400">GST</p>
                        <p className="mt-1 font-semibold text-white">{formatCurrency(selectedInvoice.gst_amount)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-900/80 p-4">
                    <p className="text-sm text-slate-400">Notes</p>
                    <p className="mt-2 text-sm text-slate-200">{selectedInvoice.notes || 'No additional notes.'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
                <p className="text-sm text-slate-400">Select an invoice from the list to preview details and update payment status.</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}

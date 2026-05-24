import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import { fetchInvoices, fetchPayments, fetchLedgerEntries, insertLedgerEntry } from '../services/financeService';
import { fetchCustomers } from '../services/inquiryService';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/financeHelpers';

const defaultLedgerForm = {
  description: '',
  debit: '',
  credit: '',
  entry_date: new Date().toISOString().slice(0, 10),
};

export default function CustomerLedger() {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [ledgerForm, setLedgerForm] = useState(defaultLedgerForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [customerResp, invoiceResp, paymentResp, ledgerResp] = await Promise.all([
      fetchCustomers(),
      fetchInvoices(),
      fetchPayments(),
      fetchLedgerEntries(),
    ]);

    if (customerResp.error || invoiceResp.error || paymentResp.error || ledgerResp.error) {
      setError(customerResp.error?.message || invoiceResp.error?.message || paymentResp.error?.message || ledgerResp.error?.message || 'Unable to load ledger data.');
      setLoading(false);
      return;
    }

    setCustomers(customerResp.data || []);
    setInvoices(invoiceResp.data || []);
    setPayments(paymentResp.data || []);
    setLedgerEntries(ledgerResp.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const customerInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.customer_id === selectedCustomer?.id),
    [invoices, selectedCustomer]
  );

  const customerPayments = useMemo(
    () => payments.filter((payment) => payment.customer_id === selectedCustomer?.id),
    [payments, selectedCustomer]
  );

  const customerLedgerRows = useMemo(() => {
    if (!selectedCustomer) return [];
    const invoiceRows = customerInvoices.map((invoice) => ({
      type: 'Invoice',
      date: invoice.issue_date,
      description: invoice.invoice_number,
      debit: invoice.total,
      credit: 0,
    }));
    const paymentRows = customerPayments.map((payment) => ({
      type: 'Payment',
      date: payment.payment_date,
      description: payment.payment_method || 'Payment received',
      debit: 0,
      credit: Number(payment.amount || 0),
    }));
    const ledgerRows = ledgerEntries
      .filter((entry) => entry.customer_id === selectedCustomer.id)
      .map((entry) => ({
        type: 'Ledger',
        date: entry.entry_date,
        description: entry.description,
        debit: Number(entry.debit || 0),
        credit: Number(entry.credit || 0),
      }));

    return [...invoiceRows, ...paymentRows, ...ledgerRows].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [customerInvoices, customerPayments, ledgerEntries, selectedCustomer]);

  const totalInvoiced = useMemo(
    () => customerInvoices.reduce((total, invoice) => total + Number(invoice.total || 0), 0),
    [customerInvoices]
  );

  const totalPaid = useMemo(
    () => customerPayments.reduce((total, payment) => total + Number(payment.amount || 0), 0),
    [customerPayments]
  );

  const balanceDue = useMemo(() => Math.max(0, totalInvoiced - totalPaid), [totalInvoiced, totalPaid]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setLedgerForm(defaultLedgerForm);
  };

  const handleLedgerChange = (field, value) => {
    setLedgerForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveLedgerEntry = async (event) => {
    event.preventDefault();
    if (!selectedCustomer) {
      setError('Select a customer before adding ledger entries.');
      return;
    }

    setSaving(true);
    setError('');

    const ledgerPayload = {
      customer_id: selectedCustomer.id,
      description: ledgerForm.description,
      entry_date: ledgerForm.entry_date,
      debit: Number(ledgerForm.debit || 0),
      credit: Number(ledgerForm.credit || 0),
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await insertLedgerEntry(ledgerPayload);
    if (insertError) {
      setError(insertError.message || 'Unable to add ledger entry.');
      setSaving(false);
      return;
    }

    await loadData();
    setLedgerForm(defaultLedgerForm);
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090d16] text-white pt-28">
        <Container className="py-16">
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-10 text-center text-slate-300">Loading customer ledger…</div>
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
              eyebrow="Ledger control"
              title="Track customer balances and payments clearly"
              description="Review customer ledger history, add manual journal entries, and reconcile outstanding receivables alongside invoices and payments."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard value={customers.length} label="Tracked customers" />
              <StatCard value={formatCurrency(totalInvoiced)} label="Amount invoiced" />
              <StatCard value={formatCurrency(totalPaid)} label="Customer payments" />
              <StatCard value={formatCurrency(balanceDue)} label="Balance due" />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Account ledger</p>
            <h3 className="mt-3 text-3xl font-black text-white">Customer account health</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">Use customer ledger entries alongside invoices and payments to maintain compliance and keep cash collection visible.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Customer ledger</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Choose an account</h2>
                </div>
              </div>

              <div className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {customers.map((customer) => (
                    <button
                      type="button"
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className={`rounded-3xl border px-4 py-4 text-left transition ${selectedCustomer?.id === customer.id ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-slate-800 bg-slate-950/90 text-slate-300 hover:border-orange-500 hover:bg-slate-900/90'}`}
                    >
                      <p className="text-sm text-slate-400">{customer.company_name}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{customer.full_name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <h2 className="text-2xl font-black text-white">Ledger entries</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Manual journal entries help reconcile adjustments, credits, and one-off customer charges.</p>

              <form onSubmit={handleSaveLedgerEntry} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2 text-sm text-slate-300">
                    Description
                    <input
                      type="text"
                      value={ledgerForm.description}
                      onChange={(event) => handleLedgerChange('description', event.target.value)}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                      placeholder="Adjustment or note"
                    />
                  </label>
                  <label className="block space-y-2 text-sm text-slate-300">
                    Entry date
                    <input
                      type="date"
                      value={ledgerForm.entry_date}
                      onChange={(event) => handleLedgerChange('entry_date', event.target.value)}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2 text-sm text-slate-300">
                    Debit
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={ledgerForm.debit}
                      onChange={(event) => handleLedgerChange('debit', event.target.value)}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                    />
                  </label>
                  <label className="block space-y-2 text-sm text-slate-300">
                    Credit
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={ledgerForm.credit}
                      onChange={(event) => handleLedgerChange('credit', event.target.value)}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-orange-500"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!selectedCustomer || saving}
                  className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add ledger entry'}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Account summary</p>
                  <h2 className="mt-2 text-2xl font-black text-white">{selectedCustomer ? selectedCustomer.company_name : 'Select a customer'}</h2>
                </div>
              </div>

              {selectedCustomer ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Invoiced</p>
                    <p className="mt-3 text-3xl font-black text-white">{formatCurrency(totalInvoiced)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Paid</p>
                    <p className="mt-3 text-3xl font-black text-white">{formatCurrency(totalPaid)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Balance due</p>
                    <p className="mt-3 text-3xl font-black text-white">{formatCurrency(balanceDue)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Recent activity</p>
                    <p className="mt-3 text-3xl font-black text-white">{customerLedgerRows.length}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-sm text-slate-400">Select a customer to view invoice history, payment activity, and ledger lines.</p>
              )}
            </div>

            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <h2 className="text-2xl font-black text-white">Statement</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">A unified register of invoices, payments, and ledger entries for the selected customer.</p>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full table-auto text-left text-sm text-slate-300">
                  <thead className="border-b border-slate-800 text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Debit</th>
                      <th className="px-4 py-3">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer ? (
                      customerLedgerRows.length > 0 ? customerLedgerRows.map((row, index) => (
                        <tr key={`${row.type}-${row.date}-${index}`} className="border-b border-slate-800 hover:bg-slate-900/80">
                          <td className="px-4 py-4">{formatDate(row.date)}</td>
                          <td className="px-4 py-4 text-white">{row.type}</td>
                          <td className="px-4 py-4">{row.description}</td>
                          <td className="px-4 py-4">{row.debit ? formatCurrency(row.debit) : '—'}</td>
                          <td className="px-4 py-4">{row.credit ? formatCurrency(row.credit) : '—'}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="px-4 py-4 text-slate-500">No ledger entries for this customer.</td>
                        </tr>
                      )
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-slate-500">Select a customer to display statement rows.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

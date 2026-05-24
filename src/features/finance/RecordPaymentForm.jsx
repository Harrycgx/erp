import { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function RecordPaymentForm({ invoice, onSubmit, loading }) {
  const [form, setForm] = useState({
    amount: '',
    payment_method: 'Bank transfer',
    payment_date: new Date().toISOString().slice(0, 10),
    transaction_reference: '',
    notes: '',
  });

  if (!invoice) {
    return <p className="text-sm text-slate-400">Select an invoice to record payment.</p>;
  }

  const due = Number(invoice.due_amount ?? (invoice.total_amount - (invoice.paid_amount || 0)));

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          amount: Number(form.amount),
          paymentMethod: form.payment_method,
          paymentDate: form.payment_date,
          transactionReference: form.transaction_reference,
          notes: form.notes,
        });
      }}
    >
      <p className="text-xs text-slate-500">
        Outstanding: <span className="font-medium text-slate-200">{formatCurrency(due)}</span>
      </p>

      <label className="block text-sm text-slate-400">
        Amount
        <input
          type="number"
          step="0.01"
          min="0"
          max={due}
          required
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        />
      </label>

      <label className="block text-sm text-slate-400">
        Method
        <select
          value={form.payment_method}
          onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        >
          <option>Bank transfer</option>
          <option>UPI</option>
          <option>Cash</option>
          <option>Cheque</option>
        </select>
      </label>

      <label className="block text-sm text-slate-400">
        Reference
        <input
          type="text"
          value={form.transaction_reference}
          onChange={(e) => setForm((f) => ({ ...f, transaction_reference: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        />
      </label>

      <label className="block text-sm text-slate-400">
        Date
        <input
          type="date"
          value={form.payment_date}
          onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        />
      </label>

      <button
        type="submit"
        disabled={loading || due <= 0}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? 'Recording…' : 'Record payment'}
      </button>
    </form>
  );
}

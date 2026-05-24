import { useState } from 'react';

export default function SupplierForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    supplier_name: '',
    contact_person: '',
    phone: '',
    email: '',
    gst_number: '',
    address: '',
    payment_terms: 'Net 30',
    notes: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.supplier_name || !form.phone) return;
    await onSubmit(form);
    setForm({
      supplier_name: '',
      contact_person: '',
      phone: '',
      email: '',
      gst_number: '',
      address: '',
      payment_terms: 'Net 30',
      notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Supplier profile</p>
        <h2 className="mt-2 text-2xl font-black text-white">Add new supplier</h2>
      </div>

      <div className="grid gap-4">
        <input
          type="text"
          value={form.supplier_name}
          onChange={(event) => setForm({ ...form, supplier_name: event.target.value })}
          placeholder="Supplier name"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="text"
          value={form.contact_person}
          onChange={(event) => setForm({ ...form, contact_person: event.target.value })}
          placeholder="Contact person"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="tel"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          placeholder="Phone"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="Email"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="text"
          value={form.gst_number}
          onChange={(event) => setForm({ ...form, gst_number: event.target.value })}
          placeholder="GST number"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="text"
          value={form.address}
          onChange={(event) => setForm({ ...form, address: event.target.value })}
          placeholder="Address"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <select
          value={form.payment_terms}
          onChange={(event) => setForm({ ...form, payment_terms: event.target.value })}
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="Net 7">Net 7</option>
          <option value="Net 14">Net 14</option>
          <option value="Net 30">Net 30</option>
          <option value="Net 60">Net 60</option>
        </select>
        <textarea
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          rows={4}
          placeholder="Supplier performance notes"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-emerald-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Add supplier'}
        </button>
      </div>
    </form>
  );
}

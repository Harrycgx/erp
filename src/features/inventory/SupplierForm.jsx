import { useEffect, useState } from 'react';

const defaultForm = {
  supplier_name: '',
  contact_person: '',
  phone: '',
  email: '',
  gst_number: '',
  address: '',
  payment_terms: 'Net 30',
  notes: '',
};

export default function SupplierForm({ supplier, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (supplier) {
      setForm({ ...defaultForm, ...supplier });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [supplier]);

  const validate = () => {
    const newErrors = {};
    if (!form.supplier_name.trim()) newErrors.supplier_name = 'Supplier name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...form,
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Supplier profile</p>
        <h2 className="mt-2 text-2xl font-black text-white">{supplier?.id ? 'Edit supplier' : 'Add new supplier'}</h2>
      </div>

      <div className="grid gap-4">
        <div>
          <input
            type="text"
            value={form.supplier_name}
            onChange={(event) => setForm({ ...form, supplier_name: event.target.value })}
            placeholder="Supplier name"
            className={`w-full rounded-3xl border ${errors.supplier_name ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
          />
          {errors.supplier_name && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.supplier_name}</p>}
        </div>
        <input
          type="text"
          value={form.contact_person}
          onChange={(event) => setForm({ ...form, contact_person: event.target.value })}
          placeholder="Contact person"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <div>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="Phone"
            className={`w-full rounded-3xl border ${errors.phone ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
          />
          {errors.phone && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.phone}</p>}
        </div>
        <div>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="Email"
            className={`w-full rounded-3xl border ${errors.email ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
          />
          {errors.email && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.email}</p>}
        </div>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-emerald-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Saving…' : supplier?.id ? 'Update supplier' : 'Add supplier'}
          </button>
          {supplier?.id ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-slate-700 bg-slate-900/90 px-5 py-4 text-sm font-semibold text-slate-200 transition hover:border-orange-500"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}

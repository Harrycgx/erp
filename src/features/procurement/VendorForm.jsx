import { useEffect, useState } from 'react';

const defaultForm = {
  vendor_name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  gst_number: '',
  payment_terms: 'Net 30',
  supplied_materials: '',
  notes: '',
};

export default function VendorForm({ vendor, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vendor) {
      setForm({
        vendor_name: vendor.vendor_name || '',
        contact_person: vendor.contact_person || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        address: vendor.address || '',
        gst_number: vendor.gst_number || '',
        payment_terms: vendor.payment_terms || 'Net 30',
        supplied_materials: vendor.supplied_materials || '',
        notes: vendor.notes || '',
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [vendor]);

  const validate = () => {
    const newErrors = {};
    if (!form.vendor_name.trim()) newErrors.vendor_name = 'Vendor name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
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
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Vendor profile</p>
        <h2 className="mt-2 text-2xl font-black text-white">{vendor?.id ? 'Edit vendor' : 'Add vendor'}</h2>
      </div>

      <div className="grid gap-4">
        <div>
          <input
            type="text"
            value={form.vendor_name}
            onChange={(event) => handleChange('vendor_name', event.target.value)}
            placeholder="Vendor name"
            className={`w-full rounded-3xl border ${errors.vendor_name ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
          />
          {errors.vendor_name && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.vendor_name}</p>}
        </div>
        <input
          type="text"
          value={form.contact_person}
          onChange={(event) => handleChange('contact_person', event.target.value)}
          placeholder="Contact person"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <div>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
            placeholder="Phone"
            className={`w-full rounded-3xl border ${errors.phone ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
          />
          {errors.phone && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.phone}</p>}
        </div>
        <div>
          <input
            type="email"
            value={form.email}
            onChange={(event) => handleChange('email', event.target.value)}
            placeholder="Email"
            className={`w-full rounded-3xl border ${errors.email ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
          />
          {errors.email && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.email}</p>}
        </div>
        <input
          type="text"
          value={form.gst_number}
          onChange={(event) => handleChange('gst_number', event.target.value)}
          placeholder="GST number"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="text"
          value={form.address}
          onChange={(event) => handleChange('address', event.target.value)}
          placeholder="Address"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <select
          value={form.payment_terms}
          onChange={(event) => handleChange('payment_terms', event.target.value)}
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="Net 7">Net 7</option>
          <option value="Net 14">Net 14</option>
          <option value="Net 30">Net 30</option>
          <option value="Net 60">Net 60</option>
        </select>
        <textarea
          value={form.supplied_materials}
          onChange={(event) => handleChange('supplied_materials', event.target.value)}
          rows={3}
          placeholder="Supplied materials"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <textarea
          value={form.notes}
          onChange={(event) => handleChange('notes', event.target.value)}
          rows={4}
          placeholder="Vendor notes"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-emerald-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : vendor?.id ? 'Update vendor' : 'Add vendor'}
          </button>
          {vendor?.id ? (
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

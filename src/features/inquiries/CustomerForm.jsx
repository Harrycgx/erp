import { useEffect, useState } from 'react';

const initialState = {
  full_name: '',
  company_name: '',
  phone: '',
  email: '',
  address: '',
  gst_number: '',
  notes: '',
};

export default function CustomerForm({ customer, onSave, onCancel, saving }) {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || '',
        company_name: customer.company_name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        gst_number: customer.gst_number || '',
        notes: customer.notes || '',
      });
      setError('');
      return;
    }
    setFormData(initialState);
    setError('');
  }, [customer]);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!formData.full_name || !formData.company_name || !formData.phone || !formData.email) {
      setError('Please provide name, company, phone, and email.');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Customer profile</p>
        <h2 className="mt-2 text-2xl font-black text-white">{customer ? 'Edit customer' : 'New customer'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-slate-300">
          Full name
          <input
            type="text"
            value={formData.full_name}
            onChange={(event) => handleChange('full_name', event.target.value)}
            placeholder="Amit Singh"
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Company name
          <input
            type="text"
            value={formData.company_name}
            onChange={(event) => handleChange('company_name', event.target.value)}
            placeholder="Mayur Packaging Pvt Ltd"
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Phone
            <input
              type="tel"
              value={formData.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              placeholder="+91 98765 43210"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              value={formData.email}
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder="customer@company.com"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
        </div>

        <label className="block text-sm text-slate-300">
          Address
          <textarea
            value={formData.address}
            onChange={(event) => handleChange('address', event.target.value)}
            rows={3}
            placeholder="Factory address, warehouse location, or billing address"
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            GST number
            <input
              type="text"
              value={formData.gst_number}
              onChange={(event) => handleChange('gst_number', event.target.value)}
              placeholder="27AABCU9603R1ZV"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Notes
            <input
              type="text"
              value={formData.notes}
              onChange={(event) => handleChange('notes', event.target.value)}
              placeholder="Repeat buyer, credit terms, packaging preference"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
        </div>

        {error ? <p className="rounded-3xl border border-rose-600/20 bg-rose-600/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving ? 'Saving…' : customer ? 'Update customer' : 'Create customer'}
          </button>
          {customer ? (
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-full border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 sm:w-auto"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

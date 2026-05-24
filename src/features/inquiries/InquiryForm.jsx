import { useEffect, useState } from 'react';
import { INQUIRY_STATUSES, PRIORITY_LEVELS } from '../../utils/inquiryHelpers';

const initialState = {
  customer_id: '',
  box_type: '',
  quantity: '',
  status: 'New',
  assigned_to: '',
  follow_up_date: '',
  notes: '',
  priority: 'Normal',
};

export default function InquiryForm({ customers, inquiry, onSave, onCancel, saving }) {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (inquiry) {
      setFormData({
        customer_id: inquiry.customer_id || '',
        box_type: inquiry.box_type || '',
        quantity: inquiry.quantity || '',
        status: inquiry.status || 'New',
        assigned_to: inquiry.assigned_to || '',
        follow_up_date: inquiry.follow_up_date ? inquiry.follow_up_date.slice(0, 10) : '',
        notes: inquiry.notes || '',
        priority: inquiry.priority || 'Normal',
      });
      setError('');
      return;
    }
    setFormData(initialState);
    setError('');
  }, [inquiry]);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!formData.customer_id || !formData.box_type || !formData.quantity || !formData.status) {
      setError('Please complete customer, box type, quantity, and status.');
      return;
    }

    onSave({ ...formData, quantity: Number(formData.quantity) });
  };

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Inquiry form</p>
        <h2 className="text-2xl font-black text-white">{inquiry ? 'Edit inquiry' : 'New inquiry'}</h2>
        <p className="text-sm text-slate-500">Capture customer requests and follow-up details for faster quoting.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-slate-300">
          Customer
          <select
            value={formData.customer_id}
            onChange={(event) => handleChange('customer_id', event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.company_name || customer.full_name}</option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Box type
            <input
              type="text"
              value={formData.box_type}
              onChange={(event) => handleChange('box_type', event.target.value)}
              placeholder="Regular slotted carton"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Quantity
            <input
              type="number"
              value={formData.quantity}
              onChange={(event) => handleChange('quantity', event.target.value)}
              placeholder="5000"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Status
            <select
              value={formData.status}
              onChange={(event) => handleChange('status', event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              {INQUIRY_STATUSES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            Priority
            <select
              value={formData.priority}
              onChange={(event) => handleChange('priority', event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              {PRIORITY_LEVELS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Assigned to
            <input
              type="text"
              value={formData.assigned_to}
              onChange={(event) => handleChange('assigned_to', event.target.value)}
              placeholder="Sales rep name"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Follow-up date
            <input
              type="date"
              value={formData.follow_up_date}
              onChange={(event) => handleChange('follow_up_date', event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
        </div>

        <label className="block text-sm text-slate-300">
          Notes
          <textarea
            value={formData.notes}
            onChange={(event) => handleChange('notes', event.target.value)}
            rows={4}
            placeholder="Add follow-up details, customer requirements, or next steps."
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          />
        </label>

        {error ? <p className="rounded-3xl border border-rose-600/20 bg-rose-600/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving ? 'Saving…' : inquiry ? 'Update inquiry' : 'Create inquiry'}
          </button>
          {inquiry ? (
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

import { useState } from 'react';
import { buildPoNumber } from '../../utils/procurementHelpers';

export default function PurchaseOrderForm({ suppliers, onSubmit, loading }) {
  const [form, setForm] = useState({
    supplier_id: '',
    material_name: '',
    quantity: '',
    unit_price: '',
    expected_delivery: '',
    status: 'Draft',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.supplier_id) newErrors.supplier_id = 'Supplier is required';
    if (!form.material_name.trim()) newErrors.material_name = 'Material name is required';
    if (!form.quantity || Number(form.quantity) <= 0) newErrors.quantity = 'Invalid quantity';
    if (!form.unit_price || Number(form.unit_price) < 0) newErrors.unit_price = 'Invalid unit price';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    
    const quantity = Number(form.quantity);
    const unitPrice = Number(form.unit_price);
    const total = quantity * unitPrice;

    await onSubmit({
      ...form,
      quantity,
      unit_price: unitPrice,
      total,
      po_number: buildPoNumber(),
      created_at: new Date().toISOString(),
    });

    setForm({
      supplier_id: '',
      material_name: '',
      quantity: '',
      unit_price: '',
      expected_delivery: '',
      status: 'Draft',
      notes: '',
    });
    setErrors({});
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Procurement form</p>
        <h2 className="mt-2 text-2xl font-black text-white">Create purchase order</h2>
      </div>

      <div className="grid gap-4">
        <div>
          <select
            value={form.supplier_id}
            onChange={(event) => handleChange('supplier_id', event.target.value)}
            className={`w-full rounded-3xl border ${errors.supplier_id ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
          >
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>{supplier.supplier_name}</option>
            ))}
          </select>
          {errors.supplier_id && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.supplier_id}</p>}
        </div>
        <div>
          <input
            type="text"
            value={form.material_name}
            onChange={(event) => handleChange('material_name', event.target.value)}
            placeholder="Material name"
            className={`w-full rounded-3xl border ${errors.material_name ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
          />
          {errors.material_name && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.material_name}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <input
              type="number"
              value={form.quantity}
              onChange={(event) => handleChange('quantity', event.target.value)}
              placeholder="Quantity"
              className={`w-full rounded-3xl border ${errors.quantity ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
            />
            {errors.quantity && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.quantity}</p>}
          </div>
          <div>
            <input
              type="number"
              value={form.unit_price}
              onChange={(event) => handleChange('unit_price', event.target.value)}
              placeholder="Unit price"
              className={`w-full rounded-3xl border ${errors.unit_price ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
            />
            {errors.unit_price && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.unit_price}</p>}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 ml-4 block text-[10px] uppercase tracking-wider text-slate-500">Expected Delivery</label>
            <input
              type="date"
              value={form.expected_delivery}
              onChange={(event) => handleChange('expected_delivery', event.target.value)}
              className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
            />
          </div>
          <div>
            <label className="mb-1 ml-4 block text-[10px] uppercase tracking-wider text-slate-500">Initial Status</label>
            <select
              value={form.status}
              onChange={(event) => handleChange('status', event.target.value)}
              className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
            >
              {['Draft', 'Pending', 'Ordered', 'Received', 'Delayed', 'Cancelled'].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
        <textarea
          value={form.notes}
          onChange={(event) => handleChange('notes', event.target.value)}
          rows={3}
          placeholder="Delivery notes or supplier instructions"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <div className="flex items-center justify-between rounded-3xl bg-slate-900/50 px-6 py-4">
          <span className="text-sm text-slate-400">Estimated Total:</span>
          <span className="text-lg font-bold text-orange-400">₹{(Number(form.quantity || 0) * Number(form.unit_price || 0)).toLocaleString()}</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-orange-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create Purchase Order'}
        </button>
      </div>
    </form>
  );
}

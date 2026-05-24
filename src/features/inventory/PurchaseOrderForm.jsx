import { useState } from 'react';
import { buildPoNumber } from '../../utils/procurementHelpers';

export default function PurchaseOrderForm({ suppliers, onSubmit, loading }) {
  const [form, setForm] = useState({
    supplier_id: suppliers?.[0]?.id || '',
    material_name: '',
    quantity: '',
    unit_price: '',
    expected_delivery: '',
    status: 'Pending',
    notes: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.supplier_id || !form.material_name || !form.quantity) return;
    await onSubmit({
      ...form,
      po_number: buildPoNumber(),
      created_at: new Date().toISOString(),
    });
    setForm({
      supplier_id: suppliers?.[0]?.id || '',
      material_name: '',
      quantity: '',
      unit_price: '',
      expected_delivery: '',
      status: 'Pending',
      notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Procurement form</p>
        <h2 className="mt-2 text-2xl font-black text-white">Create purchase order</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <select
          value={form.supplier_id}
          onChange={(event) => setForm({ ...form, supplier_id: event.target.value })}
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="">Select supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>{supplier.supplier_name}</option>
          ))}
        </select>
        <input
          type="text"
          value={form.material_name}
          onChange={(event) => setForm({ ...form, material_name: event.target.value })}
          placeholder="Material name"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="number"
          value={form.quantity}
          onChange={(event) => setForm({ ...form, quantity: event.target.value })}
          placeholder="Quantity"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="number"
          value={form.unit_price}
          onChange={(event) => setForm({ ...form, unit_price: event.target.value })}
          placeholder="Unit price"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="date"
          value={form.expected_delivery}
          onChange={(event) => setForm({ ...form, expected_delivery: event.target.value })}
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <select
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value })}
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        >
          {['Pending', 'Ordered', 'Received', 'Delayed', 'Cancelled'].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <textarea
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          rows={4}
          placeholder="Delivery notes or supplier instructions"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-emerald-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create Purchase Order'}
        </button>
      </div>
    </form>
  );
}

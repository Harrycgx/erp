import { useEffect, useState } from 'react';

const defaultForm = {
  material_name: '',
  category: '',
  gsm: '',
  flute_type: '',
  supplier: '',
  current_stock: '',
  minimum_stock: '',
  unit: 'pcs',
  warehouse_location: '',
  cost_per_unit: '',
};

export default function MaterialForm({ item, suppliers, onSubmit, onDelete, loading }) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (item) {
      setForm({
        material_name: item.material_name || '',
        category: item.category || '',
        gsm: item.gsm || '',
        flute_type: item.flute_type || '',
        supplier: item.supplier || item.supplier_id || '',
        current_stock: item.current_stock || '',
        minimum_stock: item.minimum_stock || '',
        unit: item.unit || 'pcs',
        warehouse_location: item.warehouse_location || item.storage_location || '',
        cost_per_unit: item.cost_per_unit || '',
      });
    } else {
      setForm(defaultForm);
    }
  }, [item]);

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      current_stock: Number(form.current_stock || 0),
      minimum_stock: Number(form.minimum_stock || 0),
      gsm: form.gsm ? Number(form.gsm) : null,
      cost_per_unit: Number(form.cost_per_unit || 0),
    };
    if (item?.id) payload.id = item.id;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Material management</p>
        <h2 className="mt-2 text-2xl font-black text-white">{item ? 'Edit material' : 'Add raw material'}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          value={form.material_name}
          onChange={handleChange('material_name')}
          placeholder="Material name"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="text"
          value={form.category}
          onChange={handleChange('category')}
          placeholder="Category"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="number"
          value={form.gsm}
          onChange={handleChange('gsm')}
          placeholder="GSM"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="text"
          value={form.flute_type}
          onChange={handleChange('flute_type')}
          placeholder="Flute type"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <select
          value={form.supplier}
          onChange={handleChange('supplier')}
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="">Select supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.supplier_name}>{supplier.supplier_name}</option>
          ))}
        </select>
        <input
          type="text"
          value={form.warehouse_location}
          onChange={handleChange('warehouse_location')}
          placeholder="Warehouse location"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="number"
          value={form.current_stock}
          onChange={handleChange('current_stock')}
          placeholder="Current stock"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="number"
          value={form.minimum_stock}
          onChange={handleChange('minimum_stock')}
          placeholder="Minimum stock"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="text"
          value={form.unit}
          onChange={handleChange('unit')}
          placeholder="Unit"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="number"
          value={form.cost_per_unit}
          onChange={handleChange('cost_per_unit')}
          placeholder="Cost per unit"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-orange-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Saving…' : item ? 'Update material' : 'Add material'}
        </button>
        {item?.id ? (
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            disabled={loading}
            className="rounded-full border border-slate-700 bg-slate-900/90 px-5 py-4 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete material
          </button>
        ) : null}
      </div>
    </form>
  );
}

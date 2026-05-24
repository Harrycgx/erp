import { useEffect, useState } from 'react';

const initialRule = {
  material_rate: '',
  print_rate: '',
  lamination_rate: '',
  tooling_rate: '',
  labor_rate: '',
  rush_charge: '',
  gst_rate: '',
};

export default function PricingEditor({ rule, onSave, saving }) {
  const [formData, setFormData] = useState(initialRule);

  useEffect(() => {
    if (rule) {
      setFormData({
        material_rate: rule.material_rate || '',
        print_rate: rule.print_rate || '',
        lamination_rate: rule.lamination_rate || '',
        tooling_rate: rule.tooling_rate || '',
        labor_rate: rule.labor_rate || '',
        rush_charge: rule.rush_charge || '',
        gst_rate: rule.gst_rate || '',
      });
    }
  }, [rule]);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...formData,
      gst_rate: Number(formData.gst_rate) / 100,
    });
  };

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pricing configuration</p>
        <h2 className="mt-2 text-2xl font-black text-white">Global pricing rules</h2>
        <p className="mt-3 text-sm text-slate-500">Update rates that power future quote calculations instantly.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Material rate
            <input
              type="number"
              value={formData.material_rate}
              onChange={(event) => handleChange('material_rate', event.target.value)}
              placeholder="₹ per kg"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Print rate
            <input
              type="number"
              value={formData.print_rate}
              onChange={(event) => handleChange('print_rate', event.target.value)}
              placeholder="₹ per unit"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Lamination rate
            <input
              type="number"
              value={formData.lamination_rate}
              onChange={(event) => handleChange('lamination_rate', event.target.value)}
              placeholder="₹ per m²"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Tooling rate
            <input
              type="number"
              value={formData.tooling_rate}
              onChange={(event) => handleChange('tooling_rate', event.target.value)}
              placeholder="₹ per setup"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Labor rate
            <input
              type="number"
              value={formData.labor_rate}
              onChange={(event) => handleChange('labor_rate', event.target.value)}
              placeholder="₹ per unit"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Rush charge
            <input
              type="number"
              value={formData.rush_charge}
              onChange={(event) => handleChange('rush_charge', event.target.value)}
              placeholder="₹ per unit"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
        </div>

        <label className="block text-sm text-slate-300">
          GST rate
          <input
            type="number"
            value={formData.gst_rate}
            onChange={(event) => handleChange('gst_rate', event.target.value)}
            placeholder="18"
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            className="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            disabled={saving}
          >
            {saving ? 'Saving rules…' : 'Save pricing rules'}
          </button>
        </div>
      </form>
    </div>
  );
}

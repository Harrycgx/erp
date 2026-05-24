import { useEffect, useMemo, useState } from 'react';
import { estimateMaterialUsage } from '../../utils/productionEstimations';
import StockStatusBadge from './StockStatusBadge';

const defaultPlan = {
  production_status: 'Planned',
  assigned_machine: 'Line A',
  notes: '',
};

export default function ProductionPlanner({ order, onSubmit, loading }) {
  const [plan, setPlan] = useState(defaultPlan);

  useEffect(() => {
    if (order) {
      setPlan({
        ...defaultPlan,
        assigned_machine: order.flute_type?.includes('B') ? 'Corrugator A' : 'Line A',
      });
    }
  }, [order]);

  const estimation = useMemo(() => (order ? estimateMaterialUsage(order) : null), [order]);

  const handleChange = (field) => (event) => {
    setPlan({ ...plan, [field]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!order) return;
    onSubmit({
      order_id: order.id,
      estimated_material: estimation.paperUsage,
      estimated_output: estimation.estimatedOutput,
      planned_start: plan.planned_start,
      planned_end: plan.planned_end,
      assigned_machine: plan.assigned_machine,
      production_status: plan.production_status,
      notes: plan.notes,
      created_at: new Date().toISOString(),
    });
  };

  if (!order) {
    return (
      <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Production planner</p>
        <h2 className="mt-2 text-2xl font-black text-white">Select an order to start planning</h2>
        <p className="mt-4 text-sm text-slate-400">Pending manufacturing orders appear in the order board on the right.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Production planner</p>
          <h2 className="mt-2 text-2xl font-black text-white">Order {order.order_number || order.id}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StockStatusBadge status={order.production_stage || 'Material Pending'} />
          <span className="text-sm text-slate-400">Qty {order.quantity || '—'}</span>
          <span className="text-sm text-slate-400">{order.flute_type || 'Standard'}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-sm text-slate-400">Estimated paper usage</p>
          <p className="mt-2 text-3xl font-black text-white">{estimation.paperUsage} kg</p>
          <p className="mt-1 text-sm text-slate-500">Including wastage and board requirements</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-sm text-slate-400">Expected output</p>
          <p className="mt-2 text-3xl font-black text-white">{estimation.estimatedOutput} units</p>
          <p className="mt-1 text-sm text-slate-500">Material plan will prioritize available stock</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="date"
          value={plan.planned_start || ''}
          onChange={handleChange('planned_start')}
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="date"
          value={plan.planned_end || ''}
          onChange={handleChange('planned_end')}
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="text"
          value={plan.assigned_machine}
          onChange={handleChange('assigned_machine')}
          placeholder="Assigned machine"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <select
          value={plan.production_status}
          onChange={handleChange('production_status')}
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        >
          {['Planned', 'Material Pending', 'Ready', 'Running', 'QC', 'Completed', 'Delayed'].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <textarea
        value={plan.notes}
        onChange={handleChange('notes')}
        rows={4}
        placeholder="Production notes"
        className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Planning…' : 'Create production plan'}
      </button>
    </form>
  );
}

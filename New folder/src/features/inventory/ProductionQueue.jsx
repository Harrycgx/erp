import StockStatusBadge from './StockStatusBadge';

export default function ProductionQueue({ plans, onUpdateStatus }) {
  const statusOptions = ['Planned', 'Material Pending', 'Ready', 'Running', 'QC', 'Completed', 'Delayed'];

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Production queue</p>
          <h2 className="mt-2 text-2xl font-black text-white">Active production plans</h2>
        </div>
      </div>
      <div className="space-y-4">
        {plans.length ? (
          plans.map((plan) => (
            <div key={plan.id} className="rounded-3xl border border-slate-800 bg-slate-900/85 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{plan.order_id ? `Order ${plan.order_id}` : 'Unlinked order'}</p>
                  <p className="mt-1 text-sm text-slate-400">{plan.assigned_machine} • {plan.estimated_output} units</p>
                  <p className="mt-2 text-sm text-slate-500">Start {plan.planned_start || 'TBD'} • End {plan.planned_end || 'TBD'}</p>
                </div>
                <StockStatusBadge status={plan.production_status} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-400">Material: {plan.estimated_material || 'TBD'}</span>
                {onUpdateStatus ? (
                  <select
                    value={plan.production_status}
                    onChange={(event) => onUpdateStatus(plan.id, event.target.value)}
                    className="rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm text-white outline-none"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 text-sm text-slate-400">No production plans are scheduled yet. Create a plan from a pending order.</div>
        )}
      </div>
    </div>
  );
}

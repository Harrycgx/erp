import { formatStockMovement } from '../../utils/stockCalculations';

export default function StockMovementTable({ movements }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/85">
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/90">
        <p className="text-sm font-semibold text-white">Recent stock movements</p>
      </div>
      <div className="divide-y divide-slate-800">
        {movements.length ? (
          movements.map((movement) => (
            <div key={movement.id} className="px-5 py-4 text-sm text-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-white">{formatStockMovement(movement)}</p>
                <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{new Date(movement.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              <p className="mt-2 text-slate-400">{movement.notes || 'No notes provided.'}</p>
              {movement.reference_type ? (
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  {movement.reference_type} #{movement.reference_id || 'N/A'} • {movement.created_by || 'system'}
                </p>
              ) : null}
            </div>
          ))
        ) : (
          <div className="px-5 py-6 text-sm text-slate-400">No stock movements recorded for this item yet.</div>
        )}
      </div>
    </div>
  );
}

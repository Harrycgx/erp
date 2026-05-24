export default function InventoryReservationPanel({ reservations = [], movements = [], loading, error }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4 text-sm text-slate-400">
        Loading reservation status…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Inventory reservation</p>
      <p className="mt-1 text-sm text-slate-400">Stock reserved against this sales order (BOM-driven).</p>

      {error ? (
        <p className="mt-3 rounded-lg border border-rose-600/30 bg-rose-950/50 px-3 py-2 text-sm text-rose-200">{error}</p>
      ) : null}

      {reservations?.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          {reservations.map((row) => (
            <li key={row.inventory_item_id} className="flex justify-between gap-3 border-b border-slate-800 pb-2">
              <span>{row.inventory_item_id?.slice(0, 8)}…</span>
              <span className="font-medium text-white">Qty {row.quantity}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          {movements?.length
            ? `${movements.length} movement record(s) on file.`
            : 'No material reservations recorded (no BOM match or stock not required).'}
        </p>
      )}

      {movements?.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 pr-3">Material</th>
                <th className="pb-2 pr-3">Type</th>
                <th className="pb-2 pr-3">Qty</th>
                <th className="pb-2">When</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {movements.map((movement) => (
                <tr key={movement.id} className="border-t border-slate-800">
                  <td className="py-2 pr-3">
                    {movement.inventory_items?.item_name ||
                      movement.inventory_items?.material_name ||
                      movement.inventory_item_id?.slice(0, 8)}
                  </td>
                  <td className="py-2 pr-3 capitalize">{movement.movement_type?.replace(/_/g, ' ')}</td>
                  <td className="py-2 pr-3">{movement.quantity}</td>
                  <td className="py-2 text-slate-500">
                    {movement.created_at ? new Date(movement.created_at).toLocaleString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

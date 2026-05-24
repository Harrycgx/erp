export default function InventoryMovementTable({ movements = [] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/85">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-300">
        <thead>
          <tr className="bg-slate-950/95 text-xs uppercase tracking-[0.24em] text-slate-500">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Material</th>
            <th className="px-4 py-3">Movement</th>
            <th className="px-4 py-3">Qty</th>
            <th className="px-4 py-3">Source</th>
          </tr>
        </thead>
        <tbody>
          {movements.length ? (
            movements.slice(0, 6).map((movement) => (
              <tr key={movement.id} className="border-t border-slate-800 hover:bg-slate-950/90">
                <td className="px-4 py-4 text-slate-300">{new Date(movement.date || movement.timestamp).toLocaleDateString()}</td>
                <td className="px-4 py-4 font-semibold text-white">{movement.material_name || movement.item_name}</td>
                <td className="px-4 py-4 text-slate-400">{movement.movement_type || movement.type || 'Update'}</td>
                <td className="px-4 py-4 text-slate-300">{movement.quantity ?? movement.qty}</td>
                <td className="px-4 py-4 text-slate-400">{movement.source || movement.vendor || 'Internal'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-4 py-6 text-center text-slate-500">No recent inventory movements available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

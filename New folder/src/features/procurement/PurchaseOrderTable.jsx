import PurchaseOrderStatusBadge from './PurchaseOrderStatusBadge';

export default function PurchaseOrderTable({ orders = [], onApprove, onCancel, onSelect }) {
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Purchase orders</p>
          <h2 className="mt-2 text-2xl font-black text-white">Procurement queue</h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-300">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">PO #</th>
              <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Vendor</th>
              <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Total</th>
              <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Required</th>
              <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Status</th>
              <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {orders.map((order) => {
              const status = order.po_status || order.status || 'Pending';
              return (
                <tr key={order.id} className="hover:bg-slate-900/80">
                  <td className="px-4 py-4 text-white cursor-pointer" onClick={() => onSelect(order)}>{order.purchase_order_number || `PO-${order.id}`}</td>
                  <td className="px-4 py-4 text-slate-300">{order.vendor_name || order.vendor?.vendor_name || 'Unknown'}</td>
                  <td className="px-4 py-4 text-slate-300">₹{order.total_amount?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-4 text-slate-300">{order.required_by || 'TBD'}</td>
                  <td className="px-4 py-4"><PurchaseOrderStatusBadge status={status} /></td>
                  <td className="px-4 py-4 space-x-2">
                    {status === 'Pending' && (
                      <button
                        type="button"
                        onClick={() => onApprove(order.id)}
                        className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400"
                      >Approve</button>
                    )}
                    {status !== 'Cancelled' && (
                      <button
                        type="button"
                        onClick={() => onCancel(order.id)}
                        className="rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-400"
                      >Cancel</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

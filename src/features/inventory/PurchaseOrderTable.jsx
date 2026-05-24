import { getPoBadgeClasses } from '../../utils/procurementHelpers';

export default function PurchaseOrderTable({ orders, suppliers, onUpdateStatus, loading }) {
  const supplierMap = suppliers?.reduce((acc, supplier) => {
    acc[supplier.id] = supplier.supplier_name;
    return acc;
  }, {}) || {};

  const getNextStatus = (status) => {
    if (status === 'Pending') return 'Ordered';
    if (status === 'Ordered') return 'Received';
    if (status === 'Delayed') return 'Ordered';
    return null;
  };

  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-700 bg-slate-950/95 shadow-xl shadow-black/20">
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90">
        <h2 className="text-lg font-semibold text-white">Purchase order register</h2>
        <p className="mt-2 text-sm text-slate-400">Manage POs, track delivery dates and update procurement status.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-300">
          <thead>
            <tr>
              <th className="px-5 py-4 text-left uppercase tracking-[0.3em] text-slate-500">PO</th>
              <th className="px-5 py-4 text-left uppercase tracking-[0.3em] text-slate-500">Supplier</th>
              <th className="px-5 py-4 text-left uppercase tracking-[0.3em] text-slate-500">Material</th>
              <th className="px-5 py-4 text-right uppercase tracking-[0.3em] text-slate-500">Qty</th>
              <th className="px-5 py-4 text-left uppercase tracking-[0.3em] text-slate-500">Delivery</th>
              <th className="px-5 py-4 text-left uppercase tracking-[0.3em] text-slate-500">Status</th>
              <th className="px-5 py-4 text-left uppercase tracking-[0.3em] text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {orders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              return (
                <tr key={order.id} className="hover:bg-slate-900/80">
                  <td className="px-5 py-4 text-white">{order.po_number}</td>
                  <td className="px-5 py-4">{supplierMap[order.supplier_id] || 'Unknown'}</td>
                  <td className="px-5 py-4">{order.material_name}</td>
                  <td className="px-5 py-4 text-right">{order.quantity}</td>
                  <td className="px-5 py-4">{order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString('en-IN') : 'TBD'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${getPoBadgeClasses(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {nextStatus ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order.id, nextStatus)}
                        disabled={loading}
                        className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Mark {nextStatus}
                      </button>
                    ) : (
                      <span className="text-sm text-slate-500">Complete</span>
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

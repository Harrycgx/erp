import StatusBadge from './StatusBadge';
import { getOrderProgress } from '../../modules/orders/orderHelpers';

export default function OrdersTable({ orders }) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[1.8fr_1.4fr_0.8fr_0.8fr_0.9fr] gap-x-6 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs uppercase tracking-[0.32em] text-slate-500">
        <span>Order</span>
        <span>Client</span>
        <span>Status</span>
        <span>Qty</span>
        <span>ETA</span>
      </div>
      <div className="divide-y divide-slate-200">
        {orders.map((order) => (
          <div key={order.id} className="grid grid-cols-[1.8fr_1.4fr_0.8fr_0.8fr_0.9fr] gap-x-6 px-6 py-5 items-center text-sm text-slate-700">
            <div>
              <p className="font-semibold text-slate-900">{order.product}</p>
              <p className="mt-1 text-xs text-slate-500">{order.id}</p>
            </div>
            <div>{order.client}</div>
            <div><StatusBadge status={order.status} /></div>
            <div>{order.quantity.toLocaleString()}</div>
            <div>{getOrderProgress(order.status)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

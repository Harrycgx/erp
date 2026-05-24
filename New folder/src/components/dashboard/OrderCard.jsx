import StatusBadge from './StatusBadge';
import { getOrderProgress, getDispatchEstimate } from '../../modules/orders/orderHelpers';

export default function OrderCard({ order }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Order</p>
          <p className="mt-2 text-xl font-black text-slate-900">{order.id}</p>
          <p className="mt-1 text-sm text-slate-600">{order.client}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{order.product}</span>
          <span>{order.due}</span>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Quantity</span>
            <span className="font-semibold text-slate-900">{order.quantity.toLocaleString()}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${getOrderProgress(order.status)}%` }} />
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-500">{getDispatchEstimate(order.status, order.priority)} dispatch</p>
        </div>
      </div>
    </article>
  );
}

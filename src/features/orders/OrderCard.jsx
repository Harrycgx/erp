import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency } from '../../utils/pdfHelpers';

export default function OrderCard({ order, onSelect }) {
  return (
    <article className="rounded-[28px] border border-slate-700 bg-slate-950/95 p-5 shadow-xl shadow-black/20 transition hover:border-orange-500/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Order</p>
          <h3 className="mt-2 text-xl font-black text-white">{order.order_number}</h3>
          <p className="mt-1 text-sm text-slate-400">{order.client || 'Customer'}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Stage</p>
          <p className="mt-2">{order.production_stage}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Payment</p>
          <p className="mt-2">{order.payment_status}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-slate-400">Assigned staff: {order.assigned_staff || 'Unassigned'}</span>
        <button
          type="button"
          onClick={() => onSelect(order)}
          className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          View details
        </button>
      </div>
    </article>
  );
}

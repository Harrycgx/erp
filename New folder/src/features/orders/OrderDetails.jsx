import OrderStatusBadge from './OrderStatusBadge';
import DispatchTimeline from './DispatchTimeline';
import ProductionEstimate from './ProductionEstimate';
import { formatDate } from '../../utils/pdfHelpers';

export default function OrderDetails({ order, customer }) {
  if (!order) {
    return (
      <div className="rounded-[28px] border border-slate-700 bg-slate-950/90 p-6 text-slate-400">
        Select an order to review production timing, customer data and dispatch history.
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-[28px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Order details</p>
          <h2 className="mt-2 text-2xl font-black text-white">{order.order_number}</h2>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Customer</p>
          <p className="mt-2">{customer?.company_name || 'Customer name'}</p>
          <p className="text-slate-400">{customer?.full_name || 'Contact person'}</p>
          <p className="text-slate-400">{customer?.email || 'email@example.com'}</p>
          <p className="text-slate-400">{customer?.phone || '+91 99999 99999'}</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Production</p>
          <p className="mt-2">Stage: {order.production_stage}</p>
          <p className="mt-2">Payment: {order.payment_status}</p>
          <p className="mt-2">Assigned staff: {order.assigned_staff || 'Unassigned'}</p>
          <p className="mt-2">Created: {formatDate(order.created_at)}</p>
        </div>
      </div>

      <DispatchTimeline order={order} />
      <ProductionEstimate order={order} />
    </div>
  );
}

import OrderStatusBadge from './OrderStatusBadge';

export default function OrderTable({ orders, onSelect }) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-700 bg-slate-950/95 shadow-xl shadow-black/20">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] gap-x-6 border-b border-slate-800 bg-slate-900/95 px-6 py-4 text-xs uppercase tracking-[0.32em] text-slate-400">
        <span>Order</span>
        <span>Client</span>
        <span>Stage</span>
        <span>Payment</span>
        <span>Action</span>
      </div>
      <div className="divide-y divide-slate-800">
        {orders.map((order) => (
          <div key={order.id} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] gap-x-6 px-6 py-4 text-sm text-slate-300 hover:bg-slate-900/70">
            <span className="font-semibold text-white">{order.order_number}</span>
            <span>{order.client}</span>
            <span><OrderStatusBadge status={order.production_stage} /></span>
            <span>{order.payment_status}</span>
            <button
              type="button"
              onClick={() => onSelect(order)}
              className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

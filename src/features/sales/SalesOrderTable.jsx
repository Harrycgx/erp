import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import SalesOrderStatusBadge from './SalesOrderStatusBadge';

export default function SalesOrderTable({ orders = [], customers = [], loading }) {
  if (loading) {
    return <p className="py-8 text-center text-sm text-slate-400">Loading sales orders…</p>;
  }

  if (!orders.length) {
    return <p className="py-8 text-center text-sm text-slate-400">No sales orders yet. Convert an approved quotation to create one.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-950/90">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-700 bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">SO number</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Box / qty</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const customer = customers.find((c) => c.id === order.customer_id);
            return (
              <tr key={order.id} className="border-b border-slate-800 last:border-b-0 hover:bg-slate-900/50">
                <td className="px-4 py-3">
                  <Link to={`/sales-orders/${order.id}`} className="font-medium text-orange-400 hover:text-orange-300">
                    {order.sales_order_number || order.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-300">{customer?.company_name || customer?.full_name || '—'}</td>
                <td className="px-4 py-3 text-slate-300">
                  {order.box_type || '—'}
                  <span className="text-slate-500"> · {order.quantity || 0} pcs</span>
                </td>
                <td className="px-4 py-3 text-slate-200">{formatCurrency(order.total_amount || 0)}</td>
                <td className="px-4 py-3">
                  <SalesOrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

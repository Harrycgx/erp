import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import { fetchOrders } from '../services/orderService';
import { formatCurrency } from '../utils/formatters';

const stages = ['pending', 'confirmed', 'in_production', 'quality_check', 'dispatch_ready', 'dispatched', 'delivered'];

function OrderTimeline({ order }) {
  const value = String(order.production_stage || order.status || 'pending').toLowerCase().replace(/\s+/g, '_');
  const currentIndex = Math.max(stages.indexOf(value), 0);

  return (
    <div className="mt-5 grid gap-3">
      {stages.map((stage, index) => (
        <div key={stage} className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${index <= currentIndex ? 'bg-orange-400' : 'bg-slate-700'}`} />
          <span className={`text-sm capitalize ${index <= currentIndex ? 'text-white' : 'text-slate-500'}`}>{stage.replace(/_/g, ' ')}</span>
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await fetchOrders();
    if (fetchError) {
      setError(fetchError.message || 'Unable to load orders.');
      setOrders([]);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const metrics = useMemo(() => ({
    total: orders.length,
    active: orders.filter((order) => !['delivered', 'cancelled'].includes(String(order.status).toLowerCase())).length,
    delivered: orders.filter((order) => String(order.status).toLowerCase() === 'delivered').length,
  }), [orders]);

  return (
    <main className="min-h-screen bg-[#090d16] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
          <SectionHeading
            eyebrow="Orders"
            title="Track approved customer orders"
            description="Monitor orders created from approved quotations, production status, payment status, and delivery progress."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard value={metrics.total} label="Total orders" />
            <StatCard value={metrics.active} label="Active orders" />
            <StatCard value={metrics.delivered} label="Delivered" />
          </div>
        </div>

        {error ? <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div> : null}

        <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Order pipeline</p>
              <h2 className="mt-2 text-2xl font-black text-white">Customer orders</h2>
            </div>
            {loading ? <span className="text-sm text-slate-400">Loading...</span> : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {orders.map((order) => (
              <div key={order.id} className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Order</p>
                    <h3 className="mt-2 text-xl font-black text-white">{order.order_number || order.id}</h3>
                    <p className="mt-2 text-sm text-slate-400">{order.box_type || 'Packaging order'} | Qty {order.quantity || 0}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{order.status || 'pending'}</span>
                    <p className="mt-3 text-sm font-semibold text-white">{formatCurrency(Number(order.total || 0))}</p>
                  </div>
                </div>
                <OrderTimeline order={order} />
              </div>
            ))}
          </div>

          {!loading && !orders.length ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-8 text-sm text-slate-400">
              No orders are available.
            </div>
          ) : null}
        </div>
      </Container>
    </main>
  );
}

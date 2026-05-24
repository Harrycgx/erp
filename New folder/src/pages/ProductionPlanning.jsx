import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import ProductionPlanner from '../features/inventory/ProductionPlanner';
import ProductionQueue from '../features/inventory/ProductionQueue';
import MaterialConsumption from '../features/inventory/MaterialConsumption';
import { fetchOrders } from '../services/orderService';
import { fetchProductionPlans, insertProductionPlan, updateProductionPlan } from '../services/productionPlanningService';

export default function ProductionPlanning() {
  const [orders, setOrders] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    const [ordersResult, plansResult] = await Promise.all([fetchOrders(), fetchProductionPlans()]);
    if (ordersResult.error || plansResult.error) {
      setError(ordersResult.error?.message || plansResult.error?.message || 'Unable to load planning data.');
      setOrders([]);
      setPlans([]);
    } else {
      setOrders(ordersResult.data || []);
      setPlans(plansResult.data || []);
      if (!selectedOrder && ordersResult.data?.length) setSelectedOrder(ordersResult.data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePlan = async (plan) => {
    setPlanLoading(true);
    const { error } = await insertProductionPlan(plan);
    if (error) {
      setError(error.message);
    } else {
      await loadData();
    }
    setPlanLoading(false);
  };

  const handleUpdatePlanStatus = async (planId, status) => {
    setPlanLoading(true);
    const { error } = await updateProductionPlan(planId, { production_status: status });
    if (error) {
      setError(error.message);
    } else {
      await loadData();
    }
    setPlanLoading(false);
  };

  const pendingOrders = useMemo(
    () => orders.filter((order) => !['Completed', 'Delivered', 'Cancelled'].includes(order.production_stage || order.status)),
    [orders]
  );

  const metrics = useMemo(
    () => [
      { value: orders.length, label: 'Orders monitored' },
      { value: pendingOrders.length, label: 'Pending production' },
      { value: plans.filter((plan) => plan.production_status === 'Running').length, label: 'Lines running' },
      { value: plans.filter((plan) => plan.production_status === 'Delayed').length, label: 'Delayed plans' },
    ],
    [orders, plans, pendingOrders]
  );

  return (
    <main className="min-h-screen bg-[#0B1020] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.6fr_0.95fr] xl:items-start">
          <SectionHeading
            eyebrow="Production planning"
            title="Connect inventory to manufacturing schedule"
            description="Plan work orders, allocate machines, and estimate material requirements for corrugated production."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <StatCard key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-8">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Orders waiting</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Pending production orders</h2>
                </div>
              </div>
              <div className="space-y-4">
                {pendingOrders.length ? (
                  pendingOrders.map((order) => (
                    <button
                      type="button"
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900/85 px-5 py-4 text-left text-sm text-slate-300 transition hover:border-orange-500"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-semibold text-white">{order.order_number || `Order ${order.id}`}</span>
                        <span className="text-slate-400">Qty {order.quantity || '—'}</span>
                      </div>
                      <p className="mt-2 text-slate-500">{order.production_stage || order.status || 'Pending production'}</p>
                    </button>
                  ))
                ) : (
                  <p className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 text-sm text-slate-400">No pending orders found.</p>
                )}
              </div>
            </div>

            <ProductionPlanner order={selectedOrder} onSubmit={handleCreatePlan} loading={planLoading} />
          </div>

          <div className="space-y-8">
            <MaterialConsumption order={selectedOrder} />
            <ProductionQueue plans={plans} onUpdateStatus={handleUpdatePlanStatus} />
          </div>
        </div>
      </Container>
    </main>
  );
}

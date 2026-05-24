import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import PurchaseOrderForm from '../features/inventory/PurchaseOrderForm';
import ProcurementTimeline from '../features/inventory/ProcurementTimeline';
import PurchaseOrderTable from '../features/inventory/PurchaseOrderTable';
import { fetchPurchaseOrders, insertPurchaseOrder, updatePurchaseOrder } from '../services/procurementService';
import { fetchSuppliers } from '../services/supplierService';

export default function Procurement() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');

    const [ordersResult, suppliersResult] = await Promise.all([fetchPurchaseOrders(), fetchSuppliers()]);
    if (ordersResult.error || suppliersResult.error) {
      setError(ordersResult.error?.message || suppliersResult.error?.message || 'Unable to load procurement data.');
      setPurchaseOrders([]);
      setSuppliers([]);
    } else {
      setPurchaseOrders(ordersResult.data || []);
      setSuppliers(suppliersResult.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onCreateOrder = async (order) => {
    setFormLoading(true);
    const { error } = await insertPurchaseOrder(order);
    if (error) {
      setError(error.message);
    } else {
      await loadData();
    }
    setFormLoading(false);
  };

  const onUpdateStatus = async (orderId, status) => {
    setLoading(true);
    const { error } = await updatePurchaseOrder(orderId, { status });
    if (error) {
      setError(error.message);
    } else {
      await loadData();
    }
    setLoading(false);
  };

  const metrics = useMemo(() => {
    const pending = purchaseOrders.filter((order) => order.status === 'Pending').length;
    const ordered = purchaseOrders.filter((order) => order.status === 'Ordered').length;
    const delayed = purchaseOrders.filter((order) => order.status === 'Delayed').length;
    return [
      { value: purchaseOrders.length, label: 'Total POs' },
      { value: pending, label: 'Pending approvals' },
      { value: ordered, label: 'Ordered shipments' },
      { value: delayed, label: 'Delayed deliveries' },
    ];
  }, [purchaseOrders]);

  return (
    <main className="min-h-screen bg-[#0B1020] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.6fr_0.95fr] xl:items-start">
          <SectionHeading
            eyebrow="Procurement operations"
            title="Purchase order management"
            description="Create, monitor, and finalize supplier purchase orders with delivery tracking and order status control."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <StatCard key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            <PurchaseOrderTable orders={purchaseOrders} suppliers={suppliers} onUpdateStatus={onUpdateStatus} loading={loading} />
            <ProcurementTimeline items={purchaseOrders} />
          </div>

          <PurchaseOrderForm suppliers={suppliers} onSubmit={onCreateOrder} loading={formLoading} />
        </div>
      </Container>
    </main>
  );
}

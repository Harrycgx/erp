import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import PurchaseOrderTable from '../features/procurement/PurchaseOrderTable';
import { approvePurchaseOrder, cancelPurchaseOrder, fetchPurchaseOrders } from '../services/purchaseOrderService';
import { fetchVendors } from '../services/vendorService';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [ordersResult, vendorsResult] = await Promise.all([fetchPurchaseOrders(), fetchVendors()]);
    if (ordersResult.error || vendorsResult.error) {
      setError(ordersResult.error?.message || vendorsResult.error?.message || 'Unable to load purchase orders.');
      setOrders([]);
      setVendors([]);
    } else {
      setOrders(ordersResult.data || []);
      setVendors(vendorsResult.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    setLoading(true);
    const { error } = await approvePurchaseOrder(id);
    if (error) {
      setError(error.message);
    } else {
      await loadData();
    }
    setLoading(false);
  };

  const handleCancel = async (id) => {
    setLoading(true);
    const { error } = await cancelPurchaseOrder(id);
    if (error) {
      setError(error.message);
    } else {
      await loadData();
    }
    setLoading(false);
  };

  const filteredOrders = useMemo(() => {
    if (!selectedVendor) return orders;
    return orders.filter((order) => String(order.vendor_id) === selectedVendor);
  }, [orders, selectedVendor]);

  const metrics = useMemo(
    () => [
      { value: orders.length, label: 'Total POs' },
      { value: orders.filter((order) => order.po_status === 'Pending').length, label: 'Pending approval' },
      { value: orders.filter((order) => order.po_status === 'Approved').length, label: 'Approved' },
      { value: orders.filter((order) => order.po_status === 'Cancelled').length, label: 'Cancelled' },
    ],
    [orders]
  );

  return (
    <main className="min-h-screen bg-[#0B1020] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.6fr_0.95fr] xl:items-start">
          <SectionHeading
            eyebrow="Purchase order control"
            title="Procurement order pipeline"
            description="Approve or cancel purchase orders, review vendor deliveries, and keep the procurement queue running smoothly."
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

        <div className="grid gap-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Vendor filter</p>
              <select
                value={selectedVendor}
                onChange={(event) => setSelectedVendor(event.target.value)}
                className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="">All vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>
                ))}
              </select>
            </div>
          </div>

          <PurchaseOrderTable orders={filteredOrders} onApprove={handleApprove} onCancel={handleCancel} onSelect={() => {}} />
        </div>
      </Container>
    </main>
  );
}

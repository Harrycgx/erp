import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import { ErrorBanner, LoadingState } from '../components/ui/OperationalState';
import SectionHeading from '../components/ui/SectionHeading';
import SalesOrderTable from '../features/sales/SalesOrderTable';
import { fetchCustomers } from '../services/inquiryService';
import { fetchSalesOrders } from '../services/salesOrderService';
import { SALES_ORDER_STATUS_LIST } from '../utils/salesOrderHelpers';

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const [ordersRes, customersRes] = await Promise.all([fetchSalesOrders(), fetchCustomers()]);
    if (ordersRes.error || customersRes.error) {
      setError(ordersRes.error?.message || customersRes.error?.message || 'Failed to load sales orders.');
      setLoading(false);
      return;
    }
    setOrders(ordersRes.data || []);
    setCustomers(customersRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter ? order.status === statusFilter : true;
      const matchesSearch = q
        ? [order.sales_order_number, order.box_type].some((field) => field?.toLowerCase().includes(q))
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  return (
    <main className="min-h-screen bg-[#090d16] pt-28 text-white">
      <Container className="space-y-6 py-12">
        <SectionHeading
          eyebrow="Sales orders"
          title="Approved quotations converted to orders"
          description="Track sales orders, frozen pricing from quotations, and downstream production dispatch."
        />

        <ErrorBanner message={error} onDismiss={() => setError('')} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SO number or box type"
            className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-slate-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-slate-500"
          >
            <option value="">All statuses</option>
            {SALES_ORDER_STATUS_LIST.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingState message="Loading sales orders…" />
        ) : (
          <SalesOrderTable orders={filtered} customers={customers} loading={false} />
        )}
      </Container>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import InventoryReservationPanel from '../features/sales/InventoryReservationPanel';
import SalesOrderStatusBadge from '../features/sales/SalesOrderStatusBadge';
import { fetchCustomerById } from '../services/inquiryService';
import { fetchReservationsForSalesOrder } from '../services/inventoryReservationService';
import {
  fetchSalesOrderWithItems,
  updateSalesOrderStatus,
} from '../services/salesOrderService';
import { confirmSalesOrderForProduction } from '../services/salesOrderProductionService';
import { fetchProductionJobBySalesOrderId } from '../services/productionService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { SALES_ORDER_STATUS_LIST } from '../utils/salesOrderHelpers';

export default function SalesOrderDetails() {
  const { salesOrderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [productionJob, setProductionJob] = useState(null);
  const [productionLoading, setProductionLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservationLoading, setReservationLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [error, setError] = useState('');
  const [reservationError, setReservationError] = useState('');

  const load = async () => {
    if (!salesOrderId) return;
    setLoading(true);
    setError('');

    const { data, error: fetchError } = await fetchSalesOrderWithItems(salesOrderId);
    if (fetchError) {
      setError(fetchError.message || 'Unable to load sales order.');
      setLoading(false);
      return;
    }

    setOrder(data);
    if (data?.customer_id) {
      const { data: customerData } = await fetchCustomerById(data.customer_id);
      setCustomer(customerData);
    }

    setReservationLoading(true);
    const { data: movementData, error: movementError } = await fetchReservationsForSalesOrder(salesOrderId);
    setMovements(movementData || []);
    setReservationError(movementError?.message || '');
    setReservationLoading(false);

    const { data: jobData } = await fetchProductionJobBySalesOrderId(salesOrderId);
    setProductionJob(jobData || null);

    setLoading(false);
  };

  const handleStartProduction = async () => {
    setProductionLoading(true);
    setError('');
    const { data, error: prodError } = await confirmSalesOrderForProduction({
      salesOrderId,
      actorId: user?.id || null,
    });
    if (prodError) {
      setError(prodError.message || 'Unable to start production.');
      setProductionLoading(false);
      return;
    }
    setProductionJob(data?.productionJob || null);
    await load();
    setProductionLoading(false);
  };

  useEffect(() => {
    load();
  }, [salesOrderId]);

  const handleStatusChange = async (status) => {
    setStatusUpdating(true);
    const { data, error: updateError } = await updateSalesOrderStatus(salesOrderId, status);
    if (updateError) {
      setError(updateError.message || 'Unable to update status.');
    } else {
      setOrder((prev) => ({ ...prev, ...data }));
    }
    setStatusUpdating(false);
  };

  const snapshot = order?.metadata?.quotation_snapshot;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090d16] pt-28 text-white">
        <Container className="py-12 text-sm text-slate-400">Loading sales order…</Container>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#090d16] pt-28 text-white">
        <Container className="py-12">
          <p className="text-rose-200">{error || 'Sales order not found.'}</p>
          <Link to="/sales-orders" className="mt-4 inline-block text-sm text-orange-400 hover:text-orange-300">
            Back to sales orders
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090d16] pt-28 text-white">
      <Container className="space-y-6 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeading
            eyebrow="Sales order"
            title={order.sales_order_number || 'Sales order'}
            description={customer?.company_name || customer?.full_name || 'Customer'}
          />
          <SalesOrderStatusBadge status={order.status} />
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-600/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Quotation ref</dt>
                  <dd className="text-slate-200">
                    {order.quotation_id ? (
                      <Link to={`/quotations/${order.quotation_id}`} className="text-orange-400 hover:text-orange-300">
                        View quotation
                      </Link>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Box type</dt>
                  <dd className="text-slate-200">{order.box_type || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Quantity</dt>
                  <dd className="text-slate-200">{order.quantity || 0}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Pricing locked</dt>
                  <dd className="text-slate-200">
                    {order.metadata?.pricing_locked_at
                      ? new Date(order.metadata.pricing_locked_at).toLocaleString('en-IN')
                      : '—'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Line items</p>
              <table className="mt-3 w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-2">Item</th>
                    <th className="pb-2">Qty</th>
                    <th className="pb-2">Unit</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item) => (
                    <tr key={item.id} className="border-t border-slate-800">
                      <td className="py-2 text-slate-200">{item.item_name}</td>
                      <td className="py-2 text-slate-400">{item.quantity}</td>
                      <td className="py-2 text-slate-400">{formatCurrency(item.unit_price || 0)}</td>
                      <td className="py-2 text-right text-slate-200">{formatCurrency(item.total_price || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {snapshot ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-500">
                <p className="font-medium text-slate-400">Frozen quotation snapshot</p>
                <p className="mt-1">
                  {snapshot.quotation_number || snapshot.quote_number || snapshot.id} — saved at conversion for audit.
                </p>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
              <p className="text-xs uppercase text-slate-500">Totals</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(order.subtotal || 0)}</dd>
                </div>
                <div className="flex justify-between text-slate-400">
                  <dt>GST</dt>
                  <dd>{formatCurrency(order.gst_amount || 0)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-semibold text-white">
                  <dt>Total</dt>
                  <dd>{formatCurrency(order.total_amount || 0)}</dd>
                </div>
              </dl>
            </div>

            <label className="block text-sm text-slate-400">
              Update status
              <select
                disabled={statusUpdating}
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {SALES_ORDER_STATUS_LIST.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Production</p>
              {productionJob ? (
                <Link
                  to={`/production/${productionJob.id}`}
                  className="mt-2 inline-block text-sm font-medium text-orange-400 hover:text-orange-300"
                >
                  {productionJob.production_number} — view job
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={productionLoading}
                  onClick={handleStartProduction}
                  className="mt-3 w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-400 disabled:opacity-60"
                >
                  {productionLoading ? 'Starting…' : 'Start production job'}
                </button>
              )}
            </div>

            <InventoryReservationPanel
              movements={movements}
              loading={reservationLoading}
              error={reservationError}
            />
          </div>
        </div>

        <Link to="/sales-orders" className="text-sm text-orange-400 hover:text-orange-300">
          ← All sales orders
        </Link>
      </Container>
    </main>
  );
}

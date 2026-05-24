export function buildReportSummary(type, period, data) {
  const revenue = (data.invoices || []).reduce((sum, invoice) => sum + Number(invoice.amount || invoice.total || 0), 0);
  const activeOrders = (data.orders || []).filter((order) => order.status && order.status.toLowerCase() !== 'cancelled').length;
  const delayedOrders = (data.orders || []).filter((order) => ['delayed', 'late', 'overdue'].includes((order.status || '').toLowerCase())).length;
  const stockRisk = (data.inventoryItems || []).filter((item) => Number(item.current_stock || 0) < Number(item.reorder_level || 0)).length;
  const pendingPayments = (data.invoices || []).filter((invoice) => invoice.payment_status === 'Pending' || invoice.payment_status === 'Unpaid').length;

  return {
    type,
    period,
    revenue: Math.round(revenue),
    orders: activeOrders,
    delayedOrders,
    stockRisk,
    pendingPayments,
    generated_at: new Date().toISOString(),
  };
}

export function createAutoReorderRules(inventoryItems = []) {
  return inventoryItems
    .filter((item) => Number(item.current_stock ?? item.stock_level ?? 0) <= Number(item.reorder_level ?? item.reorder_point ?? 0))
    .map((item) => ({
      id: `reorder-${item.id || item.material || item.name}`,
      title: `Auto reorder suggestion: ${item.name || item.material || 'Item'}`,
      description: `Stock is below reorder level at ${item.current_stock ?? item.stock_level}. Recommended reorder quantity: ${Number(item.reorder_quantity ?? 0) || 50}.`,
      status: 'Active',
      channels: ['email', 'whatsapp'],
    }));
}

export function createPaymentReminderRules(invoices = []) {
  return invoices
    .filter((invoice) => Number(invoice.days_overdue ?? 0) > 7)
    .map((invoice) => ({
      id: `payment-${invoice.id || invoice.invoice_number}`,
      title: `Payment reminder: ${invoice.customer_name || invoice.customer || 'Customer'}`,
      description: `Invoice outstanding ₹${Number(invoice.amount ?? invoice.total ?? 0).toLocaleString()} and overdue by ${invoice.days_overdue} days.`,
      status: Number(invoice.days_overdue ?? 0) > 30 ? 'Critical' : 'Medium',
      channels: ['email', 'whatsapp'],
    }));
}

export function createOrderEscalationRules(orders = []) {
  return orders
    .filter((order) => ['delayed', 'overdue', 'stalled'].includes((order.status || '').toLowerCase()))
    .map((order) => ({
      id: `escalation-${order.id || order.order_number}`,
      title: `Escalate order ${order.order_number || order.id || 'N/A'}`,
      description: `Order status is ${order.status}. Recommend notifying the production supervisor and account manager.`,
      status: Number(order.days_delayed ?? 0) > 5 ? 'High' : 'Medium',
      channels: ['email'],
    }));
}

export function createProductionWarningRules(productionJobs = []) {
  return productionJobs
    .filter((job) => Number(job.progress ?? 0) < 40 && ['running', 'scheduled'].includes((job.status || '').toLowerCase()))
    .map((job) => ({
      id: `production-${job.id || job.job_code}`,
      title: `Production warning: ${job.order_id || job.job_code || 'Job'}`,
      description: `Job progress is ${job.progress ?? 0}% with low throughput potential.`,
      status: 'Medium',
      channels: ['email'],
    }));
}

export function createAutomationWorkflows(analytics = {}) {
  return [
    ...createAutoReorderRules(analytics.inventoryItems || []),
    ...createPaymentReminderRules(analytics.invoices || []),
    ...createOrderEscalationRules(analytics.orders || []),
    ...createProductionWarningRules(analytics.productionJobs || []),
  ];
}

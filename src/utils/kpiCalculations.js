export function calculateRevenue(invoices = []) {
  return invoices.reduce((sum, item) => sum + Number(item.amount || item.total || 0), 0);
}

export function calculateActiveOrders(orders = []) {
  return orders.filter((order) => order.status && order.status.toLowerCase() !== 'cancelled').length;
}

export function calculateDelayedOrders(orders = []) {
  return orders.filter((order) => ['delayed', 'late', 'overdue'].includes((order.status || '').toLowerCase()) || ['delayed', 'late', 'overdue'].includes((order.production_stage || '').toLowerCase())).length;
}

export function calculatePendingPayments(invoices = []) {
  return invoices.filter((invoice) => invoice.payment_status === 'Pending' || invoice.payment_status === 'Unpaid').length;
}

export function calculateProductionEfficiency(productionJobs = []) {
  const completed = productionJobs.filter((job) => job.status === 'Completed' || job.production_stage === 'Completed').length;
  if (!productionJobs.length) return 0;
  return Math.round((completed / productionJobs.length) * 100);
}

export function calculateWastagePercent(productionJobs = []) {
  const totalProduced = productionJobs.reduce((sum, job) => sum + Number(job.produced_quantity || 0), 0);
  const totalWaste = productionJobs.reduce((sum, job) => sum + Number(job.wastage || job.scrap_quantity || 0), 0);
  if (!totalProduced) return 0;
  return Math.round((totalWaste / (totalProduced + totalWaste)) * 100);
}

export function calculateStockRisk(inventoryItems = []) {
  const lowStock = inventoryItems.filter((item) => Number(item.current_stock || 0) < Number(item.reorder_level || 0)).length;
  return inventoryItems.length ? Math.round((lowStock / inventoryItems.length) * 100) : 0;
}

export function calculateCustomerGrowth(quotations = [], orders = []) {
  const quoteCustomers = new Set(quotations.map((item) => item.customer_id));
  const orderCustomers = new Set(orders.map((item) => item.customer_id));
  if (!quoteCustomers.size) return 0;
  return Math.round((orderCustomers.size / quoteCustomers.size) * 100);
}

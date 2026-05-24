export function detectInventoryAnomalies(inventoryItems = []) {
  return inventoryItems
    .filter((item) => Number(item.wastage_rate ?? item.wastage ?? 0) > 12 || Number(item.current_stock ?? item.stock_level ?? 0) < 0)
    .map((item) => ({
      title: `Inventory anomaly for ${item.name || item.material || 'Material'}`,
      detail: Number(item.wastage_rate ?? item.wastage ?? 0) > 12
        ? `Wastage rate is ${item.wastage_rate}% which exceeds typical operational thresholds.`
        : `Stock levels are negative or inconsistent for this item.`,
      severity: Number(item.wastage_rate ?? item.wastage ?? 0) > 12 ? 'High' : 'Critical',
    }));
}

export function detectProductionAnomalies(productionJobs = []) {
  const slowJobs = productionJobs.filter((job) => {
    const progress = Number(job.progress ?? job.completion ?? 0);
    return ['running', 'scheduled'].includes((job.status || '').toLowerCase()) && progress < 35;
  });
  return slowJobs.map((job) => ({
    title: `Production slowdown on ${job.order_id || job.job_code || 'Job'}`,
    detail: `Job progress is ${job.progress ?? job.completion ?? 0}%, indicating potential line delay or resource shortage.`,
    severity: 'Medium',
  }));
}

export function detectFinanceAnomalies(invoices = []) {
  return invoices
    .filter((invoice) => Number(invoice.days_overdue ?? 0) > 45 && Number(invoice.amount ?? invoice.total ?? 0) > 10000)
    .map((invoice) => ({
      title: `High-value overdue invoice ${invoice.invoice_number || invoice.id || 'N/A'}`,
      detail: `Invoice is ${invoice.days_overdue} days overdue with ₹${Number(invoice.amount ?? invoice.total ?? 0).toLocaleString()} outstanding.`,
      severity: 'High',
    }));
}

export function detectSalesAnomalies(quotations = [], orders = []) {
  const lostRate = orders.length && quotations.length ? ((quotations.length - orders.length) / Math.max(quotations.length, 1)) * 100 : 0;
  if (lostRate > 60) {
    return [{
      title: 'High inquiry conversion loss',
      detail: `Quotation-to-order conversion rate is below expected levels at ${Math.round(100 - lostRate)}%.`,
      severity: 'Medium',
    }];
  }
  return [];
}

export function detectHREvents(attendance = []) {
  const patterns = attendance.filter((record) => ['absent', 'late', 'on_leave'].includes((record.status || '').toLowerCase()));
  if (patterns.length > 6) {
    return [{
      title: 'Elevated absenteeism trend',
      detail: `${patterns.length} attendance records show absence, lateness, or leave. Evaluate shift coverage and risk of overtime.`,
      severity: 'Medium',
    }];
  }
  return [];
}

export function detectOperationalAnomalies(analytics = {}) {
  const alerts = [
    ...detectInventoryAnomalies(analytics.inventoryItems || []),
    ...detectProductionAnomalies(analytics.productionJobs || []),
    ...detectFinanceAnomalies(analytics.invoices || []),
    ...detectSalesAnomalies(analytics.quotations || [], analytics.orders || []),
    ...detectHREvents(analytics.attendance || []),
  ];
  return alerts.length ? alerts : [{ title: 'No anomalies detected', detail: 'Operational data is within expected thresholds for the current period.', severity: 'Low' }];
}

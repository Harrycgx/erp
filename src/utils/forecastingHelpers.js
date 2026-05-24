export function linearTrend(values = []) {
  if (values.length < 2) return values[values.length - 1] || 0;
  const n = values.length;
  const xAvg = (n + 1) / 2;
  const yAvg = values.reduce((sum, value) => sum + Number(value || 0), 0) / n;
  const numerator = values.reduce((sum, value, index) => sum + (index + 1 - xAvg) * (Number(value || 0) - yAvg), 0);
  const denominator = values.reduce((sum, value, index) => sum + Math.pow(index + 1 - xAvg, 2), 0);
  const slope = denominator ? numerator / denominator : 0;
  return values[n - 1] + slope;
}

export function forecastSalesTrend(orders = []) {
  const monthlyRevenue = orders.reduce((acc, order) => {
    const month = order.created_at ? order.created_at.slice(0, 7) : 'unknown';
    acc[month] = (acc[month] || 0) + Number(order.total_amount || order.amount || 0);
    return acc;
  }, {});
  const series = Object.entries(monthlyRevenue).sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value);
  return { current: series[series.length - 1] || 0, forecast: Math.round(linearTrend(series)) };
}

export function forecastMaterialDemand(inventoryItems = []) {
  const usageValues = inventoryItems.map((item) => Number(item.monthly_usage || item.consumption || 0));
  return { current: usageValues.reduce((sum, value) => sum + value, 0), forecast: Math.round(linearTrend(usageValues)) };
}

export function forecastProductionLoad(productionJobs = []) {
  const loadValues = productionJobs.map((job) => Number(job.planned_quantity || job.quantity || 0));
  return { current: loadValues.reduce((sum, value) => sum + value, 0), forecast: Math.round(linearTrend(loadValues)) };
}

export function forecastInventoryRisk(inventoryItems = []) {
  const daysLow = inventoryItems.filter((item) => Number(item.current_stock || 0) < Number(item.reorder_level || 0)).length;
  const trend = inventoryItems.length ? Math.round((daysLow / inventoryItems.length) * 100) : 0;
  return { current: trend, forecast: Math.min(100, trend + 5) };
}

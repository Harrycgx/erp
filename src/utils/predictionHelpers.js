import { linearTrend } from './forecastingHelpers';

function groupByMonth(items = [], dateKey = 'created_at', valueKey = 'amount') {
  return items.reduce((acc, item) => {
    const date = item[dateKey] ? item[dateKey].slice(0, 7) : 'unknown';
    acc[date] = (acc[date] || 0) + Number(item[valueKey] ?? 0);
    return acc;
  }, {});
}

function monthSeries(values = {}) {
  return Object.entries(values).sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => Number(value || 0));
}

export function forecastSales(orders = []) {
  const series = monthSeries(groupByMonth(orders, 'created_at', 'total_amount'));
  return { current: series[series.length - 1] || 0, forecast: Math.max(0, Math.round(linearTrend(series))) };
}

export function forecastInventoryDemand(inventoryItems = []) {
  const demandSeries = inventoryItems.map((item) => Number(item.monthly_usage ?? item.consumption ?? 0));
  return { current: demandSeries.reduce((sum, value) => sum + value, 0), forecast: Math.max(0, Math.round(linearTrend(demandSeries))) };
}

export function forecastProductionLoad(productionJobs = []) {
  const loadSeries = productionJobs.map((job) => Number(job.planned_quantity ?? job.quantity ?? 0));
  return { current: loadSeries.reduce((sum, value) => sum + value, 0), forecast: Math.max(0, Math.round(linearTrend(loadSeries))) };
}

export function forecastPaymentCollection(invoices = []) {
  const recent = invoices.filter((invoice) => Number(invoice.days_overdue ?? 0) <= 90);
  const overdueCount = recent.filter((invoice) => Number(invoice.days_overdue ?? 0) > 0).length;
  const flow = recent.reduce((sum, invoice) => sum + Number(invoice.amount ?? invoice.total ?? 0), 0);
  const chain = monthSeries(groupByMonth(recent, 'due_date', 'amount'));
  return {
    current: flow,
    forecast: Math.max(0, Math.round(linearTrend(chain) * 1.05)),
    overdueShare: Math.round((overdueCount / Math.max(recent.length, 1)) * 100),
  };
}

export function forecastProcurementDemand(inventoryItems = []) {
  const demandSeries = inventoryItems.map((item) => Number(item.monthly_usage ?? item.consumption ?? 0) + Number(item.reorder_gap ?? 0));
  return { current: demandSeries.reduce((sum, value) => sum + value, 0), forecast: Math.max(0, Math.round(linearTrend(demandSeries))) };
}

export function classifyTrend(value, forecast) {
  if (forecast > value * 1.12) return 'Rising';
  if (forecast < value * 0.9) return 'Falling';
  return 'Stable';
}

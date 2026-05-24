import { buildHealthScore } from './predictionHelpers';

export function buildOperationalHealth(analytics = {}) {
  const inventoryRisk = analytics.inventoryItems?.filter((item) => Number(item.current_stock ?? item.stock_level ?? 0) < Number(item.reorder_level ?? item.reorder_point ?? 0)).length || 0;
  const productionPressure = analytics.productionJobs?.filter((job) => ['running', 'active', 'in_progress'].includes((job.status || '').toLowerCase())).length || 0;
  const overduePayments = analytics.invoices?.filter((invoice) => Number(invoice.days_overdue ?? 0) > 15).length || 0;
  const absenteeCount = analytics.attendance?.filter((record) => ['absent', 'late', 'leave'].includes((record.status || '').toLowerCase())).length || 0;

  return {
    inventoryRiskScore: Math.min(100, Math.round((inventoryRisk / Math.max(analytics.inventoryItems?.length || 1, 1)) * 100)),
    productionPressureScore: Math.min(100, Math.round((productionPressure / Math.max(analytics.productionJobs?.length || 1, 1)) * 100)),
    financeRiskScore: Math.min(100, Math.round((overduePayments / Math.max(analytics.invoices?.length || 1, 1)) * 100)),
    hrRiskScore: Math.min(100, Math.round((absenteeCount / Math.max(analytics.attendance?.length || 1, 1)) * 100)),
    healthScore: buildHealthScore(analytics),
  };
}

export function buildAIFactoryInsights(analytics = {}) {
  const insights = [];
  const lowStock = analytics.inventoryItems?.filter((item) => Number(item.current_stock ?? item.stock_level ?? 0) < Number(item.reorder_level ?? item.reorder_point ?? 0)) || [];
  if (lowStock.length >= 4) {
    insights.push({
      title: 'Low inventory warning',
      description: `${lowStock.length} material lines are at or below reorder threshold. Review reordering before the next production cycle.`,
      level: 'High',
    });
  }

  const delayedOrders = analytics.orders?.filter((order) => ['delayed', 'overdue'].includes((order.status || '').toLowerCase())) || [];
  if (delayedOrders.length) {
    insights.push({
      title: 'Delayed order risk',
      description: `${delayedOrders.length} active orders show delayed progress. Prioritize bottleneck clearance for faster dispatch.`,
      level: 'Medium',
    });
  }

  const paymentRisk = analytics.invoices?.filter((invoice) => Number(invoice.days_overdue ?? 0) > 30).length || 0;
  if (paymentRisk > 2) {
    insights.push({
      title: 'Payment collection risk',
      description: `${paymentRisk} invoices are past 30 days overdue. Escalate collection notices to reduce cashflow pressure.`,
      level: 'High',
    });
  }

  const absenteeism = analytics.attendance?.filter((record) => ['absent', 'late'].includes((record.status || '').toLowerCase())).length || 0;
  if (absenteeism > 5) {
    insights.push({
      title: 'Workforce strain',
      description: `${absenteeism} attendance records indicate absence or lateness today. Monitor shift balance and overtime risk.`,
      level: 'Medium',
    });
  }

  return insights.length ? insights : [{ title: 'No critical factory incidents detected', description: 'Current operations remain stable based on available production, inventory, finance, and attendance data.', level: 'Low' }];
}

export function buildRecommendations(analytics = {}) {
  const recommendations = [];
  const lowStock = analytics.inventoryItems?.filter((item) => Number(item.current_stock ?? item.stock_level ?? 0) <= Number(item.reorder_level ?? item.reorder_point ?? 0)) || [];
  if (lowStock.length) {
    recommendations.push({ title: 'Trigger auto reorder', description: `Recommend placing reorder requests for ${lowStock.length} critical stock lines before production demand rises.` });
  }

  const overdueInvoices = analytics.invoices?.filter((invoice) => Number(invoice.days_overdue ?? 0) > 15) || [];
  if (overdueInvoices.length) {
    recommendations.push({ title: 'Send payment reminders', description: `Generate payment reminders for ${overdueInvoices.length} overdue invoices and offer flexible settlement terms.` });
  }

  const bottleneckJobs = analytics.productionJobs?.filter((job) => Number(job.progress ?? 0) < 50 && ['scheduled', 'running'].includes((job.status || '').toLowerCase())) || [];
  if (bottleneckJobs.length) {
    recommendations.push({ title: 'Reallocate capacity', description: `Review ${bottleneckJobs.length} production jobs in backlog and shift capacity from lower-priority lines.` });
  }

  if (analytics.quotations?.length && analytics.orders?.length) {
    const conversion = Math.round((analytics.orders.length / Math.max(analytics.quotations.length, 1)) * 100);
    if (conversion < 35) {
      recommendations.push({ title: 'Improve quote follow-up', description: `Conversion from quotations to orders is ${conversion}%. Deploy targeted follow-up for high-value prospects.` });
    }
  }

  return recommendations.length ? recommendations : [{ title: 'Monitor operations', description: 'No immediate automation actions are necessary. Continue tracking production and finance signals.' }];
}

export function buildCustomerSignals(orders = [], quotations = []) {
  const revenueByCustomer = {};
  const quoteCountByCustomer = {};

  [...orders, ...quotations].forEach((item) => {
    const customer = item.customer_name || item.customer || item.client || 'Unknown';
    const amount = Number(item.total_amount || item.amount || item.quoted_amount || 0);
    if (amount > 0) revenueByCustomer[customer] = (revenueByCustomer[customer] || 0) + amount;
    quoteCountByCustomer[customer] = (quoteCountByCustomer[customer] || 0) + 1;
  });

  const sortedCustomers = Object.entries(revenueByCustomer)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, revenue]) => ({ name, revenue, repeatScore: quoteCountByCustomer[name] || 0 }));

  return sortedCustomers;
}

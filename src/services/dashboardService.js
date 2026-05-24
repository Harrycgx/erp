import supabase from '../lib/supabase';

export async function fetchDashboardMetrics() {
  const [quotesResult, ordersResult, productionResult, inventoryResult, activityResult] = await Promise.all([
    supabase.from('quotations').select('*'),
    supabase.from('orders').select('*'),
    supabase.from('production_jobs').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('inventory_items').select('*'),
    supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(6),
  ]);

  const error = quotesResult.error || ordersResult.error || productionResult.error || inventoryResult.error || activityResult.error;
  if (error) return { data: null, error };

  const quotes = quotesResult.data || [];
  const orders = ordersResult.data || [];
  const productionJobs = productionResult.data || [];
  const inventoryItems = inventoryResult.data || [];
  const runningJobs = productionJobs.filter((job) => ['paper_ordered', 'printing', 'punching', 'pasting', 'qc', 'dispatch_ready', 'dispatched'].includes(String(job.production_stage).toLowerCase()));
  const completedJobs = productionJobs.filter((job) => ['delivered'].includes(String(job.production_stage).toLowerCase()));
  const efficiency = productionJobs.length ? Math.round((completedJobs.length / productionJobs.length) * 100) : 0;

  return {
    data: {
      metrics: [
        { value: quotes.filter((quote) => !['converted', 'converted_to_order', 'rejected', 'expired'].includes(String(quote.status).toLowerCase())).length, label: 'Active Quotes' },
        { value: orders.filter((order) => !['delivered', 'cancelled'].includes(String(order.status).toLowerCase())).length, label: 'Orders Running' },
        { value: `${efficiency}%`, label: 'Production Efficiency' },
        { value: inventoryItems.filter((item) => Number(item.current_stock || 0) <= Number(item.minimum_stock || 0)).length, label: 'Low Stock Alerts' },
      ],
      productionJobs,
      activityLogs: activityResult.data || [],
      runningJobs,
    },
    error: null,
  };
}

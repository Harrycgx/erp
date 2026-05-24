import supabase from '../lib/supabase';

export async function fetchAnalyticsData() {
  const [ordersResult, invoicesResult, productionResult, inventoryResult, employeesResult, attendanceResult, dispatchResult, quotationsResult] = await Promise.all([
    supabase.from('orders').select('*'),
    supabase.from('invoices').select('*'),
    supabase.from('production_jobs').select('*'),
    supabase.from('inventory_items').select('*'),
    supabase.from('employees').select('*'),
    supabase.from('attendance').select('*'),
    supabase.from('dispatch_records').select('*'),
    supabase.from('quotations').select('*'),
  ]);

  const error = ordersResult.error || invoicesResult.error || productionResult.error || inventoryResult.error || employeesResult.error || attendanceResult.error || dispatchResult.error || quotationsResult.error;
  if (error) {
    return { error };
  }

  return {
    data: {
      orders: ordersResult.data || [],
      invoices: invoicesResult.data || [],
      productionJobs: productionResult.data || [],
      inventoryItems: inventoryResult.data || [],
      employees: employeesResult.data || [],
      attendance: attendanceResult.data || [],
      dispatchRecords: dispatchResult.data || [],
      quotations: quotationsResult.data || [],
    },
  };
}

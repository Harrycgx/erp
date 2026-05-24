import { startProductionFromSalesOrder, fetchProductionJobBySalesOrderId } from './productionService';
import { fetchSalesOrderById } from './salesOrderService';
import { SALES_ORDER_STATUSES, normalizeSalesOrderStatus } from '../utils/salesOrderHelpers';

/**
 * Confirm sales order for manufacturing and create linked production job.
 */
export async function confirmSalesOrderForProduction({ salesOrderId, actorId = null, notes = '' } = {}) {
  const soResult = await fetchSalesOrderById(salesOrderId);
  if (soResult.error) return { data: null, error: soResult.error };

  const status = normalizeSalesOrderStatus(soResult.data.status);
  if (status === SALES_ORDER_STATUSES.CANCELLED) {
    return { data: null, error: new Error('Cancelled sales orders cannot enter production.') };
  }
  if (status === SALES_ORDER_STATUSES.COMPLETED) {
    return { data: null, error: new Error('Sales order is already completed.') };
  }

  const existingJob = await fetchProductionJobBySalesOrderId(salesOrderId);
  if (existingJob.data?.id) {
    return {
      data: { productionJob: existingJob.data, salesOrder: soResult.data, existing: true },
      error: null,
    };
  }

  const productionResult = await startProductionFromSalesOrder({
    salesOrderId,
    actorId,
    notes,
  });

  if (productionResult.error) return productionResult;

  return {
    data: {
      salesOrder: soResult.data,
      productionJob: productionResult.data,
      existing: false,
    },
    error: null,
  };
}

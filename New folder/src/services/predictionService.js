import { forecastSales, forecastInventoryDemand, forecastProductionLoad, forecastPaymentCollection, forecastProcurementDemand, classifyTrend } from '../utils/predictionHelpers';

export function runPredictionEngine(analytics = {}) {
  const sales = forecastSales(analytics.orders || []);
  const inventory = forecastInventoryDemand(analytics.inventoryItems || []);
  const production = forecastProductionLoad(analytics.productionJobs || []);
  const payments = forecastPaymentCollection(analytics.invoices || []);
  const procurement = forecastProcurementDemand(analytics.inventoryItems || []);

  return {
    sales: {
      ...sales,
      trend: classifyTrend(sales.current, sales.forecast),
    },
    inventory: {
      ...inventory,
      trend: classifyTrend(inventory.current, inventory.forecast),
    },
    production: {
      ...production,
      trend: classifyTrend(production.current, production.forecast),
    },
    payments: {
      ...payments,
      trend: classifyTrend(payments.current, payments.forecast),
    },
    procurement: {
      ...procurement,
      trend: classifyTrend(procurement.current, procurement.forecast),
    },
  };
}

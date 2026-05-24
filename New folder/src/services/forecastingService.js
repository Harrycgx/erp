import { forecastSalesTrend, forecastMaterialDemand, forecastProductionLoad, forecastInventoryRisk } from '../utils/forecastingHelpers';

export function generateForecasts({ orders = [], inventoryItems = [], productionJobs = [] }) {
  return {
    salesForecast: forecastSalesTrend(orders),
    materialDemandForecast: forecastMaterialDemand(inventoryItems),
    productionLoadForecast: forecastProductionLoad(productionJobs),
    inventoryRiskForecast: forecastInventoryRisk(inventoryItems),
  };
}

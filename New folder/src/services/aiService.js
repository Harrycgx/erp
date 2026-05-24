import { fetchAnalyticsData } from './analyticsService';
import { buildOperationalHealth, buildAIFactoryInsights, buildRecommendations, buildCustomerSignals } from '../utils/aiHelpers';
import { runPredictionEngine } from './predictionService';
import { runAnomalyDetection } from './anomalyDetectionService';
import { buildAutomationWorkflows } from './automationService';

export async function getAIFactoryIntelligence() {
  const analyticsResult = await fetchAnalyticsData();
  if (analyticsResult.error) {
    return { error: analyticsResult.error };
  }

  const analytics = analyticsResult.data;
  return {
    data: {
      overview: buildOperationalHealth(analytics),
      insights: buildAIFactoryInsights(analytics),
      recommendations: buildRecommendations(analytics),
      customerSignals: buildCustomerSignals(analytics.orders, analytics.quotations),
      predictions: runPredictionEngine(analytics),
      anomalies: runAnomalyDetection(analytics),
      automation: buildAutomationWorkflows(analytics),
    },
  };
}

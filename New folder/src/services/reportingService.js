import { fetchAnalyticsData } from './analyticsService';
import { buildReportSummary } from '../utils/reportingHelpers';

export async function prepareReport(type = 'monthly', period = 'current') {
  const analyticsResult = await fetchAnalyticsData();
  if (analyticsResult.error) return analyticsResult;

  return {
    data: {
      type,
      period,
      generated_at: new Date().toISOString(),
      summary: buildReportSummary(type, period, analyticsResult.data),
      payload: analyticsResult.data,
    },
  };
}

export function downloadReportBlob(report) {
  if (!report) return null;
  const content = JSON.stringify(report, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

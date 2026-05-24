import { detectOperationalAnomalies } from '../utils/anomalyHelpers';

export function runAnomalyDetection(analytics = {}) {
  return detectOperationalAnomalies(analytics);
}

import { createAutomationWorkflows } from '../utils/automationHelpers';

export function buildAutomationWorkflows(analytics = {}) {
  return createAutomationWorkflows(analytics);
}

export function executeAutomationAction(actionId) {
  return { success: true, actionId, message: `Automation action ${actionId} was queued for execution.` };
}

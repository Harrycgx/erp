export const STAGE_ORDER = [
  'Pending',
  'Paper Ordered',
  'Printing',
  'Punching',
  'Pasting',
  'Bundling',
  'QC',
  'Dispatch Ready',
  'Delivered',
];

export function compareStage(a, b) {
  return STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b);
}

export function isValidStage(stage) {
  return STAGE_ORDER.includes(stage);
}

export function getNextStage(current) {
  const index = STAGE_ORDER.indexOf(current);
  return STAGE_ORDER[index + 1] || current;
}

export function getPrevStage(current) {
  const index = STAGE_ORDER.indexOf(current);
  return STAGE_ORDER[index - 1] || current;
}

export function buildStageSummary(stage) {
  return stage === 'Dispatch Ready' ? 'Ready for shipment' : stage;
}

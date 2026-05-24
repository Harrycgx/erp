export const ORDER_STAGES = [
  { key: 'Quote Requested', label: 'Quote Requested', progress: 8 },
  { key: 'Design Review', label: 'Design Review', progress: 25 },
  { key: 'Prototype', label: 'Prototype', progress: 42 },
  { key: 'Production', label: 'Production', progress: 62 },
  { key: 'Quality Check', label: 'Quality Check', progress: 78 },
  { key: 'Dispatch', label: 'Dispatch', progress: 92 },
  { key: 'Delivered', label: 'Delivered', progress: 100 },
];

export const statusClasses = {
  'Quote Requested': 'bg-slate-100 text-slate-900',
  'Design Review': 'bg-blue-100 text-blue-900',
  Prototype: 'bg-violet-100 text-violet-900',
  Production: 'bg-orange-100 text-orange-900',
  'Quality Check': 'bg-emerald-100 text-emerald-900',
  Dispatch: 'bg-cyan-100 text-cyan-900',
  Delivered: 'bg-lime-100 text-lime-900',
};

export function getStageIndex(status) {
  return ORDER_STAGES.findIndex((stage) => stage.key === status);
}

export function getStageProgress(status) {
  const index = getStageIndex(status);
  return index < 0 ? 0 : ORDER_STAGES[index].progress;
}

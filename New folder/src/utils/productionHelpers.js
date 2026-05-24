export const PRODUCTION_STAGES = [
  'pending',
  'paper_ordered',
  'printing',
  'punching',
  'pasting',
  'qc',
  'dispatch_ready',
  'dispatched',
  'delivered',
];

export const PRIORITY_LEVELS = ['Normal', 'High', 'Urgent'];

export function normalizeStage(stage) {
  return String(stage || 'pending').toLowerCase().replace(/\s+/g, '_');
}

export function formatStageLabel(stage) {
  return normalizeStage(stage).replace(/_/g, ' ');
}

export function buildProductionNumber() {
  const timestamp = Date.now().toString().slice(-6);
  return `PRD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${timestamp}`;
}

export function buildJobHeadline(job) {
  return `${job.order_number || `Order ${job.order_id || job.id}`}`;
}

export function buildJobSubline(job) {
  return `${job.box_type || 'Corrugated pack'} · ${job.quantity || 0} pcs`;
}

export function formatDate(value) {
  if (!value) return 'TBD';
  const date = new Date(value);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return 'TBD';
  const date = new Date(value);
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function estimateCompletionDate(quantity = 0, priority = 'Normal') {
  const baseDays = Math.max(2, Math.ceil(Number(quantity || 0) / 1000));
  const adjustedDays = String(priority).toLowerCase() === 'high' ? Math.max(1, baseDays - 1) : baseDays;
  const date = new Date();
  date.setDate(date.getDate() + adjustedDays);
  return date.toISOString();
}

export function isOverdue(job) {
  if (!job.estimated_completion) return false;
  return new Date(job.estimated_completion) < new Date() && normalizeStage(job.production_stage) !== 'delivered';
}

export function getPriorityClass(priority) {
  switch (priority) {
    case 'Urgent':
      return 'bg-rose-500 text-white';
    case 'High':
      return 'bg-orange-500 text-white';
    default:
      return 'bg-slate-600 text-slate-100';
  }
}

export function getProductionBadgeClasses(stage) {
  switch (normalizeStage(stage)) {
    case 'pending':
      return 'bg-slate-700 text-slate-100';
    case 'paper_ordered':
      return 'bg-cyan-900 text-cyan-100';
    case 'printing':
      return 'bg-orange-900 text-orange-100';
    case 'punching':
      return 'bg-violet-900 text-violet-100';
    case 'pasting':
      return 'bg-emerald-900 text-emerald-100';
    case 'qc':
      return 'bg-slate-900 text-white';
    case 'dispatch_ready':
      return 'bg-sky-900 text-sky-100';
    case 'dispatched':
      return 'bg-blue-900 text-blue-100';
    case 'delivered':
      return 'bg-lime-900 text-lime-100';
    default:
      return 'bg-slate-700 text-slate-100';
  }
}

export function getStageProgress(stage) {
  const index = PRODUCTION_STAGES.indexOf(normalizeStage(stage));
  if (index === -1) return 0;
  return Math.round(((index + 1) / PRODUCTION_STAGES.length) * 100);
}

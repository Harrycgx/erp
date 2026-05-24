export const SALES_ORDER_STATUSES = {
  PENDING: 'pending',
  IN_PRODUCTION: 'in_production',
  DISPATCH_READY: 'dispatch_ready',
  DISPATCHED: 'dispatched',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const SALES_ORDER_STATUS_LIST = [
  SALES_ORDER_STATUSES.PENDING,
  SALES_ORDER_STATUSES.IN_PRODUCTION,
  SALES_ORDER_STATUSES.DISPATCH_READY,
  SALES_ORDER_STATUSES.DISPATCHED,
  SALES_ORDER_STATUSES.COMPLETED,
];

export function normalizeSalesOrderStatus(status) {
  return String(status || SALES_ORDER_STATUSES.PENDING)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

export function salesOrderStatusClasses(status) {
  switch (normalizeSalesOrderStatus(status)) {
    case SALES_ORDER_STATUSES.IN_PRODUCTION:
      return 'bg-orange-900/80 text-orange-100';
    case SALES_ORDER_STATUSES.DISPATCH_READY:
      return 'bg-cyan-900/80 text-cyan-100';
    case SALES_ORDER_STATUSES.DISPATCHED:
      return 'bg-sky-900/80 text-sky-100';
    case SALES_ORDER_STATUSES.COMPLETED:
      return 'bg-emerald-900/80 text-emerald-100';
    case SALES_ORDER_STATUSES.CANCELLED:
      return 'bg-rose-900/80 text-rose-100';
    default:
      return 'bg-slate-700 text-slate-100';
  }
}

export function formatSalesOrderStatusLabel(status) {
  return normalizeSalesOrderStatus(status).replace(/_/g, ' ');
}

/**
 * Preview format SO-2026-0001 (DB trigger may assign authoritative number on insert).
 */
export function generateSalesOrderNumber(sequence = 1) {
  const year = new Date().getFullYear();
  const seq = Math.max(Number(sequence) || 1, 1);
  return `SO-${year}-${String(seq).padStart(4, '0')}`;
}

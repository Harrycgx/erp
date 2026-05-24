export const PURCHASE_STATES = ['Pending', 'Ordered', 'Received', 'Delayed', 'Cancelled'];

export function getPurchaseStatusLabel(status) {
  switch (status) {
    case 'Ordered':
      return 'Ordered';
    case 'Received':
      return 'Received';
    case 'Delayed':
      return 'Delayed';
    case 'Cancelled':
      return 'Cancelled';
    default:
      return 'Pending';
  }
}

export function buildPoNumber(order) {
  if (!order) return `PO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  if (order.po_number) return order.po_number;
  return `PO-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export function getPoBadgeClasses(status) {
  switch (status) {
    case 'Received':
      return 'bg-emerald-900 text-emerald-100';
    case 'Delayed':
      return 'bg-rose-900 text-rose-100';
    case 'Ordered':
      return 'bg-orange-900 text-orange-100';
    case 'Cancelled':
      return 'bg-slate-700 text-slate-100';
    default:
      return 'bg-slate-700 text-slate-100';
  }
}

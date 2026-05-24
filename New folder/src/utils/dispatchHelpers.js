export const DELIVERY_STATUSES = ['Pending', 'In Transit', 'Delivered', 'Delayed'];

export function buildLrNumber(orderId) {
  if (!orderId) return `LR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  return `LR-${orderId.toString().slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;
}

export function statusClasses(status) {
  switch (status) {
    case 'Delivered':
      return 'bg-lime-900 text-lime-100';
    case 'In Transit':
      return 'bg-blue-900 text-blue-100';
    case 'Delayed':
      return 'bg-rose-900 text-rose-100';
    default:
      return 'bg-slate-700 text-slate-100';
  }
}

export function formatDispatchDate(value) {
  if (!value) return 'TBD';
  const date = new Date(value);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

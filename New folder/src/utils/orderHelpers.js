export const ORDER_STATUSES = ['Pending', 'Paper Ordered', 'Printing', 'Punching', 'Pasting', 'QC', 'Dispatch Ready', 'Delivered'];
export const PAYMENT_STATUSES = ['Pending', 'Partial', 'Paid'];
export const PRODUCTION_STAGES = [
  { key: 'Pending', label: 'Pending' },
  { key: 'Paper Ordered', label: 'Paper Ordered' },
  { key: 'Printing', label: 'Printing' },
  { key: 'Punching', label: 'Punching' },
  { key: 'Pasting', label: 'Pasting' },
  { key: 'QC', label: 'Quality Check' },
  { key: 'Dispatch Ready', label: 'Dispatch Ready' },
  { key: 'Delivered', label: 'Delivered' },
];

export const orderStatusClasses = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-slate-700 text-slate-100';
    case 'Paper Ordered':
      return 'bg-cyan-900 text-cyan-100';
    case 'Printing':
      return 'bg-orange-900 text-orange-100';
    case 'Punching':
      return 'bg-violet-900 text-violet-100';
    case 'Pasting':
      return 'bg-emerald-900 text-emerald-100';
    case 'QC':
      return 'bg-slate-900 text-white';
    case 'Dispatch Ready':
      return 'bg-sky-900 text-sky-100';
    case 'Delivered':
      return 'bg-lime-900 text-lime-100';
    default:
      return 'bg-slate-700 text-slate-100';
  }
};

export function buildOrderNumber() {
  const timestamp = Date.now().toString().slice(-6);
  return `ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${timestamp}`;
}

export function buildSalesOrderNumber() {
  const timestamp = Date.now().toString().slice(-6);
  return `SO-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${timestamp}`;
}

export function getOrderBadgeLabel(order) {
  return `${order.order_number || 'ORD-000'} • ${order.production_stage || 'Pending'}`;
}

export function filterOrders(orders, search, status, stage) {
  return orders.filter((order) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = [order.order_number, order.client, order.product, order.assigned_staff].some((field) =>
      field?.toLowerCase().includes(searchLower)
    );
    const matchesStatus = status ? order.status === status : true;
    const matchesStage = stage ? order.production_stage === stage : true;
    return matchesSearch && matchesStatus && matchesStage;
  });
}

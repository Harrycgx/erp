import { getStageProgress } from './orderStatus';

const estimateDays = {
  'Quote Requested': 10,
  'Design Review': 8,
  Prototype: 6,
  Production: 4,
  'Quality Check': 2,
  Dispatch: 1,
  Delivered: 0,
};

export function getOrderProgress(status) {
  return getStageProgress(status);
}

export function getDispatchEstimate(status, priority = 'Normal') {
  const lead = estimateDays[status] ?? 7;
  return `${Math.max(0, lead - (priority === 'Urgent' ? 1 : 0))} days`;
}

export function buildOrderSummary(order) {
  return `${order.quantity.toLocaleString()} units · ${order.product}`;
}

export const mockOrders = [
  {
    id: 'BX-3109',
    client: 'NOVA Packaging',
    product: 'Premium mailer shells',
    quantity: 7200,
    status: 'Production',
    priority: 'Urgent',
    due: 'May 28',
  },
  {
    id: 'BX-4127',
    client: 'Atlas Retail',
    product: 'Rigid brand boxes',
    quantity: 3200,
    status: 'Design Review',
    priority: 'High',
    due: 'Jun 3',
  },
  {
    id: 'BX-2781',
    client: 'Aura Goods',
    product: 'Sustainable cartons',
    quantity: 1450,
    status: 'Prototype',
    priority: 'Normal',
    due: 'Jun 8',
  },
  {
    id: 'BX-5590',
    client: 'Pulse Systems',
    product: 'E-commerce shippers',
    quantity: 9800,
    status: 'Quote Requested',
    priority: 'Normal',
    due: 'Jun 15',
  },
  {
    id: 'BX-6324',
    client: 'Crest Industries',
    product: 'Quality test packs',
    quantity: 5400,
    status: 'Quality Check',
    priority: 'High',
    due: 'May 25',
  },
];

export function getQueueOrders() {
  return mockOrders.filter((order) => order.status !== 'Delivered').slice(0, 4);
}

export function getCompletedOrders() {
  return mockOrders.filter((order) => order.status === 'Delivered');
}

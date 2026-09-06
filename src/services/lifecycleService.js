/**
 * Lifecycle Service
 * Validates state transitions for business objects.
 * Based on the lifecycle defined in BOXIQ_VQ_ERP.md.
 */

// Define allowed transitions for each object type
const quoteTransitions = {
  draft: ['configured', 'rejected'],
  configured: ['engineering_review', 'draft'],
  engineering_review: ['indicative_price', 'configured'],
  indicative_price: ['save_identify', 'engineering_review'],
  save_identify: ['design_studio', 'indicative_price'],
  design_studio: ['artwork', 'save_identify'],
  artwork: ['preflight_proof', 'design_studio'],
  preflight_proof: ['quote_request', 'artwork'],
  quote_request: ['quote', 'preflight_proof'],
  quote: ['accepted', 'rejected'],
  accepted: ['order_confirmed'], // transition to order
  rejected: [], // terminal
  order_confirmed: [] // handled by order lifecycle
};

const orderTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['production_started', 'pending'],
  production_started: ['production_completed', 'confirmed'],
  production_completed: ['dispatched', 'production_started'],
  dispatched: ['delivered', 'production_completed'],
  delivered: [], // terminal
  cancelled: []
};

const invoiceTransitions = {
  draft: ['due', 'cancelled'],
  due: ['paid', 'overdue'],
  overdue: ['paid', 'due'],
  paid: [], // terminal
  cancelled: []
};

/**
 * Check if a quote status transition is allowed.
 * @param {string} fromStatus
 * @param {string} toStatus
 * @returns {boolean}
 */
export function canTransitionQuote(fromStatus, toStatus) {
  const allowed = quoteTransitions[fromStatus];
  return allowed && allowed.includes(toStatus);
}

/**
 * Check if an order status transition is allowed.
 * @param {string} fromStatus
 * @param {string} toStatus
 * @returns {boolean}
 */
export function canTransitionOrder(fromStatus, toStatus) {
  const allowed = orderTransitions[fromStatus];
  return allowed && allowed.includes(toStatus);
}

/**
 * Check if an invoice status transition is allowed.
 * @param {string} fromStatus
 * @param {string} toStatus
 * @returns {boolean}
 */
export function canTransitionInvoice(fromStatus, toStatus) {
  const allowed = invoiceTransitions[fromStatus];
  return allowed && allowed.includes(toStatus);
}

// Additional lifecycle validation for production_stage, etc., can be added here.

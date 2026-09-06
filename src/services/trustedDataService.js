import { projectionService } from "./projectionService";

/**
 * Trusted Data Service
 * Provides data safe for AI consumption.
 * Currently delegates to projectionService, but can add additional filtering if needed.
 */

export const trustedDataService = {
  async getQuoteForCustomer(quoteId) {
    return await projectionService.getQuoteForCustomer(quoteId);
  },
  async getOrderForCustomer(orderId) {
    return await projectionService.getOrderForCustomer(orderId);
  },
  async getInvoiceForCustomer(invoiceId) {
    return await projectionService.getInvoiceForCustomer(invoiceId);
  },
  async getProductionStatusForCustomer(orderId) {
    return await projectionService.getProductionStatusForCustomer(orderId);
  }
};

export default trustedDataService;

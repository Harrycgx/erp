import supabase from '../lib/supabase';
import {
  addCustomerQuotationNote,
  fetchQuotationWithItems,
  logQuotationActivity,
  normalizeQuotationStatus,
  QUOTATION_STATUSES,
  updateQuotation,
} from './quotationService';
import { fetchBOMForProduct, calculateMaterialRequirements } from './bomService';
import {
  createSalesOrderFromQuotation,
  deleteSalesOrder,
  fetchSalesOrderByQuotationId,
  validateSalesOrderFromQuotation,
} from './salesOrderService';
import {
  releaseInventoryReservationsForSalesOrder,
  reserveInventoryForSalesOrder,
  validateAvailableInventory,
} from './inventoryReservationService';
import { startProductionFromSalesOrder } from './productionService';

const CONVERTIBLE_STATUSES = new Set([
  QUOTATION_STATUSES.SENT,
  QUOTATION_STATUSES.APPROVED,
  QUOTATION_STATUSES.REVISED,
]);

export function validateQuotationConversionEligibility(quote = {}) {
  const errors = [];
  const status = normalizeQuotationStatus(quote?.status);

  if ([QUOTATION_STATUSES.CONVERTED, QUOTATION_STATUSES.REJECTED, QUOTATION_STATUSES.EXPIRED].includes(status)) {
    errors.push(`Quotation cannot be converted while status is "${status}".`);
  }

  if (!CONVERTIBLE_STATUSES.has(status) && status !== QUOTATION_STATUSES.DRAFT) {
    errors.push(`Quotation status "${status}" is not eligible for sales order conversion.`);
  }

  if (status === QUOTATION_STATUSES.DRAFT) {
    errors.push('Send or approve the quotation before converting to a sales order.');
  }

  if (!quote?.customer_id) {
    errors.push('Quotation must have a customer.');
  }

  const items = quote?.items || [];
  if (!items.length) {
    errors.push('Quotation must have at least one line item.');
  }

  items.forEach((item, index) => {
    const qty = Number(item.quantity);
    const price = Number(item.unit_price);
    if (!String(item.item_name || '').trim()) {
      errors.push(`Line ${index + 1}: item name is required.`);
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      errors.push(`Line ${index + 1}: invalid quantity.`);
    }
    if (!Number.isFinite(price) || price < 0) {
      errors.push(`Line ${index + 1}: invalid unit price.`);
    }
  });

  return { valid: errors.length === 0, errors, message: errors[0] || '' };
}

/**
 * Operational pipeline: approved/sent quotation → sales order → inventory reservation → converted.
 */
export async function convertQuotationToSalesOrder({
  quotationId,
  customerNote = '',
  actorId = null,
  skipInventory = false,
} = {}) {
  const quotationResult = await fetchQuotationWithItems(quotationId);
  if (quotationResult.error) return { data: null, error: quotationResult.error };

  const quote = quotationResult.data;
  const eligibility = validateQuotationConversionEligibility(quote);
  if (!eligibility.valid) {
    return { data: null, error: new Error(eligibility.message), errors: eligibility.errors };
  }

  const existing = await fetchSalesOrderByQuotationId(quotationId);
  if (existing.error) return { data: null, error: existing.error };
  if (existing.data?.id) {
    return {
      data: null,
      error: new Error(
        `A sales order already exists for this quotation (${existing.data.sales_order_number || existing.data.id}).`
      ),
    };
  }

  const salesValidation = validateSalesOrderFromQuotation(quote, quote.items || []);
  if (!salesValidation.valid) {
    return { data: null, error: new Error(salesValidation.message), errors: salesValidation.errors };
  }

  const bomResult = await fetchBOMForProduct(quote.box_type || quote.product_name || '');
  const requirements =
    bomResult.error || !bomResult.data
      ? []
      : calculateMaterialRequirements(bomResult.data, quote.quantity || salesValidation.financials.quotation.quantity || 0);

  if (!skipInventory && requirements.length) {
    const stockCheck = await validateAvailableInventory(requirements);
    if (!stockCheck.valid) {
      return {
        data: null,
        error: new Error(stockCheck.message),
        shortages: stockCheck.shortages,
      };
    }
  }

  const salesOrderResult = await createSalesOrderFromQuotation(quote, {
    actorId,
    notes: customerNote.trim() || undefined,
  });
  if (salesOrderResult.error) return { data: null, error: salesOrderResult.error };

  const salesOrder = salesOrderResult.data;
  let reservations = [];

  if (!skipInventory && requirements.length) {
    const reservationResult = await reserveInventoryForSalesOrder({
      requirements,
      salesOrderId: salesOrder.id,
      quotationId: quote.id,
      actorId,
      strict: true,
    });

    if (reservationResult.error) {
      await releaseInventoryReservationsForSalesOrder({
        requirements,
        salesOrderId: salesOrder.id,
        actorId,
      });
      await deleteSalesOrder(salesOrder.id);
      return {
        data: null,
        error: reservationResult.error,
        shortages: reservationResult.shortages,
      };
    }
    reservations = reservationResult.data || [];
  }

  const approvedAt = new Date().toISOString();
  const quoteUpdate = await updateQuotation(quote.id, {
    status: QUOTATION_STATUSES.CONVERTED,
    approved_at: quote.approved_at || approvedAt,
    converted_at: approvedAt,
    metadata: {
      ...(quote.metadata || {}),
      approved_at: quote.approved_at || approvedAt,
      converted_at: approvedAt,
      converted_sales_order_id: salesOrder.id,
      converted_sales_order_number: salesOrder.sales_order_number,
      inventory_reserved: reservations.length > 0,
      reservation_count: reservations.length,
    },
  });

  if (quoteUpdate.error) {
    return {
      data: { salesOrder, reservations },
      error: quoteUpdate.error,
    };
  }

  if (customerNote.trim()) {
    await addCustomerQuotationNote({
      quotationId: quote.id,
      customerId: quote.customer_id,
      authorId: actorId,
      note: customerNote.trim(),
      noteType: 'approval',
    });
  }

  await logQuotationActivity({
    quotation_id: quote.id,
    customer_id: quote.customer_id,
    actor_id: actorId,
    activity_type: 'quotation_converted_to_sales_order',
    message: `Quotation converted to sales order ${salesOrder.sales_order_number || salesOrder.id}.`,
    metadata: {
      sales_order_id: salesOrder.id,
      sales_order_number: salesOrder.sales_order_number,
      reservations: reservations.length,
    },
  });

  await supabase.from('activity_logs').insert([
    {
      actor_id: actorId,
      customer_id: quote.customer_id,
      quotation_id: quote.id,
      activity_type: 'sales_order_created',
      message: `Sales order ${salesOrder.sales_order_number || salesOrder.id} created from quotation.`,
      metadata: {
        sales_order_id: salesOrder.id,
        sales_order_number: salesOrder.sales_order_number,
      },
    },
  ]);

  let productionJob = null;
  let productionError = null;
  const productionResult = await startProductionFromSalesOrder({
    salesOrderId: salesOrder.id,
    actorId,
    notes: `Auto-started from quotation ${quote.quotation_number || quote.id}`,
  });
  if (productionResult.error) {
    productionError = productionResult.error;
  } else {
    productionJob = productionResult.data;
    await updateQuotation(quote.id, {
      metadata: {
        ...(quoteUpdate.data?.metadata || quote.metadata || {}),
        production_job_id: productionJob.id,
        production_number: productionJob.production_number,
      },
    });
  }

  return {
    data: {
      quotation: quoteUpdate.data,
      salesOrder,
      reservations,
      productionJob,
      productionError,
    },
    error: null,
  };
}

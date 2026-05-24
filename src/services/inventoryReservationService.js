import { createProcurementRequest } from './procurementService';
import { fetchInventoryItemById, updateInventoryItem } from './inventoryService';
import {
  fetchMovementsByReference,
  INVENTORY_MOVEMENT_TYPES,
  recordInventoryMovement,
} from './inventoryMovementService';
import supabase from '../lib/supabase';

function getStockFields(item) {
  const stockQuantity = Number(item.stock_quantity ?? item.current_stock ?? 0);
  const reservedQuantity = Number(item.reserved_quantity ?? item.reserved_stock ?? 0);
  const availableQuantity = Number(item.available_quantity ?? stockQuantity - reservedQuantity);
  return { stockQuantity, reservedQuantity, availableQuantity };
}

/**
 * Validate BOM/material requirements against available stock.
 */
export async function validateAvailableInventory(requirements = []) {
  if (!requirements.length) {
    return { valid: true, errors: [], shortages: [] };
  }

  const errors = [];
  const shortages = [];

  for (const requirement of requirements) {
    const inventoryItemId = requirement.inventory_item_id;
    const requiredQty = Number(requirement.quantity_required || 0);
    if (!inventoryItemId || requiredQty <= 0) continue;

    const itemResult = await fetchInventoryItemById(inventoryItemId);
    if (itemResult.error) {
      errors.push(itemResult.error.message || `Unable to load inventory item ${inventoryItemId}.`);
      continue;
    }

    const { availableQuantity } = getStockFields(itemResult.data);
    if (availableQuantity < requiredQty) {
      const label = itemResult.data.item_name || itemResult.data.material_name || inventoryItemId;
      const message = `Insufficient stock for ${label}: required ${requiredQty}, available ${availableQuantity}`;
      errors.push(message);
      shortages.push({
        inventory_item_id: inventoryItemId,
        item_name: label,
        required: requiredQty,
        available: availableQuantity,
        shortfall: requiredQty - availableQuantity,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    shortages,
    message: errors[0] || '',
  };
}

export async function createInventoryReservationLog({
  inventoryItemId,
  salesOrderId = null,
  quotationId = null,
  quantity = 0,
  stockBefore = 0,
  stockAfter = 0,
  actorId = null,
  notes = '',
}) {
  const movementResult = await recordInventoryMovement({
    inventoryItemId,
    movementType: INVENTORY_MOVEMENT_TYPES.RESERVED,
    quantity,
    referenceType: 'sales_order',
    referenceId: salesOrderId,
    notes: notes || `Reserved for sales order ${salesOrderId}`,
    actorId,
  });

  const logResult = await supabase.from('inventory_transaction_logs').insert([
    {
      inventory_item_id: inventoryItemId,
      quotation_id: quotationId,
      transaction_type: 'reserved',
      quantity,
      stock_before: stockBefore,
      stock_after: stockAfter,
      notes: notes || `Reservation for sales order ${salesOrderId}`,
      metadata: { sales_order_id: salesOrderId, quotation_id: quotationId },
      created_by: actorId,
    },
  ]);

  return {
    movement: movementResult,
    log: logResult,
    error: movementResult.error || logResult.error || null,
  };
}

export async function fetchReservationsForSalesOrder(salesOrderId) {
  return fetchMovementsByReference({ referenceType: 'sales_order', referenceId: salesOrderId });
}

export async function reserveInventoryForSalesOrder({
  requirements = [],
  salesOrderId,
  quotationId = null,
  actorId = null,
  strict = true,
}) {
  return reserveInventoryForOrder({
    requirements,
    orderId: salesOrderId,
    quotationId,
    actorId,
    referenceType: 'sales_order',
    strict,
  });
}

export async function reserveInventoryForOrder({
  requirements = [],
  orderId = null,
  quotationId = null,
  actorId = null,
  referenceType = 'order',
  strict = true,
}) {
  if (!requirements.length) {
    return { data: [], error: null, warnings: [] };
  }

  const availability = await validateAvailableInventory(requirements);
  if (!availability.valid && strict) {
    return { data: null, error: new Error(availability.message), shortages: availability.shortages };
  }

  const reservedItems = [];
  const completedMovements = [];
  const warnings = availability.shortages || [];

  const rollback = async () => {
    for (const reservation of reservedItems) {
      await updateInventoryItem(reservation.inventory_item_id, {
        reserved_stock: Number(reservation.previousReservedStock || 0),
        reserved_quantity: Number(reservation.previousReservedQuantity || 0),
        available_quantity: Number(reservation.previousAvailableQuantity || 0),
      });
    }
    for (const movement of completedMovements) {
      if (movement.id) {
        await recordInventoryMovement({
          inventoryItemId: movement.inventory_item_id,
          movementType: INVENTORY_MOVEMENT_TYPES.RESERVATION_RELEASE,
          quantity: movement.quantity,
          referenceType,
          referenceId: orderId,
          notes: `Rollback reservation for ${referenceType} ${orderId}`,
          actorId,
        });
      }
    }
  };

  for (const requirement of requirements) {
    const { inventory_item_id: inventoryItemId, quantity_required: quantityRequired } = requirement;
    const itemResult = await fetchInventoryItemById(inventoryItemId);
    if (itemResult.error) {
      await rollback();
      return { data: null, error: itemResult.error };
    }

    const item = itemResult.data;
    const { stockQuantity, reservedQuantity, availableQuantity } = getStockFields(item);
    const requiredQty = Number(quantityRequired || 0);

    if (availableQuantity < requiredQty) {
      if (strict) {
        await createProcurementRequest({
          inventory_item_id: inventoryItemId,
          supplier_id: item.supplier_id,
          order_id: orderId,
          request_type: 'low_stock',
          status: 'open',
          required_quantity: Math.max(requiredQty - availableQuantity, 0),
          priority: 'high',
          notes: `Low stock triggered by ${referenceType} ${orderId}`,
          metadata: { quotation_id: quotationId, sales_order_id: orderId },
          created_by: actorId,
        });

        await rollback();
        return {
          data: null,
          error: new Error(
            `Insufficient stock for ${item.item_name || item.material_name || inventoryItemId}: required ${requiredQty}, available ${availableQuantity}`
          ),
          shortages: availability.shortages,
        };
      }
      continue;
    }

    const nextReserved = reservedQuantity + requiredQty;
    const nextAvailable = stockQuantity - nextReserved;
    const updateResult = await updateInventoryItem(inventoryItemId, {
      reserved_stock: nextReserved,
      reserved_quantity: nextReserved,
      available_quantity: nextAvailable,
    });

    if (updateResult.error) {
      await rollback();
      return { data: null, error: updateResult.error };
    }

    const logResult = await createInventoryReservationLog({
      inventoryItemId,
      salesOrderId: referenceType === 'sales_order' ? orderId : null,
      quotationId,
      quantity: requiredQty,
      stockBefore: reservedQuantity,
      stockAfter: nextReserved,
      actorId,
      notes: `Reserved for ${referenceType} ${orderId}`,
    });

    if (logResult.error) {
      await rollback();
      return { data: null, error: logResult.error };
    }

    reservedItems.push({
      inventory_item_id: inventoryItemId,
      previousReservedStock: reservedQuantity,
      previousReservedQuantity: reservedQuantity,
      previousAvailableQuantity: availableQuantity,
      quantity: requiredQty,
    });
    completedMovements.push({
      inventory_item_id: inventoryItemId,
      quantity: requiredQty,
      id: logResult.movement?.data?.[0]?.id,
    });
  }

  return { data: reservedItems, error: null, warnings };
}

export async function releaseInventoryReservationsForOrder({
  requirements = [],
  orderId = null,
  actorId = null,
  referenceType = 'order',
}) {
  if (!requirements.length) {
    return { data: [], error: null };
  }

  const released = [];

  for (const requirement of requirements) {
    const { inventory_item_id: inventoryItemId, quantity_required: quantityRequired } = requirement;
    const itemResult = await fetchInventoryItemById(inventoryItemId);
    if (itemResult.error) return { data: null, error: itemResult.error };

    const item = itemResult.data;
    const { stockQuantity, reservedQuantity } = getStockFields(item);
    const nextReserved = Math.max(reservedQuantity - Number(quantityRequired || 0), 0);
    const nextAvailable = stockQuantity - nextReserved;

    const updateResult = await updateInventoryItem(inventoryItemId, {
      reserved_stock: nextReserved,
      reserved_quantity: nextReserved,
      available_quantity: nextAvailable,
    });
    if (updateResult.error) return { data: null, error: updateResult.error };

    const movementResult = await recordInventoryMovement({
      inventoryItemId,
      movementType: INVENTORY_MOVEMENT_TYPES.RESERVATION_RELEASE,
      quantity: Number(quantityRequired || 0),
      referenceType,
      referenceId: orderId,
      notes: `Released reservation for ${referenceType} ${orderId}`,
      actorId,
    });
    if (movementResult.error) return { data: null, error: movementResult.error };

    released.push({ inventory_item_id: inventoryItemId, quantity: Number(quantityRequired || 0) });
  }

  return { data: released, error: null };
}

export async function releaseInventoryReservationsForSalesOrder({ requirements, salesOrderId, actorId }) {
  return releaseInventoryReservationsForOrder({
    requirements,
    orderId: salesOrderId,
    actorId,
    referenceType: 'sales_order',
  });
}

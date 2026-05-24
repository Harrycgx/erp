import { createProcurementRequest } from './procurementService';
import { fetchInventoryItemById, updateInventoryItem } from './inventoryService';
import { insertInventoryMovement } from './inventoryMovementService';

export async function reserveInventoryForOrder({ requirements = [], orderId = null, quotationId = null, actorId = null }) {
  if (!requirements.length) {
    return { data: [], error: null };
  }

  const reservedItems = [];
  const completedMovements = [];

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
        await insertInventoryMovement({
          inventory_item_id: movement.inventory_item_id,
          movement_type: 'reservation_release',
          quantity: movement.quantity,
          reference_type: 'order',
          reference_id: orderId,
          notes: `Rollback reservation for order ${orderId}`,
          created_by: actorId,
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
    const currentStock = Number(item.stock_quantity ?? item.current_stock ?? 0);
    const reservedQuantity = Number(item.reserved_quantity ?? item.reserved_stock ?? 0);
    const availableQuantity = currentStock - reservedQuantity;
    const requiredQty = Number(quantityRequired || 0);

    if (availableQuantity < requiredQty) {
      await createProcurementRequest({
        inventory_item_id: inventoryItemId,
        supplier_id: item.supplier_id,
        order_id: orderId,
        request_type: 'low_stock',
        status: 'open',
        required_quantity: Math.max(requiredQty - availableQuantity, 0),
        priority: 'high',
        notes: `Low stock triggered by order ${orderId}`,
        metadata: { quotation_id: quotationId },
        created_by: actorId,
      });

      await rollback();
      return {
        data: null,
        error: new Error(
          `Insufficient stock for ${item.item_name || item.material_name || inventoryItemId}: required ${requiredQty}, available ${availableQuantity}`
        ),
      };
    }

    const nextReserved = reservedQuantity + requiredQty;
    const nextAvailable = currentStock - nextReserved;
    const updateResult = await updateInventoryItem(inventoryItemId, {
      reserved_stock: nextReserved,
      reserved_quantity: nextReserved,
      available_quantity: nextAvailable,
    });

    if (updateResult.error) {
      await rollback();
      return { data: null, error: updateResult.error };
    }

    const movementResult = await insertInventoryMovement({
      inventory_item_id: inventoryItemId,
      movement_type: 'reserved',
      quantity: requiredQty,
      reference_type: 'order',
      reference_id: orderId,
      notes: `Reserved for order ${orderId}`,
      created_by: actorId,
    });

    if (movementResult.error) {
      await rollback();
      return { data: null, error: movementResult.error };
    }

    reservedItems.push({
      inventory_item_id: inventoryItemId,
      previousReservedStock: reservedQuantity,
      previousReservedQuantity: reservedQuantity,
      previousAvailableQuantity: availableQuantity,
      quantity: requiredQty,
    });
    completedMovements.push({ inventory_item_id: inventoryItemId, quantity: requiredQty, id: movementResult.data?.[0]?.id });
  }

  return { data: reservedItems, error: null };
}

export async function releaseInventoryReservationsForOrder({ requirements = [], orderId = null, actorId = null }) {
  if (!requirements.length) {
    return { data: [], error: null };
  }

  const released = [];

  for (const requirement of requirements) {
    const { inventory_item_id: inventoryItemId, quantity_required: quantityRequired } = requirement;
    const itemResult = await fetchInventoryItemById(inventoryItemId);
    if (itemResult.error) return { data: null, error: itemResult.error };

    const item = itemResult.data;
    const reservedQuantity = Number(item.reserved_quantity ?? item.reserved_stock ?? 0);
    const nextReserved = Math.max(reservedQuantity - Number(quantityRequired || 0), 0);
    const stockQuantity = Number(item.stock_quantity ?? item.current_stock ?? 0);
    const nextAvailable = stockQuantity - nextReserved;

    const updateResult = await updateInventoryItem(inventoryItemId, {
      reserved_stock: nextReserved,
      reserved_quantity: nextReserved,
      available_quantity: nextAvailable,
    });
    if (updateResult.error) return { data: null, error: updateResult.error };

    const movementResult = await insertInventoryMovement({
      inventory_item_id: inventoryItemId,
      movement_type: 'reservation_release',
      quantity: Number(quantityRequired || 0),
      reference_type: 'order',
      reference_id: orderId,
      notes: `Released reservation for order ${orderId}`,
      created_by: actorId,
    });
    if (movementResult.error) return { data: null, error: movementResult.error };

    released.push({ inventory_item_id: inventoryItemId, quantity: Number(quantityRequired || 0) });
  }

  return { data: released, error: null };
}

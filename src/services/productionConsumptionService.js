import { fetchInventoryItemById, updateInventoryItem } from './inventoryService';
import {
  INVENTORY_MOVEMENT_TYPES,
  recordInventoryMovement,
} from './inventoryMovementService';
import supabase from '../lib/supabase';

export const CONSUMPTION_MOVEMENT_TYPES = {
  PRODUCTION_CONSUMPTION: INVENTORY_MOVEMENT_TYPES.PRODUCTION_CONSUMPTION,
  WASTAGE: 'wastage',
  DAMAGED: INVENTORY_MOVEMENT_TYPES.DAMAGED,
};

export async function validateProductionMaterials(requirements = [], { requireReservations = false } = {}) {
  const errors = [];
  const warnings = [];

  if (!requirements.length) {
    warnings.push('No BOM material requirements defined for this job.');
    return { valid: true, errors, warnings, message: '' };
  }

  for (const requirement of requirements) {
    const inventoryItemId = requirement.inventory_item_id;
    const requiredQty = Number(requirement.quantity_required || 0);
    if (!inventoryItemId || requiredQty <= 0) continue;

    const itemResult = await fetchInventoryItemById(inventoryItemId);
    if (itemResult.error) {
      errors.push(itemResult.error.message || `Unable to load inventory item ${inventoryItemId}.`);
      continue;
    }

    const item = itemResult.data;
    const reserved = Number(item.reserved_quantity ?? item.reserved_stock ?? 0);
    const stock = Number(item.stock_quantity ?? item.current_stock ?? 0);

    if (requireReservations && reserved < requiredQty) {
      errors.push(
        `Insufficient reserved stock for ${item.item_name || item.material_name}: need ${requiredQty}, reserved ${reserved}.`
      );
    }

    if (stock < requiredQty) {
      errors.push(
        `Insufficient on-hand stock for ${item.item_name || item.material_name}: need ${requiredQty}, on hand ${stock}.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    message: errors[0] || '',
  };
}

export async function createConsumptionLog({
  inventoryItemId,
  productionJobId,
  salesOrderId = null,
  quantity = 0,
  movementType = CONSUMPTION_MOVEMENT_TYPES.PRODUCTION_CONSUMPTION,
  stockBefore = 0,
  stockAfter = 0,
  actorId = null,
  notes = '',
}) {
  const movementResult = await recordInventoryMovement({
    inventoryItemId,
    movementType,
    quantity,
    referenceType: 'production_job',
    referenceId: productionJobId,
    notes: notes || `Production consumption for job ${productionJobId}`,
    actorId,
  });

  const logResult = await supabase.from('inventory_transaction_logs').insert([
    {
      inventory_item_id: inventoryItemId,
      transaction_type: movementType,
      quantity,
      stock_before: stockBefore,
      stock_after: stockAfter,
      notes,
      metadata: { production_job_id: productionJobId, sales_order_id: salesOrderId },
      created_by: actorId,
    },
  ]);

  return {
    movement: movementResult,
    log: logResult,
    error: movementResult.error || logResult.error || null,
  };
}

/**
 * Consume reserved materials: reduce stock and reserved quantities.
 */
export async function consumeReservedInventory({
  requirements = [],
  productionJobId,
  salesOrderId = null,
  actorId = null,
  movementType = CONSUMPTION_MOVEMENT_TYPES.PRODUCTION_CONSUMPTION,
}) {
  const validation = await validateProductionMaterials(requirements, { requireReservations: true });
  if (!validation.valid) {
    return { data: null, error: new Error(validation.message), errors: validation.errors };
  }

  const consumed = [];

  for (const requirement of requirements) {
    const inventoryItemId = requirement.inventory_item_id;
    const requiredQty = Number(requirement.quantity_required || 0);
    if (!inventoryItemId || requiredQty <= 0) continue;

    const itemResult = await fetchInventoryItemById(inventoryItemId);
    if (itemResult.error) {
      return { data: null, error: itemResult.error };
    }

    const item = itemResult.data;
    const stock = Number(item.stock_quantity ?? item.current_stock ?? 0);
    const reserved = Number(item.reserved_quantity ?? item.reserved_stock ?? 0);
    const nextStock = Math.max(stock - requiredQty, 0);
    const nextReserved = Math.max(reserved - requiredQty, 0);
    const nextAvailable = nextStock - nextReserved;

    const updateResult = await updateInventoryItem(inventoryItemId, {
      stock_quantity: nextStock,
      reserved_quantity: nextReserved,
      available_quantity: nextAvailable,
    });
    if (updateResult.error) return { data: null, error: updateResult.error };

    const logResult = await createConsumptionLog({
      inventoryItemId,
      productionJobId,
      salesOrderId,
      quantity: requiredQty,
      movementType,
      stockBefore: stock,
      stockAfter: nextStock,
      actorId,
      notes: `Consumed for production job ${productionJobId}`,
    });
    if (logResult.error) return { data: null, error: logResult.error };

    consumed.push({
      inventory_item_id: inventoryItemId,
      quantity: requiredQty,
      movement_type: movementType,
    });
  }

  return { data: consumed, error: null, warnings: validation.warnings };
}

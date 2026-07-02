// ============================================================
// inventoryService.js
// Inventory Master service — matches inventory_items schema
// Columns: id, item_name, material_name, material_code,
//          category, gsm, flute_type, current_stock,
//          cost_per_unit, minimum_stock, warehouse_location
// ============================================================

import supabase from '../lib/supabase';

// ─── Schema field list ────────────────────────────────────────
const ALLOWED = [
  'item_name', 'material_name', 'material_code', 'category',
  'gsm', 'flute_type', 'unit', 'current_stock',
  'minimum_stock', 'cost_per_unit', 'warehouse_location',
];

function sanitize(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([k]) => ALLOWED.includes(k))
  );
}

// Normalise rows so UI always has consistent field names
function normalise(item) {
  return {
    ...item,
    current_stock:  Number(item.current_stock  ?? 0),
    minimum_stock:  Number(item.minimum_stock  ?? 0),
    cost_per_unit:  Number(item.cost_per_unit  ?? 0),
    gsm:            item.gsm ? Number(item.gsm) : null,
    // convenience aliases kept for backward-compat with any existing consumers
    material_name:  item.material_name || item.item_name || '',
    item_name:      item.item_name     || item.material_name || '',
    isLowStock:     Number(item.current_stock ?? 0) <= Number(item.minimum_stock ?? 0),
  };
}

// ─── READ ─────────────────────────────────────────────────────

export async function fetchInventoryItems() {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('material_name', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map(normalise);
}

export async function fetchInventoryItemById(id) {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return normalise(data);
}

// ─── CREATE ──────────────────────────────────────────────────

export async function insertInventoryItem(payload) {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert([sanitize(payload)])
    .select()
    .single();

  if (error) {
    console.error('insertInventoryItem error:', error);
    throw new Error(error.message);
  }
  return normalise(data);
}

// ─── UPDATE ──────────────────────────────────────────────────

export async function updateInventoryItem(id, payload) {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(sanitize(payload))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('updateInventoryItem error:', error);
    throw new Error(error.message);
  }
  return normalise(data);
}

// ─── DELETE ──────────────────────────────────────────────────

export async function deleteInventoryItem(id) {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
}

// ─── ATOMIC RESERVATION ENGINE FOR TRANSACTION SPINE ───────────────────

/**
 * Consumes atomic BOM requirement payloads and commits reservations 
 * aligned strictly to the live polymorphic database schema.
 * @param {Object} params
 * @param {string} params.salesOrderId - UUID of the Sales Order.
 * @param {Array<Object>} params.requirements - Evaluated materials list.
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function reserveInventoryForSalesOrder({ salesOrderId, requirements = [] }) {
  if (!salesOrderId) {
    return { success: false, error: new Error("BoxIQ Inventory Allocation Fault: salesOrderId is required.") };
  }

  // Graceful Degradation Check: If array is empty (no BOM matched), exit clean without breaking the pipeline
  if (!requirements || requirements.length === 0) {
    console.log(`[BoxIQ Inventory System] No requirements specified for Sales Order: ${salesOrderId}. Bypassing reservation allocations.`);
    return { success: true, error: null };
  }

  try {
    // 1. Extract all unique SKUs required by the BOM payload
    const targetSkus = [...new Set(requirements.map(req => req.materialSku))];

    // 2. Fetch the authoritative UUIDs (item_id) from the live inventory_items table
    const { data: inventoryLookup, error: lookupError } = await supabase
      .from("inventory_items")
      .select("id, material_code")
      .in("material_code", targetSkus);

    if (lookupError) throw lookupError;

    // 3. Build a fast mapping dictionary: { "SKU-123": "uuid-v4-string" }
    const uuidDictionary = {};
    (inventoryLookup || []).forEach(item => {
      uuidDictionary[item.material_code] = item.id;
    });

    // 4. Transform payload to match exact physical schema reality (Polymorphic mapping)
    const serializedReservations = requirements.map((req) => {
      const liveItemId = uuidDictionary[req.materialSku];
      
      if (!liveItemId) {
        throw new Error(`BoxIQ Schema Integrity Fault: BOM SKU '${req.materialSku}' does not exist in inventory_items.`);
      }

      const rawQty = Number(req.quantityRequired) || 0;
      if (rawQty <= 0) {
        throw new Error(`BoxIQ Allocation Exception: Invalid quantity (${req.quantityRequired}) for SKU: ${req.materialSku}`);
      }

      return {
        item_id: liveItemId,          // Mapped from live UUID dictionary
        quantity: rawQty,             // Exact quantity needed
        reference_id: salesOrderId,   // Polymorphic association ID
        reference_type: 'SALES_ORDER',// Polymorphic association Domain
        status: 'Active'              // Default status
      };
    });

    // 5. Execute schema-compliant bulk insert
    const { error: insertError } = await supabase
      .from("inventory_reservations")
      .insert(serializedReservations);

    if (insertError) {
      console.error("BoxIQ Inventory Reservation Persistence Failure:", insertError.message);
      return { success: false, error: insertError };
    }

    console.log(`[BoxIQ Inventory System] Successfully committed ${serializedReservations.length} atomic allocations for Sales Order: ${salesOrderId}`);
    return { success: true, error: null };

  } catch (executionException) {
    console.error("BoxIQ Inventory Reservation Thread Exception:", executionException.message);
    return { success: false, error: executionException };
  }
}

// ─── CRITICAL LOOKUP CONSTANTS REQUIRED BY THE UI LAYER ─────────────────────

export const MATERIAL_TYPES = [
  'Kraft Liner',
  'Test Liner',
  'Fluting Medium',
  'Semi-Chemical Fluting',
  'Duplex Board',
  'White Top Liner',
  'Corrugated Sheet',
  'Adhesive / Starch',
  'Ink',
  'Die',
  'Strapping',
  'Other',
];

export const FLUTE_TYPES = [
  'A Flute',
  'B Flute',
  'C Flute',
  'E Flute',
  'F Flute',
  'BC Flute',
  'EB Flute',
  'N/A',
];

export const UNITS = [
  'kg',
  'MT',
  'sheets',
  'rolls',
  'litres',
  'pcs',
];
import supabase from "../lib/supabase";

/**
 * Creates a complete, version-controlled Bill of Materials from scratch.
 * Resolves the header, initial version record, and atomic item rows in sequence.
 * * @param {Object} params
 * @param {string} params.productName - Unique string mapping to quote.box_type or product identifiers.
 * @param {string} [params.description] - Optional textual description of the item layout.
 * @param {Array<Object>} [params.items] - Array of component materials.
 * @param {string} params.items[].materialSku - The inventory master ledger SKU code.
 * @param {number|string} params.items[].quantityPerUnit - The numeric requirement multiplier.
 * @param {string} params.items[].unitOfMeasure - Unit matching warehouse ledger tracking (kg, pcs, etc).
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createBOM({ productName, description = '', items = [] }) {
  if (!productName) {
    return { 
      data: null, 
      error: new Error("BoxIQ BOM Creation Error: productName parameter must be explicitly populated.") 
    };
  }

  // Step 1: Write the foundational header container row
  const { data: bomHeader, error: headerError } = await supabase
    .from("bill_of_materials")
    .insert([{ 
      product_name: productName, 
      description: description 
    }])
    .select()
    .single();

  if (headerError) {
    console.error("BoxIQ createBOM Header Insertion Exception:", headerError.message);
    return { data: null, error: headerError };
  }

  // Step 2: Establish Version 1 as the current, canonical active iteration
  const { data: bomVersion, error: versionError } = await supabase
    .from("bom_versions")
    .insert([{ 
      bom_id: bomHeader.id, 
      version_number: 1, 
      is_active: true 
    }])
    .select()
    .single();

  if (versionError) {
    console.error("BoxIQ createBOM Version Creation Exception:", versionError.message);
    return { data: null, error: versionError };
  }

  // Step 3: Populate structural ingredient requirements if present
  if (items && items.length > 0) {
    const serializedItems = items.map((item) => {
      const parsedQty = parseFloat(item.quantityPerUnit);
      if (isNaN(parsedQty) || parsedQty <= 0) {
        throw new Error(`BoxIQ Validation Exception: Material SKU ${item.materialSku} possesses an invalid quantity: ${item.quantityPerUnit}`);
      }
      
      return {
        version_id: bomVersion.id,
        material_sku: item.materialSku,
        quantity_per_unit: parsedQty,
        unit_of_measure: item.unitOfMeasure || "pcs"
      };
    });

    try {
      const { error: itemsError } = await supabase
        .from("bom_items")
        .insert(serializedItems);

      if (itemsError) {
        console.error("BoxIQ createBOM Bulk Items Exception:", itemsError.message);
        return { data: null, error: itemsError };
      }
    } catch (validationErr) {
      return { data: null, error: validationErr };
    }
  }

  return { 
    data: { 
      bomId: bomHeader.id, 
      versionId: bomVersion.id, 
      productName: bomHeader.product_name,
      itemCount: items.length
    }, 
    error: null 
  };
}

/**
 * Deep queries the live database to resolve the complete active component array for a product.
 * Formulates sequential lookups to navigate the version boundary.
 * * @param {string} productName - The key string utilized to perform lookup identification.
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function fetchBOMForProduct(productName) {
  if (!productName) {
    return { 
      data: null, 
      error: new Error("BoxIQ Fetch Error: Execution requires a non-empty productName argument.") 
    };
  }

  // Target the header record matching the structural layout string
  const { data: bomHeader, error: headerError } = await supabase
    .from("bill_of_materials")
    .select("id, product_name")
    .eq("product_name", productName)
    .maybeSingle();

  if (headerError) {
    console.error("BoxIQ fetchBOMForProduct Header Retrieval Failure:", headerError.message);
    return { data: null, error: headerError };
  }

  if (!bomHeader) {
    return { 
      data: null, 
      error: new Error(`BoxIQ Mapping Failure: No Bill of Materials record allocated for product identifier: "${productName}"`) 
    };
  }

  // Target the isolated version marked as active for that specific header id
  const { data: activeVersion, error: versionError } = await supabase
    .from("bom_versions")
    .select("id, version_number")
    .eq("bom_id", bomHeader.id)
    .eq("is_active", true)
    .maybeSingle();

  if (versionError) {
    console.error("BoxIQ fetchBOMForProduct Active Version Resolving Failure:", versionError.message);
    return { data: null, error: versionError };
  }

  if (!activeVersion) {
    return { 
      data: null, 
      error: new Error(`BoxIQ Constraint Failure: Bill of Materials header found for "${productName}", but an active version assignment is missing.`) 
    };
  }

  // Retrieve every atomic material ingredient mapping record linked to that active version
  const { data: componentItems, error: itemsError } = await supabase
    .from("bom_items")
    .select("material_sku, quantity_per_unit, unit_of_measure")
    .eq("version_id", activeVersion.id);

  if (itemsError) {
    console.error("BoxIQ fetchBOMForProduct Item Detail Materialization Failure:", itemsError.message);
    return { data: null, error: itemsError };
  }

  // Build uniform payload shape optimized precisely for inventory calculation consumption
  const normalizedBOMOutput = {
    bom_id: bomHeader.id,
    version_id: activeVersion.id,
    version_number: activeVersion.version_number,
    product_name: bomHeader.product_name,
    items: componentItems || []
  };

  return { data: normalizedBOMOutput, error: null };
}

/**
 * Calculates raw component consumption volumes across complete production run quantities.
 * Executes exact floating-point rounding adjustments to guard baseline ledger balances.
 * * @param {Object} bomData - The normalized return payload structural wrapper generated by fetchBOMForProduct.
 * @param {number|string} totalQuantity - Total production target output quantity.
 * @returns {Array<Object>} Linear collection array populated with requirements calculation shapes.
 */
export function calculateMaterialRequirements(bomData, totalQuantity) {
  const runtimeVolume = Number(totalQuantity);
  
  if (!bomData || !Array.isArray(bomData.items) || isNaN(runtimeVolume) || runtimeVolume <= 0) {
    return [];
  }

  const generatedRequirementsList = bomData.items.map((component) => {
    const rawMultiplier = Number(component.quantity_per_unit) || 0;
    const computedAbsoluteVolume = rawMultiplier * runtimeVolume;
    
    return {
      materialSku: component.material_sku,
      quantityRequired: parseFloat(computedAbsoluteVolume.toFixed(4)), // Anchor precision calculation limits to 4 decimal places
      unitOfMeasure: component.unit_of_measure || "pcs"
    };
  });

  return generatedRequirementsList;
}
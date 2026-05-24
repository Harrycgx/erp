export function calculateSurfaceArea({ length, width, height }) {
  const l = Number(length) || 0;
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  return 2 * ((l * w) + (w * h) + (l * h)) / 1_000_000;
}

export function calculateMaterialCost({ surfaceArea, gsm, quantity, materialRate }) {
  const weightPerSheetKg = surfaceArea * (Number(gsm) || 0) / 1000;
  return weightPerSheetKg * (Number(materialRate) || 0) * (Number(quantity) || 0);
}

export function calculatePrintCost({ printingType, quantity, printRate }) {
  const colorFactor = printingType === 'Full color' ? 1.8 : printingType === 'Spot color' ? 1.2 : 1;
  return (Number(quantity) || 0) * (Number(printRate) || 0) * colorFactor;
}

export function calculateLaminationCost({ lamination, surfaceArea, quantity, laminationRate }) {
  if (!lamination || lamination === 'None') return 0;
  return surfaceArea * (Number(quantity) || 0) * (Number(laminationRate) || 0);
}

export function calculateToolingCost({ toolingCost, toolingRate }) {
  if (toolingCost) return Number(toolingCost) || 0;
  return Number(toolingRate) || 0;
}

export function calculateLaborCost({ quantity, laborRate }) {
  return (Number(quantity) || 0) * (Number(laborRate) || 0);
}

export function calculateWastageCost({ materialCost }) {
  return (Number(materialCost) || 0) * 0.08;
}

export function calculateRushCharge({ urgency, quantity, rushCharge }) {
  if (urgency !== 'Rush') return 0;
  return (Number(quantity) || 0) * (Number(rushCharge) || 0);
}

export function calculateGST({ subtotal, gstRate }) {
  return (Number(subtotal) || 0) * (Number(gstRate) || 0);
}

export function calculateQuotePricing(quote, pricingRule) {
  const surfaceArea = calculateSurfaceArea(quote);
  const materialCost = calculateMaterialCost({
    surfaceArea,
    gsm: quote.gsm,
    quantity: quote.quantity,
    materialRate: pricingRule.material_rate,
  });
  const printCost = calculatePrintCost({
    printingType: quote.printing_type,
    quantity: quote.quantity,
    printRate: pricingRule.print_rate,
  });
  const laminationCost = calculateLaminationCost({
    lamination: quote.lamination,
    surfaceArea,
    quantity: quote.quantity,
    laminationRate: pricingRule.lamination_rate,
  });
  const toolingCost = calculateToolingCost({
    toolingCost: quote.tooling_cost,
    toolingRate: pricingRule.tooling_rate,
  });
  const laborCost = calculateLaborCost({
    quantity: quote.quantity,
    laborRate: pricingRule.labor_rate,
  });
  const wastageCost = calculateWastageCost({ materialCost });
  const rushCharge = calculateRushCharge({
    urgency: quote.urgency,
    quantity: quote.quantity,
    rushCharge: pricingRule.rush_charge,
  });
  const subtotal = materialCost + printCost + laminationCost + toolingCost + laborCost + wastageCost + rushCharge;
  const gst = calculateGST({ subtotal, gstRate: pricingRule.gst_rate });
  const total = subtotal + gst;

  return {
    surfaceArea,
    materialCost,
    printCost,
    laminationCost,
    toolingCost,
    laborCost,
    wastageCost,
    rushCharge,
    subtotal,
    gst,
    total,
  };
}

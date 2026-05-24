export function calculatePoTotals({ quantity = 0, unitPrice = 0, gstRate = 0.18 }) {
  const subtotal = Number(quantity || 0) * Number(unitPrice || 0);
  const gstAmount = subtotal * Number(gstRate || 0);
  return {
    subtotal,
    gstAmount,
    totalAmount: subtotal + gstAmount,
  };
}

export function calculateReorderQuantity({ currentStock = 0, minimumStock = 0, dailyUsage = 0, leadDays = 7 }) {
  const safetyBuffer = Number(minimumStock || 0) - Number(currentStock || 0);
  const demandBuffer = Number(dailyUsage || 0) * Number(leadDays || 7);
  return Math.max(0, safetyBuffer + demandBuffer);
}

export function formatUnitValue(value = 0, unit = 'pcs') {
  if (value === null || value === undefined) return `0 ${unit}`;
  return `${Number(value).toLocaleString('en-IN')} ${unit}`;
}

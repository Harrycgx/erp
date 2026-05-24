export function estimateMaterialUsage(order = {}) {
  const quantity = Number(order.quantity || 0);
  const gsm = Number(order.gsm || 140);
  const area = Number(order.board_area || 1);

  const baseUsage = Math.max(1, area) * Math.max(1, quantity);
  const paperUsage = Math.round((baseUsage * gsm) / 1000 + quantity * 0.15);
  const wastage = Math.round(paperUsage * 0.08);
  const boardRequirement = Math.round(baseUsage * 1.05);
  const printingInk = Math.max(0, Math.round(quantity * 0.12));
  const lamination = Math.max(0, Math.round(baseUsage * 0.04));

  return {
    estimatedOutput: quantity,
    paperUsage,
    wastage,
    boardRequirement,
    printingInk,
    lamination,
  };
}

export function getProductionStatusLabel(status) {
  if (!status) return 'Planned';
  return status;
}

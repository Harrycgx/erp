export function calculateVendorScore(purchaseOrders = [], goodsReceipts = []) {
  if (!purchaseOrders.length) return 0;

  const completed = purchaseOrders.filter((po) => po.po_status === 'Completed').length;
  const approved = purchaseOrders.filter((po) => po.po_status === 'Approved').length;
  const delayed = purchaseOrders.filter((po) => po.po_status === 'Delayed').length;
  const cancelled = purchaseOrders.filter((po) => po.po_status === 'Cancelled').length;

  const acceptanceRate = goodsReceipts.length
    ? Math.max(0, 100 - (goodsReceipts.reduce((sum, receipt) => sum + Number(receipt.damaged_quantity || 0), 0) / goodsReceipts.reduce((sum, receipt) => sum + Number(receipt.received_quantity || 0), 0)) * 100)
    : 100;

  const onTimeShare = purchaseOrders.length ? Math.max(0, (completed + approved - delayed) / purchaseOrders.length) : 0;
  const rawScore = onTimeShare * 100 * 0.7 + acceptanceRate * 0.3 - cancelled * 5;

  return Math.min(100, Math.max(0, Math.round(rawScore)));
}

export function getPerformanceLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 65) return 'Reliable';
  if (score >= 45) return 'Watch';
  return 'Risk';
}

export function getDeliveryDelayRate(purchaseOrders = []) {
  if (!purchaseOrders.length) return 0;
  const delayed = purchaseOrders.filter((po) => po.po_status === 'Delayed').length;
  return Math.round((delayed / purchaseOrders.length) * 100);
}

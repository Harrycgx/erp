export function getStockStatus(item) {
  if (!item) return 'Unknown';
  if (item.current_stock <= 0) return 'Out of stock';
  if (item.current_stock <= item.minimum_stock) return 'Low stock';
  return 'In stock';
}

export function isLowStock(item) {
  return item?.current_stock <= item?.minimum_stock;
}

export function buildMaterialLabel(item) {
  if (!item) return 'Material';
  return `${item.material_name} · ${item.gsm || 'N/A'} GSM`;
}

export function formatUnit(quantity, unit) {
  return `${quantity || 0} ${unit || 'units'}`;
}

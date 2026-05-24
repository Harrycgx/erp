export function calculateWastageValue(item) {
  if (!item) return 0;
  const percent = Number(item.wastage_percentage || 0);
  const stock = Number(item.current_stock || 0);
  return Math.round((stock * percent) / 100);
}

export function getInventoryHealth(item) {
  if (!item) return 'Unknown';
  if (item.current_stock <= 0) return 'Critical';
  if (item.current_stock <= item.minimum_stock) return 'Warning';
  return 'Healthy';
}

export function formatStockMovement(movement) {
  if (!movement) return 'N/A';
  const typeLabel = movement.movement_type || 'IN';
  return `${typeLabel.toUpperCase()} • ${movement.quantity || 0}`;
}

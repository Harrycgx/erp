export function calculatePricing({ quantity = 0, unitPrice = 0, markup = 0 }) {
  const base = quantity * unitPrice;
  const margin = base * markup;
  return {
    base,
    markup: margin,
    total: base + margin,
  };
}

export function groupBy(items = [], key) {
  return items.reduce((acc, item) => {
    const value = item?.[key] || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export function sumBy(items = [], key) {
  return items.reduce((sum, item) => sum + Number(item?.[key] || 0), 0);
}

export function topBy(items = [], key, count = 5) {
  const grouped = items.reduce((acc, item) => {
    const value = item?.[key] || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([name, value]) => ({ name, value }));
}

export function average(items = [], key) {
  if (!items.length) return 0;
  return items.reduce((sum, item) => sum + Number(item?.[key] || 0), 0) / items.length;
}

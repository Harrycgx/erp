/**
 * Excel Boundary Service
 * Stub for controlled Excel import/export.
 * In production, replace with a proper library like xlsx.
 */

/**
 * Export data to CSV (as Excel blob)
 * @param {Array} data - array of objects
 * @returns {Blob|null} CSV blob or null if no data
 */
export function exportToExcel(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  // Extract headers from first object
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));
  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
      // Escape quotes and commas
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  return blob;
}

/**
 * Import from CSV file
 * @param {File} file
 * @returns {Promise<Array<Object>>} Parsed rows
 */
export function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
          resolve([]);
          return;
        }
        const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
        const result = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // Simple CSV split (does not handle quoted commas)
          const values = line.split(',').map(v => v.replace(/^"|"$/g, ''));
          const obj = {};
          headers.forEach((h, idx) => {
            obj[h] = values[idx] !== undefined ? values[idx] : null;
          });
          result.push(obj);
        }
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Validate imported data (stub)
 * @param {Array} data
 * @returns {boolean}
 */
export function validateImport(data) {
  return Array.isArray(data) && data.length > 0;
}

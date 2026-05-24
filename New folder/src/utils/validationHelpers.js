export function validateQuotationInput(data) {
  if (!data.customer_id) return 'Customer is required.';
  if (!data.box_type) return 'Box type is required.';
  if (!data.length || Number(data.length) <= 0) return 'Length must be greater than 0.';
  if (!data.width || Number(data.width) <= 0) return 'Width must be greater than 0.';
  if (!data.height || Number(data.height) <= 0) return 'Height must be greater than 0.';
  if (!data.quantity || Number(data.quantity) <= 0) return 'Quantity must be greater than 0.';
  if (!data.flute_type) return 'Flute type is required.';
  if (!data.ply) return 'Ply selection is required.';
  if (!data.gsm) return 'GSM is required.';
  if (!data.printing_type) return 'Printing type is required.';
  if (!data.urgency) return 'Urgency selection is required.';
  return '';
}

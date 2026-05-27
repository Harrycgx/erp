export function validateQuotation(
  data
) {
  const errors = {};

  if (
    !data.customer_name
  ) {
    errors.customer_name =
      "Customer name required";
  }

  if (
    !data.quantity ||
    Number(data.quantity) <= 0
  ) {
    errors.quantity =
      "Quantity must be greater than 0";
  }

  return errors;
}
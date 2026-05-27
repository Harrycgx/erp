import jsPDF from "jspdf";

export function generateQuotationPDF(
  quotation
) {
  const doc =
    new jsPDF();

  doc.setFontSize(22);

  doc.text(
    "BOXIQ QUOTATION",
    20,
    20
  );

  doc.setFontSize(12);

  doc.text(
    `Quotation No: ${quotation.quotation_number}`,
    20,
    40
  );

  doc.text(
    `Customer: ${quotation.customer_name}`,
    20,
    50
  );

  doc.text(
    `Quantity: ${quotation.quantity}`,
    20,
    60
  );

  doc.text(
    `Box Style: ${quotation.box_style}`,
    20,
    70
  );

  doc.text(
    `Print Type: ${quotation.print_type}`,
    20,
    80
  );

  doc.text(
    `Estimated Price: ₹${quotation.estimated_price}`,
    20,
    90
  );

  doc.text(
    `Status: ${quotation.status}`,
    20,
    100
  );

  doc.save(
    `${quotation.quotation_number}.pdf`
  );
}
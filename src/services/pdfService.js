import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import supabase from '../lib/supabase';
import { buildDocumentFilename, formatCurrency, formatDate, getValidityDate } from '../utils/pdfHelpers';

export async function generateQuotePDF(quote, customer) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const timesRomanFont = await doc.embedFont(StandardFonts.Helvetica);
  const titleFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const lineHeight = 18;
  const margin = 50;
  let y = 780;

  page.drawText('MAYUR PACKAGING', {
    x: margin,
    y,
    size: 20,
    font: titleFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText('Professional corrugated packaging quotations', {
    x: margin,
    y: y - 24,
    size: 10,
    font: timesRomanFont,
    color: rgb(0.25, 0.25, 0.25),
  });
  page.drawText(`Quote number: ${buildDocumentFilename(quote).replace('.pdf', '')}`, {
    x: margin,
    y: y - 48,
    size: 10,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  const companyX = margin;
  const customerX = 320;
  const sectionY = y - 90;

  page.drawText('Mayur Packaging', { x: companyX, y: sectionY, size: 12, font: titleFont, color: rgb(0, 0, 0) });
  page.drawText('7B Industrial Park, Mumbai', { x: companyX, y: sectionY - lineHeight, size: 9, font: timesRomanFont, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('contact@mayurpackaging.com', { x: companyX, y: sectionY - 2 * lineHeight, size: 9, font: timesRomanFont, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('+91 22 1234 5678', { x: companyX, y: sectionY - 3 * lineHeight, size: 9, font: timesRomanFont, color: rgb(0.1, 0.1, 0.1) });

  page.drawText('Customer', { x: customerX, y: sectionY, size: 12, font: titleFont, color: rgb(0, 0, 0) });
  page.drawText(customer?.company_name || 'N/A', { x: customerX, y: sectionY - lineHeight, size: 9, font: timesRomanFont, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(customer?.full_name || '', { x: customerX, y: sectionY - 2 * lineHeight, size: 9, font: timesRomanFont, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(customer?.email || 'info@example.com', { x: customerX, y: sectionY - 3 * lineHeight, size: 9, font: timesRomanFont, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(customer?.phone || '+91 99999 99999', { x: customerX, y: sectionY - 4 * lineHeight, size: 9, font: timesRomanFont, color: rgb(0.1, 0.1, 0.1) });

  const detailStart = sectionY - 120;
  page.drawText('Specification', { x: margin, y: detailStart, size: 11, font: titleFont, color: rgb(0, 0, 0) });
  const detailLines = [
    `Box type: ${quote.box_type || 'Corrugated'}`,
    `Dimensions: ${quote.length || 0} × ${quote.width || 0} × ${quote.height || 0} mm`,
    `Quantity: ${quote.quantity || 0}`,
    `Flute: ${quote.flute_type || 'Standard'}`,
    `Ply: ${quote.ply || 'N/A'}`,
    `GSM: ${quote.gsm || 'N/A'}`,
    `Printing: ${quote.printing_type || 'None'}`,
    `Lamination: ${quote.lamination || 'None'}`,
    `Urgency: ${quote.urgency || 'Standard'}`,
  ];

  detailLines.forEach((line, index) => {
    page.drawText(line, {
      x: margin,
      y: detailStart - (index + 1) * lineHeight,
      size: 9,
      font: timesRomanFont,
      color: rgb(0.1, 0.1, 0.1),
    });
  });

  const pricingY = detailStart - (detailLines.length + 2) * lineHeight;
  page.drawText('Pricing', { x: margin, y: pricingY, size: 11, font: titleFont, color: rgb(0, 0, 0) });
  const pricingLines = [
    `Subtotal: ${formatCurrency(quote.subtotal || 0)}`,
    `GST: ${formatCurrency(quote.gst || 0)}`,
    `Total: ${formatCurrency(quote.total || 0)}`,
  ];
  pricingLines.forEach((line, index) => {
    page.drawText(line, {
      x: margin,
      y: pricingY - (index + 1) * lineHeight,
      size: 9,
      font: timesRomanFont,
      color: rgb(0.1, 0.1, 0.1),
    });
  });

  page.drawText('Validity', { x: margin, y: pricingY - 4 * lineHeight, size: 11, font: titleFont, color: rgb(0, 0, 0) });
  page.drawText(`Valid until: ${getValidityDate(quote.created_at, 15)}`, {
    x: margin,
    y: pricingY - 5 * lineHeight,
    size: 9,
    font: timesRomanFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText(`Created: ${formatDate(quote.created_at)}`, {
    x: margin,
    y: pricingY - 6 * lineHeight,
    size: 9,
    font: timesRomanFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  const termsY = pricingY - 8 * lineHeight;
  page.drawText('Terms & conditions', { x: margin, y: termsY, size: 11, font: titleFont, color: rgb(0, 0, 0) });
  page.drawText(
    quote.terms || 'All quotations are valid for 15 days from the issue date. Delivery schedules depend on material availability and factory capacity. 50% advance payment required on order confirmation.',
    {
      x: margin,
      y: termsY - lineHeight,
      size: 8,
      font: timesRomanFont,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: 500,
      lineHeight: 12,
    }
  );

  page.drawText('Authorized signature', { x: margin, y: 90, size: 9, font: timesRomanFont, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('Mayur Packaging', { x: margin, y: 70, size: 10, font: titleFont, color: rgb(0, 0, 0) });

  const pdfBytes = await doc.save();
  return pdfBytes;
}

export async function downloadQuotePDF(quote, customer) {
  const pdfBytes = await generateQuotePDF(quote, customer);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildDocumentFilename(quote);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function saveQuoteDocument(quotationId, quote, customer, version = 1) {
  const pdfBytes = await generateQuotePDF(quote, customer);
  const fileName = `quotation-${quotationId}-v${version}.pdf`;
  let publicUrl = '';

  try {
    const fileBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('quotation_documents')
      .upload(fileName, fileBlob, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData, error: urlError } = await supabase.storage
      .from('quotation_documents')
      .getPublicUrl(uploadData.path);

    if (urlError) {
      throw urlError;
    }

    publicUrl = urlData.publicUrl;
  } catch (error) {
    console.warn('Unable to save file to storage:', error?.message || error);
  }

  return supabase.from('quotation_documents').insert([
    {
      quotation_id: quotationId,
      pdf_url: publicUrl || null,
      version,
      created_at: new Date().toISOString(),
    },
  ]);
}

export function fetchQuoteDocuments(quotationId) {
  return supabase.from('quotation_documents').select('*').eq('quotation_id', quotationId).order('version', { ascending: false });
}

export async function generateInvoicePDF(invoice, customer = {}) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const margin = 50;
  let y = 780;
  const lineHeight = 16;

  const draw = (text, opts = {}) => {
    page.drawText(String(text), {
      x: opts.x ?? margin,
      y,
      size: opts.size ?? 10,
      font: opts.bold ? boldFont : bodyFont,
      color: opts.color ?? rgb(0.1, 0.1, 0.1),
    });
    y -= opts.gap ?? lineHeight;
  };

  draw('MAYUR PACKAGING', { size: 18, bold: true, gap: 22 });
  draw('Tax invoice', { size: 11, bold: true, gap: 20 });
  draw(`Invoice: ${invoice.invoice_number || 'INV'}`, { bold: true });
  draw(`Date: ${formatDate(invoice.invoice_date || invoice.issue_date)}`);
  draw(`Due: ${formatDate(invoice.due_date)}`);
  y -= 8;

  draw('Bill to', { bold: true, gap: 14 });
  draw(customer.company_name || customer.full_name || 'Customer');
  if (customer.email) draw(customer.email);
  if (customer.phone) draw(customer.phone);
  y -= 8;

  if (invoice.sales_order?.sales_order_number || invoice.metadata?.sales_order_number) {
    draw(`Sales order: ${invoice.sales_order?.sales_order_number || invoice.metadata?.sales_order_number}`);
  }

  draw('Items', { bold: true, gap: 14 });
  const items = invoice.items?.length
    ? invoice.items
    : [{ item_name: 'Packaging supply', quantity: 1, unit_price: invoice.subtotal, total_price: invoice.total_amount }];

  items.slice(0, 12).forEach((item) => {
    draw(
      `${item.item_name} · Qty ${item.quantity} × ${formatCurrency(item.unit_price)} = ${formatCurrency(item.total_price)}`
    );
  });

  y -= 8;
  draw('Summary', { bold: true, gap: 14 });
  draw(`Subtotal: ${formatCurrency(invoice.subtotal)}`);
  draw(`Discount: ${formatCurrency(invoice.discount_amount || 0)}`);
  draw(`GST: ${formatCurrency(invoice.gst_amount || invoice.tax_amount)}`);
  draw(`Total: ${formatCurrency(invoice.total_amount || invoice.total)}`, { bold: true });
  draw(`Paid: ${formatCurrency(invoice.paid_amount || 0)}`);
  draw(`Due: ${formatCurrency(invoice.due_amount ?? (invoice.total_amount - (invoice.paid_amount || 0)))}`, { bold: true });

  y -= 12;
  draw('Payment terms: Due by date shown above. GST as applicable.', { size: 8, gap: 12 });
  draw('Authorized signatory — Mayur Packaging', { size: 9 });

  return doc.save();
}

export async function downloadInvoicePDF(invoice, customer) {
  const pdfBytes = await generateInvoicePDF(invoice, customer);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.invoice_number || 'invoice'}-Mayur-Packaging.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

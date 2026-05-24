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

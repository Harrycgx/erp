// ============================================================
// pricingEngine.js
// Automatic pricing calculator for corrugated packaging
// All dimensions in mm, weights in gsm, costs in INR
// ============================================================

const PAPER_COST_PER_KG = {
  100: 28, 120: 30, 150: 34, 175: 37,
  200: 40, 225: 43, 250: 46, 300: 52,
};

const PLY_LAYERS = { "2 Ply": 2, "3 Ply": 3, "5 Ply": 5, "7 Ply": 7 };

const FLUTE_THICKNESS_MM = {
  "A Flute": 4.8, "B Flute": 3.0, "C Flute": 3.6,
  "E Flute": 1.6, "F Flute": 0.8, "BC Flute": 6.0, "EB Flute": 4.6,
};

const FLUTE_TAKEUP = {
  "A Flute": 1.52, "B Flute": 1.32, "C Flute": 1.45,
  "E Flute": 1.26, "F Flute": 1.22, "BC Flute": 1.38, "EB Flute": 1.30,
};

const PRINTING_COST_PER_COLOR_PER_SQM = {
  None: 0, "Flexo Printing": 1.8, "Offset Printing": 3.2,
  "Digital Printing": 5.5, "Screen Printing": 2.4,
};

const LABOUR_COST_PER_PLY_PER_BOX = {
  "2 Ply": 0.8, "3 Ply": 1.2, "5 Ply": 2.0, "7 Ply": 2.8,
};

const DIE_CUT_SURCHARGE = {
  "Regular Slotted Container (RSC)": 0, "Half Slotted Container (HSC)": 0.5,
  "Full Overlap Container (FOL)": 0.8, "Die Cut Box": 2.5,
  "Tray": 1.8, "Telescope Box": 1.5, Custom: 3.0,
};

const DEFAULT_GST_PERCENT = 18;
const DEFAULT_MARGIN_PERCENT = 15;
const WASTE_FACTOR = 1.08;

function getPaperCostPerKg(gsm) {
  const tiers = Object.keys(PAPER_COST_PER_KG).map(Number).sort((a, b) => a - b);
  for (const tier of tiers) { if (gsm <= tier) return PAPER_COST_PER_KG[tier]; }
  return PAPER_COST_PER_KG[300];
}

function calculateBlankSize(length, width, height, fluteType) {
  const blankLength = 2 * (length + width) + 40;
  const blankWidth = 2 * (height + width / 2) + 20;
  return { blankLengthMm: blankLength, blankWidthMm: blankWidth };
}

export function calculatePricing(params) {
  const {
    length = 0, width = 0, height = 0,
    ply_type = "3 Ply", flute_type = "B Flute", paper_gsm = 150,
    box_type = "Regular Slotted Container (RSC)", printing_type = "None",
    printing_colors = 0, quantity = 0,
    margin_percent = DEFAULT_MARGIN_PERCENT, gst_percent = DEFAULT_GST_PERCENT,
  } = params;

  if (!length || !width || !height || !quantity) {
    return getZeroPricing(margin_percent, gst_percent);
  }

  const { blankLengthMm, blankWidthMm } = calculateBlankSize(length, width, height, flute_type);
  const boardAreaSqm = (blankLengthMm / 1000) * (blankWidthMm / 1000);

  const layers = PLY_LAYERS[ply_type] || 3;
  const takeup = FLUTE_TAKEUP[flute_type] || 1.32;
  const numLiners = Math.ceil(layers / 2) + 1;
  const numFlutes = Math.floor(layers / 2);
  const paperConsumptionKgPerBox =
    ((boardAreaSqm * numLiners * paper_gsm) / 1000 +
      (boardAreaSqm * numFlutes * paper_gsm * takeup) / 1000) * WASTE_FACTOR;

  const paperCostPerKg = getPaperCostPerKg(paper_gsm);
  const materialCostPerBox = paperConsumptionKgPerBox * paperCostPerKg;

  const printingRate = PRINTING_COST_PER_COLOR_PER_SQM[printing_type] || 0;
  const colors = printing_type === "None" ? 0 : Math.max(1, printing_colors);
  const printingCostPerBox = boardAreaSqm * printingRate * colors;

  const labourCostPerBox = (LABOUR_COST_PER_PLY_PER_BOX[ply_type] || 1.2) + (DIE_CUT_SURCHARGE[box_type] || 0);
  const rawCostPerBox = materialCostPerBox + printingCostPerBox + labourCostPerBox;

  const marginDecimal = margin_percent / 100;
  const unitPriceBeforeGst = rawCostPerBox / (1 - marginDecimal);
  const marginAmountPerBox = unitPriceBeforeGst - rawCostPerBox;

  const subtotal = unitPriceBeforeGst * quantity;
  const gstDecimal = gst_percent / 100;
  const gstAmount = subtotal * gstDecimal;
  const finalPrice = subtotal + gstAmount;

  return {
    board_area_sqm: round4(boardAreaSqm),
    paper_consumption: round4(paperConsumptionKgPerBox),
    material_cost: round2(materialCostPerBox * quantity),
    printing_cost: round2(printingCostPerBox * quantity),
    labour_cost: round2(labourCostPerBox * quantity),
    margin_percent: round2(margin_percent),
    margin_amount: round2(marginAmountPerBox * quantity),
    subtotal: round2(subtotal),
    gst_percent: round2(gst_percent),
    gst_amount: round2(gstAmount),
    final_price: round2(finalPrice),
    unit_price: round4(unitPriceBeforeGst),
    estimated_price: round2(finalPrice),
    total: round2(finalPrice), // alias used by Quotations.jsx
    blank_length_mm: round2(blankLengthMm),
    blank_width_mm: round2(blankWidthMm),
  };
}

// Alias for Quotations.jsx which imports calcPricing
export const calcPricing = calculatePricing;

function getZeroPricing(margin_percent, gst_percent) {
  return {
    board_area_sqm: 0, paper_consumption: 0, material_cost: 0,
    printing_cost: 0, labour_cost: 0,
    margin_percent: margin_percent || DEFAULT_MARGIN_PERCENT,
    margin_amount: 0, subtotal: 0,
    gst_percent: gst_percent || DEFAULT_GST_PERCENT,
    gst_amount: 0, final_price: 0, unit_price: 0,
    estimated_price: 0, total: 0,
    blank_length_mm: 0, blank_width_mm: 0,
  };
}

function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
function round4(n) { return Math.round((n + Number.EPSILON) * 10000) / 10000; }

export function formatINR(amount) {
  if (!amount && amount !== 0) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount);
}

export const GSM_OPTIONS = [100, 120, 150, 175, 200, 225, 250, 300];
export const BOX_TYPES = [
  "Regular Slotted Container (RSC)", "Half Slotted Container (HSC)",
  "Full Overlap Container (FOL)", "Die Cut Box", "Tray", "Telescope Box", "Custom",
];
export const PLY_TYPES = ["2 Ply", "3 Ply", "5 Ply", "7 Ply"];
export const FLUTE_TYPES = ["A Flute", "B Flute", "C Flute", "E Flute", "F Flute", "BC Flute", "EB Flute"];
export const PRINTING_TYPES = ["None", "Flexo Printing", "Offset Printing", "Digital Printing", "Screen Printing"];
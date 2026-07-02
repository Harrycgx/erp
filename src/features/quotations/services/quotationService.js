// ============================================================
// quotationService.js
// Complete service layer for the Quotations module
// ============================================================

import supabase from "../../../lib/supabase";

// ─── Fields that exist in the quotations table ───────────────
// Strips computed/display-only fields from pricingEngine before insert/update
const ALLOWED_FIELDS = [
  // FK relationships
  "customer_id", "product_id", "artwork_id",
  "customer_name", "contact_person", "phone", "email", "gst_number",
  "box_type", "length", "width", "height", "ply_type", "flute_type",
  "paper_gsm", "printing_type", "printing_colors", "quantity", "remarks",
  "margin_percent", "gst_percent",
  // Pricing outputs that ARE stored
  "material_cost", "printing_cost", "labour_cost",
  "margin_amount", "subtotal", "gst_amount",
  "final_price", "unit_price", "estimated_price",
  // Workflow
  "status", "quotation_number", "converted_to_order",
];

function sanitize(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
}

// ─── FETCH ───────────────────────────────────────────────────

export async function fetchQuotations() {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchQuotations error:", error);
    throw new Error(error.message);
  }
  return data || [];
}

export async function fetchQuotationById(id) {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("fetchQuotationById error:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function fetchQuotationsByStatus(status) {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchQuotationsByStatus error:", error);
    throw new Error(error.message);
  }
  return data || [];
}

// ─── CREATE ──────────────────────────────────────────────────

export async function createQuotation(quotation) {
  const payload = {
    ...sanitize(quotation),
    status: "Draft",
    quotation_number: "",
    converted_to_order: false,
  };

  const { data, error } = await supabase
    .from("quotations")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("SUPABASE ERROR: ", error);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR DETAILS:", error.details);
    console.error("ERROR HINT:", error.hint);
    throw new Error(error.message);
  }
  return data;
}

// ─── UPDATE ──────────────────────────────────────────────────

export async function updateQuotation(id, updates) {
  const existing = await fetchQuotationById(id);
  if (!existing) throw new Error("Quotation not found.");
  if (["Approved", "Cancelled"].includes(existing.status)) {
    throw new Error(`Cannot edit a quotation with status "${existing.status}".`);
  }

  const { data, error } = await supabase
    .from("quotations")
    .update(sanitize(updates))
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateQuotation error:", error);
    throw new Error(error.message);
  }
  return data;
}

// ─── DELETE ──────────────────────────────────────────────────

export async function deleteQuotation(id) {
  const existing = await fetchQuotationById(id);
  if (!existing) throw new Error("Quotation not found.");
  if (existing.status !== "Draft") {
    throw new Error("Only Draft quotations can be deleted.");
  }

  const { error } = await supabase.from("quotations").delete().eq("id", id);

  if (error) {
    console.error("deleteQuotation error:", error);
    throw new Error(error.message);
  }
  return true;
}

// ─── WORKFLOW TRANSITIONS ────────────────────────────────────

export async function submitQuotation(id) {
  const existing = await fetchQuotationById(id);
  if (!existing) throw new Error("Quotation not found.");
  if (existing.status !== "Draft") {
    throw new Error("Only Draft quotations can be submitted.");
  }

  const { data, error } = await supabase
    .from("quotations")
    .update({ status: "Submitted", submitted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function approveQuotation(id, approvedBy = "System") {
  const existing = await fetchQuotationById(id);
  if (!existing) throw new Error("Quotation not found.");
  if (existing.status !== "Submitted") {
    throw new Error("Only Submitted quotations can be approved.");
  }

  const { data, error } = await supabase
    .from("quotations")
    .update({
      status: "Approved",
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function rejectQuotation(id, reason = "") {
  const existing = await fetchQuotationById(id);
  if (!existing) throw new Error("Quotation not found.");
  if (existing.status !== "Submitted") {
    throw new Error("Only Submitted quotations can be rejected.");
  }

  const { data, error } = await supabase
    .from("quotations")
    .update({
      status: "Rejected",
      rejected_reason: reason,
      rejected_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function cancelQuotation(id) {
  const existing = await fetchQuotationById(id);
  if (!existing) throw new Error("Quotation not found.");
  if (!["Draft", "Submitted"].includes(existing.status)) {
    throw new Error("Only Draft or Submitted quotations can be cancelled.");
  }

  const { data, error } = await supabase
    .from("quotations")
    .update({ status: "Cancelled" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── ORDER + PRODUCTION JOB CONVERSION ───────────────────────

export async function convertToOrder(quotationId) {
  const quotation = await fetchQuotationById(quotationId);

  if (!quotation) throw new Error("Quotation not found.");
  if (quotation.status !== "Approved") {
    throw new Error("Only Approved quotations can be converted to orders.");
  }
  if (quotation.converted_to_order) {
    throw new Error("This quotation has already been converted to an order.");
  }

  const orderNumber = await generateOrderNumber();

  const orderPayload = {
    order_number:  orderNumber,
    quotation_id:  quotationId,
    customer_name: quotation.customer_name,
    status:        "Confirmed",
    total_amount:  quotation.final_price,
    box_type:      quotation.box_type,
    quantity:      quotation.quantity,
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([orderPayload])
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  const jobNumber = await generateJobNumber();

  const { data: job, error: jobError } = await supabase
    .from("production_jobs")
    .insert([{
      job_number: jobNumber,
      order_id: order.id,
      quotation_id: quotationId,
      customer_name: quotation.customer_name,
      box_type: quotation.box_type,
      quantity: quotation.quantity,
      status: "Scheduled",
      planned_date: getPlannedDate(7),
    }])
    .select()
    .single();

  if (jobError) throw new Error(jobError.message);

  const { data: updatedQuotation, error: linkError } = await supabase
    .from("quotations")
    .update({ converted_to_order: true, order_id: order.id, production_job_id: job.id })
    .eq("id", quotationId)
    .select()
    .single();

  if (linkError) throw new Error(linkError.message);
  return { quotation: updatedQuotation, order, job };
}

// ─── HELPERS ─────────────────────────────────────────────────

async function generateOrderNumber() {
  const yyyymm = new Date().toISOString().slice(0, 7).replace("-", "");
  const { count } = await supabase.from("orders").select("id", { count: "exact", head: true });
  const seq = String((count || 0) + 1).padStart(4, "0");
  return `ORD-${yyyymm}-${seq}`;
}

async function generateJobNumber() {
  const yyyymm = new Date().toISOString().slice(0, 7).replace("-", "");
  const { count } = await supabase.from("production_jobs").select("id", { count: "exact", head: true });
  const seq = String((count || 0) + 1).padStart(4, "0");
  return `JOB-${yyyymm}-${seq}`;
}

function getPlannedDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}
// ============================================================
// ProductForm.jsx
// Create / Edit form for Product Master
// Props: initialData, onSubmit(payload), onCancel, customers[]
// Location: src/features/products/ProductForm.jsx
// ============================================================

import { useState, useEffect } from "react";
import {
  BOX_TYPES,
  PLY_TYPES,
  FLUTE_TYPES,
  PRINTING_TYPES,
  GSM_OPTIONS,
} from "../quotations/utils/pricingEngine";

const EMPTY_FORM = {
  product_code:  "",
  product_name:  "",
  customer_id:   "",
  customer_name: "",
  box_type:      "Regular Slotted Container (RSC)",
  length:        "",
  width:         "",
  height:        "",
  ply_type:      "3 Ply",
  flute_type:    "B Flute",
  gsm:           150,
  printing_type: "None",
  notes:         "",
  is_active:     true,
};

function validate(form) {
  const e = {};
  if (!form.product_name.trim()) e.product_name = "Product name is required.";
  if (!form.box_type)            e.box_type      = "Box type is required.";
  if (!form.length || Number(form.length) <= 0)  e.length  = "Valid length required.";
  if (!form.width  || Number(form.width)  <= 0)  e.width   = "Valid width required.";
  if (!form.height || Number(form.height) <= 0)  e.height  = "Valid height required.";
  if (!form.ply_type)   e.ply_type   = "Ply type required.";
  if (!form.flute_type) e.flute_type = "Flute type required.";
  if (!form.gsm)        e.gsm        = "GSM required.";
  return e;
}

function Field({ label, error, hint, children }) {
  return (
    <div style={st.field}>
      <label style={st.label}>{label}</label>
      {children}
      {hint  && !error && <span style={st.hint}>{hint}</span>}
      {error && <span style={st.error}>{error}</span>}
    </div>
  );
}

export default function ProductForm({ initialData, onSubmit, onCancel, customers = [] }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setForm({ ...EMPTY_FORM, ...initialData });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function handleCustomerChange(customerId) {
    const customer = customers.find((c) => c.id === customerId);
    setForm((f) => ({
      ...f,
      customer_id:   customerId,
      customer_name: customer?.customer_name ?? "",
    }));
  }

  async function handleSubmit() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        length: Number(form.length),
        width:  Number(form.width),
        height: Number(form.height),
        gsm:    Number(form.gsm),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={st.wrapper}>

      {/* ── Section 1: Identity ── */}
      <div style={st.section}>
        <h3 style={st.sectionTitle}>📋 Product Identity</h3>
        <div style={st.grid2}>
          <Field label="PRODUCT NAME *" error={errors.product_name}>
            <input
              style={inputStyle(errors.product_name)}
              value={form.product_name}
              onChange={(e) => set("product_name", e.target.value)}
              placeholder="e.g. Master Carton – 5 Ply"
            />
          </Field>
          <Field label="PRODUCT CODE" hint="Auto-generated if left blank">
            <input
              style={inputStyle()}
              value={form.product_code}
              onChange={(e) => set("product_code", e.target.value)}
              placeholder="PRD-202606-0001"
            />
          </Field>
        </div>

        <Field label="CUSTOMER (optional)">
          <select
            style={inputStyle()}
            value={form.customer_id}
            onChange={(e) => handleCustomerChange(e.target.value)}
          >
            <option value="">— No specific customer —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.customer_name}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── Section 2: Box Specs ── */}
      <div style={st.section}>
        <h3 style={st.sectionTitle}>📦 Box Specifications</h3>

        <Field label="BOX TYPE *" error={errors.box_type}>
          <select
            style={inputStyle(errors.box_type)}
            value={form.box_type}
            onChange={(e) => set("box_type", e.target.value)}
          >
            {BOX_TYPES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </Field>

        <div style={st.grid3}>
          <Field label="LENGTH (mm) *" error={errors.length}>
            <input
              type="number" min="1"
              style={inputStyle(errors.length)}
              value={form.length}
              onChange={(e) => set("length", e.target.value)}
              placeholder="300"
            />
          </Field>
          <Field label="WIDTH (mm) *" error={errors.width}>
            <input
              type="number" min="1"
              style={inputStyle(errors.width)}
              value={form.width}
              onChange={(e) => set("width", e.target.value)}
              placeholder="200"
            />
          </Field>
          <Field label="HEIGHT (mm) *" error={errors.height}>
            <input
              type="number" min="1"
              style={inputStyle(errors.height)}
              value={form.height}
              onChange={(e) => set("height", e.target.value)}
              placeholder="150"
            />
          </Field>
        </div>

        <div style={st.grid3}>
          <Field label="PLY TYPE *" error={errors.ply_type}>
            <select
              style={inputStyle(errors.ply_type)}
              value={form.ply_type}
              onChange={(e) => set("ply_type", e.target.value)}
            >
              {PLY_TYPES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="FLUTE TYPE *" error={errors.flute_type}>
            <select
              style={inputStyle(errors.flute_type)}
              value={form.flute_type}
              onChange={(e) => set("flute_type", e.target.value)}
            >
              {FLUTE_TYPES.map((f) => <option key={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="PAPER GSM *" error={errors.gsm}>
            <select
              style={inputStyle(errors.gsm)}
              value={form.gsm}
              onChange={(e) => set("gsm", Number(e.target.value))}
            >
              {GSM_OPTIONS.map((g) => (
                <option key={g} value={g}>{g} GSM</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* ── Section 3: Printing ── */}
      <div style={st.section}>
        <h3 style={st.sectionTitle}>🎨 Printing</h3>
        <Field label="PRINTING TYPE *">
          <select
            style={inputStyle()}
            value={form.printing_type}
            onChange={(e) => set("printing_type", e.target.value)}
          >
            {PRINTING_TYPES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      {/* ── Section 4: Notes ── */}
      <div style={st.section}>
        <h3 style={st.sectionTitle}>📝 Notes</h3>
        <Field label="INTERNAL NOTES">
          <textarea
            style={{ ...inputStyle(), minHeight: "80px", resize: "vertical" }}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Any special requirements, packaging notes…"
          />
        </Field>
        <div style={st.activeToggle}>
          <label style={st.toggleLabel}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              style={{ marginRight: "0.5rem" }}
            />
            Active product
          </label>
          <span style={st.toggleHint}>Inactive products are hidden from selectors</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={st.actions}>
        <button onClick={onCancel} style={st.cancelBtn} disabled={submitting}>
          Cancel
        </button>
        <button onClick={handleSubmit} style={st.submitBtn} disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </div>
  );
}

function inputStyle(error) {
  return {
    width: "100%", padding: "0.5rem 0.7rem",
    borderRadius: "8px",
    border: `1.5px solid ${error ? "#ef4444" : "#1e293b"}`,
    background: "#0f172a", color: "#e2e8f0",
    fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box",
  };
}

const st = {
  wrapper: { color: "#e2e8f0", fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  section: {
    background: "#111827", border: "1px solid #1e293b",
    borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem",
  },
  sectionTitle: {
    margin: "0 0 1rem", fontSize: "0.75rem", fontWeight: 700,
    color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em",
    paddingBottom: "0.5rem", borderBottom: "1px solid #1e293b",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" },
  field: { marginBottom: "0.75rem" },
  label: {
    display: "block", fontSize: "0.68rem", fontWeight: 700,
    color: "#475569", textTransform: "uppercase",
    letterSpacing: "0.07em", marginBottom: "0.35rem",
  },
  hint:  { display: "block", fontSize: "0.72rem", color: "#475569", marginTop: "3px" },
  error: { display: "block", fontSize: "0.72rem", color: "#f87171", marginTop: "3px" },
  activeToggle: { display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.25rem" },
  toggleLabel:  { fontSize: "0.875rem", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" },
  toggleHint:   { fontSize: "0.72rem", color: "#475569" },
  actions: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.5rem" },
  cancelBtn: {
    padding: "0.6rem 1.4rem", borderRadius: "8px",
    border: "1.5px solid #1e293b", background: "#0f172a",
    color: "#94a3b8", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
  },
  submitBtn: {
    padding: "0.6rem 1.4rem", borderRadius: "8px", border: "none",
    background: "linear-gradient(135deg,#1e40af,#2563eb)",
    color: "#fff", fontWeight: 700, fontSize: "0.875rem",
    cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
  },
};
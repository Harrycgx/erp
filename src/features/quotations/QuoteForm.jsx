// ============================================================
// QuoteForm.jsx
// Multi-section quotation form with live pricing calculation
// Sections: Customer | Box Specs | Printing | Pricing | Remarks
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { calculatePricing, formatINR, GSM_OPTIONS, BOX_TYPES, PLY_TYPES, FLUTE_TYPES, PRINTING_TYPES } from "./utils/pricingEngine";
import supabase from "../../lib/supabase";
// ─── Default empty form state ────────────────────────────────
const EMPTY_FORM = {
  // Relationships
  customer_id: "",
  product_id: "",
  artwork_id: "",
  // Customer
  customer_name: "",
  contact_person: "",
  phone: "",
  email: "",
  gst_number: "",
  // Box
  box_type: "Regular Slotted Container (RSC)",
  length: "",
  width: "",
  height: "",
  ply_type: "3 Ply",
  flute_type: "B Flute",
  paper_gsm: 150,
  // Printing
  printing_type: "None",
  printing_colors: 0,
  // Commercial
  quantity: "",
  remarks: "",
  margin_percent: 15,
  gst_percent: 18,
};

// ─── Field-level validation rules ────────────────────────────
function validate(form) {
  const errors = {};
  if (!form.customer_name.trim()) errors.customer_name = "Customer name is required.";
  if (!form.contact_person.trim()) errors.contact_person = "Contact person is required.";
  if (!form.phone.trim()) errors.phone = "Phone number is required.";
  else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address.";
  if (form.gst_number && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst_number))
    errors.gst_number = "Enter a valid 15-character GSTIN.";
  if (!form.length || Number(form.length) <= 0) errors.length = "Enter a valid length.";
  if (!form.width || Number(form.width) <= 0) errors.width = "Enter a valid width.";
  if (!form.height || Number(form.height) <= 0) errors.height = "Enter a valid height.";
  if (!form.quantity || Number(form.quantity) < 1) errors.quantity = "Quantity must be at least 1.";
  if (form.printing_type !== "None" && (!form.printing_colors || Number(form.printing_colors) < 1))
    errors.printing_colors = "Specify at least 1 colour for printing.";
  return errors;
}

// ─── Subcomponents ───────────────────────────────────────────

function SectionHeader({ number, title, icon }) {
  return (
    <div style={styles.sectionHeader}>
      <div style={styles.sectionBadge}>{number}</div>
      <span style={styles.sectionIcon}>{icon}</span>
      <h3 style={styles.sectionTitle}>{title}</h3>
    </div>
  );
}

function FieldGroup({ children, columns = 2 }) {
  return (
    <div style={{ ...styles.fieldGroup, gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {children}
    </div>
  );
}

function Field({ label, error, required, hint, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>
      {children}
      {hint && !error && <p style={styles.hint}>{hint}</p>}
      {error && <p style={styles.errorMsg}>{error}</p>}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, disabled, min, step }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      step={step}
      style={styles.input}
    />
  );
}

function Select({ value, onChange, options, disabled }) {
  return (
    <select value={value} onChange={onChange} disabled={disabled} style={styles.select}>
      {options.map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  );
}

function PricingRow({ label, value, highlight, indent }) {
  return (
    <div style={{
      ...styles.pricingRow,
      background: highlight ? "rgba(59,130,246,0.08)" : "transparent",
      paddingLeft: indent ? "2rem" : "1rem",
    }}>
      <span style={{ ...styles.pricingLabel, fontWeight: highlight ? 700 : 400 }}>{label}</span>
      <span style={{ ...styles.pricingValue, fontWeight: highlight ? 700 : 400, color: highlight ? "#60a5fa" : "#94a3b8" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function QuoteForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState(() => {
    if (!initialData) return EMPTY_FORM;
    return {
      ...EMPTY_FORM,
      ...initialData,
      length: initialData.length ?? "",
      width: initialData.width ?? "",
      height: initialData.height ?? "",
      quantity: initialData.quantity ?? "",
      printing_colors: initialData.printing_colors ?? 0,
      margin_percent: initialData.margin_percent ?? 15,
      gst_percent: initialData.gst_percent ?? 18,
    };
  });

const [errors, setErrors] = useState({});
  const [pricing, setPricing] = useState(() => calculatePricing({}));
  const [touched, setTouched] = useState({});

  // ── Relationship data
  const [customers, setCustomers] = useState([]);
  const [products,  setProducts]  = useState([]);
  const [artworks,  setArtworks]  = useState([]);
  const [productLocked, setProductLocked] = useState(false);

  // Fetch customers on mount
  useEffect(() => {
    supabase.from("customers").select("id, company_name").order("company_name")
      .then(({ data }) => setCustomers(data || []));
  }, []);

  // Fetch products when customer changes
  useEffect(() => {
    if (!form.customer_id) { setProducts([]); return; }
    supabase.from("products").select("*").eq("customer_id", form.customer_id).eq("is_active", true)
      .then(({ data }) => setProducts(data || []));
  }, [form.customer_id]);

  // Fetch artworks when product changes
  useEffect(() => {
    if (!form.product_id) { setArtworks([]); return; }
    supabase.from("artworks").select("id, file_name, version, approval_status").eq("product_id", form.product_id)
      .then(({ data }) => setArtworks(data || []));
  }, [form.product_id]);

  // Auto-fill box specs when product selected
  function handleProductChange(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
      setForm(prev => ({
        ...prev,
        product_id:    productId,
        artwork_id:    "",
        box_type:      product.box_type      ?? prev.box_type,
        length:        product.length        ?? prev.length,
        width:         product.width         ?? prev.width,
        height:        product.height        ?? prev.height,
        ply_type:      product.ply_type      ?? prev.ply_type,
        flute_type:    product.flute_type    ?? prev.flute_type,
        paper_gsm:     product.gsm           ?? prev.paper_gsm,
        printing_type: product.printing_type ?? prev.printing_type,
      }));
      setProductLocked(true);
    } else {
      setForm(prev => ({ ...prev, product_id: "", artwork_id: "" }));
      setProductLocked(false);
    }
    setArtworks([]);
  }

  function handleCustomerChange(customerId) {
    setForm(prev => ({ ...prev, customer_id: customerId, product_id: "", artwork_id: "" }));
    setProducts([]);
    setArtworks([]);
    setProductLocked(false);
  }

  // ── Live pricing recalculation
  useEffect(() => {
    const result = calculatePricing({
      length: Number(form.length),
      width: Number(form.width),
      height: Number(form.height),
      ply_type: form.ply_type,
      flute_type: form.flute_type,
      paper_gsm: Number(form.paper_gsm),
      box_type: form.box_type,
      printing_type: form.printing_type,
      printing_colors: Number(form.printing_colors),
      quantity: Number(form.quantity),
      margin_percent: Number(form.margin_percent),
      gst_percent: Number(form.gst_percent),
    });
    setPricing(result);
  }, [
    form.length, form.width, form.height,
    form.ply_type, form.flute_type, form.paper_gsm,
    form.box_type, form.printing_type, form.printing_colors,
    form.quantity, form.margin_percent, form.gst_percent,
  ]);

  const handleChange = useCallback((field) => (e) => {
    const value = e.target.type === "number" ? e.target.value : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, [errors]);

  const handleBlur = useCallback((field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched(Object.fromEntries(Object.keys(validationErrors).map((k) => [k, true])));
      return;
    }

    const payload = {
      ...form,
      customer_id: form.customer_id || null,
      product_id:  form.product_id  || null,
      artwork_id:  form.artwork_id   || null,
      length: Number(form.length),
      width: Number(form.width),
      height: Number(form.height),
      quantity: Number(form.quantity),
      printing_colors: Number(form.printing_colors),
      margin_percent: Number(form.margin_percent),
      gst_percent: Number(form.gst_percent),
      ...pricing,
    };
    onSubmit(payload);
  };

  const isEdit = !!initialData?.id;

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} noValidate>

        {/* ── Section 0: Customer / Product / Artwork ── */}
        <div style={styles.section}>
          <SectionHeader number="00" title="Customer & Product" icon="🔗" />
          <FieldGroup columns={1}>
            <Field label="Customer" required>
              <select
                style={styles.select}
                value={form.customer_id}
                onChange={e => handleCustomerChange(e.target.value)}
              >
                <option value="">— Select customer —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
            </Field>
          </FieldGroup>
          <FieldGroup columns={2}>
            <Field label="Product" hint={!form.customer_id ? "Select a customer first" : ""}>
              <select
                style={styles.select}
                value={form.product_id}
                onChange={e => handleProductChange(e.target.value)}
                disabled={!form.customer_id}
              >
                <option value="">— Select product —</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.product_name}</option>
                ))}
              </select>
            </Field>
            <Field label="Artwork" hint={!form.product_id ? "Select a product first" : ""}>
              <select
                style={styles.select}
                value={form.artwork_id}
                onChange={e => setForm(prev => ({ ...prev, artwork_id: e.target.value }))}
                disabled={!form.product_id}
              >
                <option value="">— Select artwork —</option>
                {artworks.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.file_name}{a.version ? ` v${a.version}` : ""} · {a.approval_status ?? "Pending"}
                  </option>
                ))}
              </select>
            </Field>
          </FieldGroup>
          {productLocked && (
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#4ade80" }}>
              ✓ Box specifications auto-filled from product. Fields are read-only.
            </p>
          )}
        </div>

        {/* ── Section 0: Customer / Product / Artwork ── */}
        <div style={styles.section}>
          <SectionHeader number="00" title="Customer & Product" icon="🔗" />
          <FieldGroup columns={1}>
            <Field label="Customer" required>
              <select
                style={styles.select}
                value={form.customer_id}
                onChange={e => handleCustomerChange(e.target.value)}
              >
                <option value="">— Select customer —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
            </Field>
          </FieldGroup>
          <FieldGroup columns={2}>
            <Field label="Product" hint={!form.customer_id ? "Select a customer first" : ""}>
              <select
                style={styles.select}
                value={form.product_id}
                onChange={e => handleProductChange(e.target.value)}
                disabled={!form.customer_id}
              >
                <option value="">— Select product —</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.product_name}</option>
                ))}
              </select>
            </Field>
            <Field label="Artwork" hint={!form.product_id ? "Select a product first" : ""}>
              <select
                style={styles.select}
                value={form.artwork_id}
                onChange={e => setForm(prev => ({ ...prev, artwork_id: e.target.value }))}
                disabled={!form.product_id}
              >
                <option value="">— Select artwork —</option>
                {artworks.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.file_name}{a.version ? ` v${a.version}` : ""} · {a.approval_status ?? "Pending"}
                  </option>
                ))}
              </select>
            </Field>
          </FieldGroup>
          {productLocked && (
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#4ade80" }}>
              ✓ Box specifications auto-filled from product. Fields are read-only.
            </p>
          )}
        </div>

        {/* ── Section 1: Customer Details ── */}
        <div style={styles.section}>
          <SectionHeader number="01" title="Customer Details" icon="🏢" />
          <FieldGroup columns={2}>
            <Field label="Customer Name" required error={touched.customer_name && errors.customer_name}>
              <Input value={form.customer_name} onChange={handleChange("customer_name")} onBlur={handleBlur("customer_name")} placeholder="e.g. Reliance Industries Ltd" />
            </Field>
            <Field label="Contact Person" required error={touched.contact_person && errors.contact_person}>
              <Input value={form.contact_person} onChange={handleChange("contact_person")} placeholder="e.g. Ramesh Kumar" />
            </Field>
            <Field label="Phone" required error={touched.phone && errors.phone} hint="10-digit mobile number">
              <Input value={form.phone} onChange={handleChange("phone")} placeholder="9876543210" />
            </Field>
            <Field label="Email" error={touched.email && errors.email}>
              <Input type="email" value={form.email} onChange={handleChange("email")} placeholder="purchase@company.com" />
            </Field>
            <Field label="GST Number" error={touched.gst_number && errors.gst_number} hint="15-character GSTIN (optional)">
              <Input value={form.gst_number} onChange={handleChange("gst_number")} placeholder="29ABCDE1234F1Z5" />
            </Field>
          </FieldGroup>
        </div>

        {/* ── Section 2: Box Specifications ── */}
        <div style={styles.section}>
          <SectionHeader number="02" title="Box Specifications" icon="📦" />
          <FieldGroup columns={1}>
            <Field label="Box Type" required>
              <Select value={form.box_type} onChange={handleChange("box_type")} options={BOX_TYPES} disabled={productLocked} />
            </Field>
          </FieldGroup>
          <FieldGroup columns={3}>
            <Field label="Length (mm)" required error={touched.length && errors.length} hint="Inner dimension">
              <Input type="number" value={form.length} onChange={handleChange("length")} placeholder="300" min="1" step="1" />
            </Field>
            <Field label="Width (mm)" required error={touched.width && errors.width} hint="Inner dimension">
              <Input type="number" value={form.width} onChange={handleChange("width")} placeholder="200" min="1" step="1" />
            </Field>
            <Field label="Height (mm)" required error={touched.height && errors.height} hint="Inner dimension">
              <Input type="number" value={form.height} onChange={handleChange("height")} placeholder="150" min="1" step="1" />
            </Field>
          </FieldGroup>
          {form.length && form.width && form.height && (
            <div style={styles.blankSizeChip}>
              📐 Blank Size: {pricing.blank_length_mm} × {pricing.blank_width_mm} mm &nbsp;|&nbsp; Board Area: {pricing.board_area_sqm} m²/box
            </div>
          )}
          <FieldGroup columns={3}>
            <Field label="Ply Type" required>
              <Select value={form.ply_type} onChange={handleChange("ply_type")} options={PLY_TYPES} />
            </Field>
            <Field label="Flute Type" required>
              <Select value={form.flute_type} onChange={handleChange("flute_type")} options={FLUTE_TYPES} />
            </Field>
            <Field label="Paper GSM" required>
              <Select
                value={form.paper_gsm}
                onChange={handleChange("paper_gsm")}
                options={GSM_OPTIONS.map((g) => ({ value: g, label: `${g} GSM` }))}
              />
            </Field>
          </FieldGroup>
        </div>

        {/* ── Section 3: Printing ── */}
        <div style={styles.section}>
          <SectionHeader number="03" title="Printing" icon="🎨" />
          <FieldGroup columns={2}>
            <Field label="Printing Type" required>
              <Select value={form.printing_type} onChange={handleChange("printing_type")} options={PRINTING_TYPES} />
            </Field>
            <Field
              label="Number of Colours"
              error={touched.printing_colors && errors.printing_colors}
              hint={form.printing_type === "None" ? "Not applicable" : ""}
            >
              <Input
                type="number"
                value={form.printing_colors}
                onChange={handleChange("printing_colors")}
                min="0"
                step="1"
                disabled={form.printing_type === "None"}
                placeholder="1"
              />
            </Field>
          </FieldGroup>
        </div>

        {/* ── Section 4: Commercial ── */}
        <div style={styles.section}>
          <SectionHeader number="04" title="Commercial" icon="💼" />
          <FieldGroup columns={3}>
            <Field label="Quantity (pcs)" required error={touched.quantity && errors.quantity}>
              <Input type="number" value={form.quantity} onChange={handleChange("quantity")} placeholder="1000" min="1" step="1" />
            </Field>
            <Field label="Margin %" hint="Default: 15%">
              <Input type="number" value={form.margin_percent} onChange={handleChange("margin_percent")} min="0" max="100" step="0.5" />
            </Field>
            <Field label="GST %" hint="Default: 18%">
              <Input type="number" value={form.gst_percent} onChange={handleChange("gst_percent")} min="0" max="28" step="0.5" />
            </Field>
          </FieldGroup>
          <Field label="Remarks / Special Instructions">
            <textarea
              value={form.remarks}
              onChange={handleChange("remarks")}
              placeholder="Any special requirements, colour codes, delivery instructions..."
              rows={3}
              style={styles.textarea}
            />
          </Field>
        </div>

        {/* ── Section 5: Live Pricing Summary ── */}
        <div style={styles.pricingSection}>
          <SectionHeader number="05" title="Pricing Summary" icon="📊" />
          <p style={styles.pricingNote}>Auto-calculated · Updates as you type</p>
          <div style={styles.pricingTable}>
            <PricingRow label="Paper Consumption" value={`${pricing.paper_consumption} kg/box`} indent />
            <PricingRow label="Material Cost" value={formatINR(pricing.material_cost)} indent />
            <PricingRow label="Printing Cost" value={formatINR(pricing.printing_cost)} indent />
            <PricingRow label="Labour Cost" value={formatINR(pricing.labour_cost)} indent />
            <div style={styles.pricingDivider} />
            <PricingRow label={`Margin (${form.margin_percent}%)`} value={formatINR(pricing.margin_amount)} indent />
            <PricingRow label="Subtotal" value={formatINR(pricing.subtotal)} />
            <PricingRow label={`GST (${form.gst_percent}%)`} value={formatINR(pricing.gst_amount)} indent />
            <div style={styles.pricingDivider} />
            <PricingRow label="Unit Price (excl. GST)" value={formatINR(pricing.unit_price)} highlight />
            <PricingRow label="Total Final Price (incl. GST)" value={formatINR(pricing.final_price)} highlight />
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={styles.actions}>
          <button type="button" onClick={onCancel} style={styles.cancelBtn} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" style={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "Saving…" : isEdit ? "Update Quotation" : "Create Quotation"}
          </button>
        </div>

      </form>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = {
  wrapper: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: "#e2e8f0",
    maxWidth: "900px",
    margin: "0 auto",
    padding: "0 0 2rem",
  },
  section: {
    background: "#111827",
    borderRadius: "12px",
    border: "1px solid #1e293b",
    padding: "1.5rem",
    marginBottom: "1rem",
  },
  pricingSection: {
    background: "linear-gradient(135deg, #0f172a 0%, #111827 100%)",
    borderRadius: "12px",
    border: "1.5px solid #1e40af",
    padding: "1.5rem",
    marginBottom: "1rem",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1.25rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid #1e293b",
  },
  sectionBadge: {
    background: "#1e40af",
    color: "#e2e8f0",
    borderRadius: "6px",
    padding: "2px 8px",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    fontFamily: "monospace",
  },
  sectionIcon: {
    fontSize: "1.2rem",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: "-0.01em",
  },
  fieldGroup: {
    display: "grid",
    gap: "1rem",
    marginBottom: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  required: {
    color: "#f87171",
    marginLeft: "3px",
  },
  input: {
    padding: "0.55rem 0.75rem",
    borderRadius: "8px",
    border: "1.5px solid #1e293b",
    fontSize: "0.9rem",
    color: "#e2e8f0",
    background: "#0f172a",
    outline: "none",
    transition: "border-color 0.15s",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    padding: "0.55rem 0.75rem",
    borderRadius: "8px",
    border: "1.5px solid #1e293b",
    fontSize: "0.9rem",
    color: "#e2e8f0",
    background: "#0f172a",
    outline: "none",
    width: "100%",
    cursor: "pointer",
  },
  textarea: {
    padding: "0.55rem 0.75rem",
    borderRadius: "8px",
    border: "1.5px solid #1e293b",
    fontSize: "0.9rem",
    color: "#e2e8f0",
    background: "#0f172a",
    outline: "none",
    width: "100%",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  hint: {
    margin: 0,
    fontSize: "0.75rem",
    color: "#64748b",
  },
  errorMsg: {
    margin: 0,
    fontSize: "0.75rem",
    color: "#f87171",
    fontWeight: 500,
  },
  blankSizeChip: {
    background: "rgba(30,64,175,0.12)",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "0.5rem 0.75rem",
    fontSize: "0.8rem",
    color: "#93c5fd",
    fontWeight: 500,
    marginBottom: "1rem",
  },
  pricingNote: {
    fontSize: "0.75rem",
    color: "#64748b",
    margin: "-0.5rem 0 1rem",
    fontStyle: "italic",
  },
  pricingTable: {
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #1e293b",
    background: "#0f172a",
  },
  pricingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.55rem 1rem",
    borderBottom: "1px solid #1a2332",
  },
  pricingLabel: {
    fontSize: "0.875rem",
    color: "#94a3b8",
  },
  pricingValue: {
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
  },
  pricingDivider: {
    height: "2px",
    background: "#1e293b",
    margin: "0.25rem 0",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    paddingTop: "0.5rem",
  },
  cancelBtn: {
    padding: "0.65rem 1.5rem",
    borderRadius: "8px",
    border: "1.5px solid #1e293b",
    background: "#0f172a",
    color: "#94a3b8",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  submitBtn: {
    padding: "0.65rem 2rem",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #1e40af, #2563eb)",
    color: "#e2e8f0",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
  },
};
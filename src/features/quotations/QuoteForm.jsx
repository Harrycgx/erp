// ============================================================
// QuoteForm.jsx
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { calculatePricing, formatINR, GSM_OPTIONS, BOX_TYPES, PLY_TYPES, FLUTE_TYPES, PRINTING_TYPES } from "./utils/pricingEngine";
import supabase from "../../lib/supabase";

// ─── Numeric Sanitation Helper ───────────────────────────────
const safeNum = (val) => {
  const parsed = parseFloat(val);
  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
};

// ─── Field-level validation rules ────────────────────────────
function validateFullForm(form) {
  const errors = {};
  if (!form.customer_name?.trim()) errors.customer_name = "Customer name is required.";
  if (!form.contact_person?.trim()) errors.contact_person = "Contact person is required.";
  if (!form.phone?.trim()) errors.phone = "Phone number is required.";
  else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address.";
  if (form.gst_number && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst_number))
    errors.gst_number = "Enter a valid 15-character GSTIN.";
  
  if (!form.length || safeNum(form.length) <= 0) errors.length = "Enter a valid length.";
  if (!form.width || safeNum(form.width) <= 0) errors.width = "Enter a valid width.";
  if (!form.height || safeNum(form.height) <= 0) errors.height = "Enter a valid height.";
  if (!form.quantity || safeNum(form.quantity) < 1) errors.quantity = "Quantity must be at least 1.";
  
  if (form.printing_type !== "None" && (!form.printing_colors || safeNum(form.printing_colors) < 1))
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

function Input({ value, onChange, onBlur, type = "text", placeholder, disabled, min, step }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      step={step}
      style={{
        ...styles.input,
        ...(disabled ? styles.inputDisabled : {}),
      }}
    />
  );
}

// Modified Select component to enforce uniform option parsing
function Select({ value, onChange, onBlur, options, disabled }) {
  return (
    <select
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      style={{
        ...styles.select,
        ...(disabled ? styles.inputDisabled : {}),
      }}
    >
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
  
  // ── Separated Architecture State Slices ──
  const [identity, setIdentity] = useState(() => ({
    customer_id: initialData?.customer_id ?? "",
    product_id: initialData?.product_id ?? "",
    artwork_id: initialData?.artwork_id ?? "",
    customer_name: initialData?.customer_name ?? "",
    contact_person: initialData?.contact_person ?? "",
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
    gst_number: initialData?.gst_number ?? "",
  }));

  const [spec, setSpec] = useState(() => ({
    box_type: initialData?.box_type ?? "Regular Slotted Container (RSC)",
    length: initialData?.length ?? "",
    width: initialData?.width ?? "",
    height: initialData?.height ?? "",
    ply_type: initialData?.ply_type ?? "3 Ply",
    flute_type: initialData?.flute_type ?? "B Flute",
    paper_gsm: initialData?.paper_gsm ?? 150,
  }));

  const [commercial, setCommercial] = useState(() => ({
    printing_type: initialData?.printing_type ?? "None",
    printing_colors: initialData?.printing_colors ?? 0,
    quantity: initialData?.quantity ?? "",
    remarks: initialData?.remarks ?? "",
    margin_percent: initialData?.margin_percent ?? 15,
    gst_percent: initialData?.gst_percent ?? 18,
  }));

  const [errors, setErrors] = useState({});
  const [pricing, setPricing] = useState(null);
  const [touched, setTouched] = useState({});
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [productLocked, setProductLocked] = useState(!!initialData?.product_id);

  // Fetch initial customers
  useEffect(() => {
    supabase.from("customers").select("id, company_name").order("company_name")
      .then(({ data }) => setCustomers(data || []));
  }, []);

  // Fetch products
  useEffect(() => {
    if (!identity.customer_id) { 
      setProducts([]); 
      return; 
    }
    supabase.from("products").select("*").eq("customer_id", identity.customer_id)
      .then(({ data }) => setProducts(data || []));
  }, [identity.customer_id]);

  // Fetch artworks
  useEffect(() => {
    if (!identity.product_id) { 
      setArtworks([]); 
      return; 
    }
    supabase.from("artworks").select("id, file_name, version, approval_status").eq("product_id", identity.product_id)
      .then(({ data }) => setArtworks(data || []));
  }, [identity.product_id]);

  // Pricing calculation matching UI compatibility structures safely
  useEffect(() => {
    const len = safeNum(spec.length);
    const wid = safeNum(spec.width);
    const hgt = safeNum(spec.height);
    const qty = safeNum(commercial.quantity);

    if (len > 0 && wid > 0 && hgt > 0 && qty > 0) {
      try {
        const calculated = calculatePricing({
          length: len,
          width: wid,
          height: hgt,
          ply_type: spec.ply_type,
          flute_type: spec.flute_type,
          paper_gsm: safeNum(spec.paper_gsm),
          box_type: spec.box_type,
          printing_type: commercial.printing_type,
          printing_colors: safeNum(commercial.printing_colors),
          quantity: qty,
          margin_percent: safeNum(commercial.margin_percent),
          gst_percent: safeNum(commercial.gst_percent),
        });

        if (calculated) {
          setPricing({
            material_cost: safeNum(calculated.material_cost),
            print_cost: safeNum(calculated.printing_cost), // Name alignment fix
            labour_cost: safeNum(calculated.labour_cost),
            overhead_cost: 0,                              // Prevents layout undefined/NaN
            subtotal: safeNum(calculated.subtotal),
            margin_amount: safeNum(calculated.margin_amount),
            taxable_amount: safeNum(calculated.subtotal),  // Name alignment fix
            gst_amount: safeNum(calculated.gst_amount),
            total_amount: safeNum(calculated.final_price), // Name alignment fix
            unit_price: safeNum(calculated.unit_price),
          });
        }
      } catch (err) {
        console.error("Critical calculation loop intercepted:", err);
        setPricing(null);
      }
    } else {
      setPricing(null);
    }
  }, [
    spec.length,
    spec.width,
    spec.height,
    spec.ply_type,
    spec.flute_type,
    spec.paper_gsm,
    spec.box_type,
    commercial.printing_type,
    commercial.printing_colors,
    commercial.quantity,
    commercial.margin_percent,
    commercial.gst_percent,
  ]);

  // Handlers
  function handleProductChange(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
      setIdentity(prev => ({ ...prev, product_id: productId, artwork_id: "" }));
      setSpec(prev => ({
        ...prev,
        box_type: product.box_type ?? prev.box_type,
        length: product.length ?? prev.length,
        width: product.width ?? prev.width,
        height: product.height ?? prev.height,
        ply_type: product.ply_type ?? prev.ply_type,
        flute_type: product.flute_type ?? prev.flute_type,
        paper_gsm: product.gsm ?? prev.paper_gsm,
      }));
      setCommercial(prev => ({
        ...prev,
        printing_type: product.printing_type ?? prev.printing_type,
      }));
      setProductLocked(true);
      setErrors(prev => ({ ...prev, length: undefined, width: undefined, height: undefined }));
    } else {
      setIdentity(prev => ({ ...prev, product_id: "", artwork_id: "" }));
      setProductLocked(false);
    }
    setArtworks([]);
  }

  function handleCustomerChange(customerId) {
    setIdentity(prev => ({ ...prev, customer_id: customerId, product_id: "", artwork_id: "" }));
    setProducts([]);
    setArtworks([]);
    setProductLocked(false);
  }

  const handleChange = useCallback((slice, field) => (e) => {
    const value = e.target.value;
    if (slice === "identity") setIdentity(prev => ({ ...prev, [field]: value }));
    if (slice === "spec") setSpec(prev => ({ ...prev, [field]: value }));
    if (slice === "commercial") setCommercial(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleBlur = useCallback((slice, field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const currentForm = { ...identity, ...spec, ...commercial };
    const fieldErrors = validateFullForm(currentForm);
    setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
  }, [identity, spec, commercial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullForm = { ...identity, ...spec, ...commercial };
    const validationErrors = validateFullForm(fullForm);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched(Object.fromEntries(Object.keys(validationErrors).map((k) => [k, true])));
      return;
    }
    onSubmit({ ...fullForm, ...pricing });
  };

  const isEdit = !!initialData?.id;
  const showPricing =
    safeNum(spec.length) > 0 &&
    safeNum(spec.width) > 0 &&
    safeNum(spec.height) > 0 &&
    safeNum(commercial.quantity) > 0;

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} noValidate>

        {/* ── Section 00: Customer & Product Link ──────────────── */}
        <div style={styles.section}>
          <SectionHeader number="00" title="Customer & Product" icon="🔗" />
          <FieldGroup columns={1}>
            <Field label="Customer" required>
              <select style={styles.select} value={identity.customer_id} onChange={e => handleCustomerChange(e.target.value)}>
                <option value="">— Select customer —</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </Field>
          </FieldGroup>
          <FieldGroup columns={2}>
            <Field label="Product" hint={!identity.customer_id ? "Select a customer first" : ""}>
              <select style={styles.select} value={identity.product_id} onChange={e => handleProductChange(e.target.value)} disabled={!identity.customer_id}>
                <option value="">— Select product —</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
              </select>
            </Field>
            <Field label="Artwork" hint={!identity.product_id ? "Select a product first" : ""}>
              <select style={styles.select} value={identity.artwork_id} onChange={e => setIdentity(prev => ({ ...prev, artwork_id: e.target.value }))} disabled={!identity.product_id}>
                <option value="">— Select artwork —</option>
                {artworks.map(a => <option key={a.id} value={a.id}>{a.file_name} · {a.approval_status ?? "Pending"}</option>)}
              </select>
            </Field>
          </FieldGroup>
        </div>

        {/* ── Section 01: Customer Info ─────────────────────────── */}
        <div style={styles.section}>
          <SectionHeader number="01" title="Customer Info" icon="🏢" />
          <FieldGroup columns={2}>
            <Field label="Company / Customer Name" required error={errors.customer_name}>
              <Input
                value={identity.customer_name}
                onChange={handleChange("identity", "customer_name")}
                onBlur={handleBlur("identity", "customer_name")}
                placeholder="e.g. Sharma Packaging Pvt Ltd"
              />
            </Field>
            <Field label="Contact Person" required error={errors.contact_person}>
              <Input
                value={identity.contact_person}
                onChange={handleChange("identity", "contact_person")}
                onBlur={handleBlur("identity", "contact_person")}
                placeholder="e.g. Ramesh Sharma"
              />
            </Field>
            <Field label="Phone" required error={errors.phone}>
              <Input
                value={identity.phone}
                onChange={handleChange("identity", "phone")}
                onBlur={handleBlur("identity", "phone")}
                type="tel"
                placeholder="10-digit mobile number"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input
                value={identity.email}
                onChange={handleChange("identity", "email")}
                onBlur={handleBlur("identity", "email")}
                type="email"
                placeholder="contact@example.com"
              />
            </Field>
            <Field label="GSTIN" error={errors.gst_number} hint="Optional · 15-character GST number">
              <Input
                value={identity.gst_number}
                onChange={handleChange("identity", "gst_number")}
                onBlur={handleBlur("identity", "gst_number")}
                placeholder="22AAAAA0000A1Z5"
              />
            </Field>
          </FieldGroup>
        </div>

        {/* ── Section 02: Box Specifications ───────────────────── */}
        <div style={styles.section}>
          <SectionHeader number="02" title="Box Specifications" icon="📦" />
          {productLocked && (
            <div style={styles.lockBanner}>
              <span>🔒</span>
              <span style={{ flex: 1 }}>Dimensions auto-filled from product.</span>
              <button
                type="button"
                style={styles.unlockBtn}
                onClick={() => setProductLocked(false)}
              >
                Unlock to edit
              </button>
            </div>
          )}
          <FieldGroup columns={1}>
            <Field label="Box Type">
              <Select
                value={spec.box_type}
                onChange={handleChange("spec", "box_type")}
                options={BOX_TYPES}
                disabled={productLocked}
              />
            </Field>
          </FieldGroup>
          <FieldGroup columns={3}>
            <Field label="Length (mm)" required error={errors.length}>
              <Input
                value={spec.length}
                onChange={handleChange("spec", "length")}
                onBlur={handleBlur("spec", "length")}
                type="number"
                placeholder="0"
                min="1"
                disabled={productLocked}
              />
            </Field>
            <Field label="Width (mm)" required error={errors.width}>
              <Input
                value={spec.width}
                onChange={handleChange("spec", "width")}
                onBlur={handleBlur("spec", "width")}
                type="number"
                placeholder="0"
                min="1"
                disabled={productLocked}
              />
            </Field>
            <Field label="Height (mm)" required error={errors.height}>
              <Input
                value={spec.height}
                onChange={handleChange("spec", "height")}
                onBlur={handleBlur("spec", "height")}
                type="number"
                placeholder="0"
                min="1"
                disabled={productLocked}
              />
            </Field>
          </FieldGroup>
        </div>

        {/* ── Section 03: Paper & Board ─────────────────────────── */}
        <div style={styles.section}>
          <SectionHeader number="03" title="Paper & Board" icon="🧱" />
          <FieldGroup columns={3}>
            <Field label="Ply Type">
              <Select
                value={spec.ply_type}
                onChange={handleChange("spec", "ply_type")}
                options={PLY_TYPES}
                disabled={productLocked}
              />
            </Field>
            <Field label="Flute Type">
              <Select
                value={spec.flute_type}
                onChange={handleChange("spec", "flute_type")}
                options={FLUTE_TYPES}
                disabled={productLocked}
              />
            </Field>
            <Field label="Paper GSM">
              <Select
                value={spec.paper_gsm}
                onChange={handleChange("spec", "paper_gsm")}
                options={GSM_OPTIONS.map(g => ({ value: g, label: `${g} GSM` }))}
                disabled={productLocked}
              />
            </Field>
          </FieldGroup>
        </div>

        {/* ── Section 04: Printing ──────────────────────────────── */}
        <div style={styles.section}>
          <SectionHeader number="04" title="Printing" icon="🖨️" />
          <FieldGroup columns={2}>
            <Field label="Printing Type">
              <Select
                value={commercial.printing_type}
                onChange={handleChange("commercial", "printing_type")}
                options={PRINTING_TYPES}
              />
            </Field>
            {commercial.printing_type !== "None" && (
              <Field label="Number of Colours" required error={errors.printing_colors}>
                <Input
                  value={commercial.printing_colors}
                  onChange={handleChange("commercial", "printing_colors")}
                  onBlur={handleBlur("commercial", "printing_colors")}
                  type="number"
                  placeholder="1 – 6"
                  min="1"
                />
              </Field>
            )}
          </FieldGroup>
        </div>

        {/* ── Section 05: Commercial ────────────────────────────── */}
        <div style={styles.section}>
          <SectionHeader number="05" title="Commercial" icon="💰" />
          <FieldGroup columns={3}>
            <Field label="Quantity (pcs)" required error={errors.quantity}>
              <Input
                value={commercial.quantity}
                onChange={handleChange("commercial", "quantity")}
                onBlur={handleBlur("commercial", "quantity")}
                type="number"
                placeholder="e.g. 1000"
                min="1"
              />
            </Field>
            <Field label="Margin (%)" hint="Pre-tax profit margin">
              <Input
                value={commercial.margin_percent}
                onChange={handleChange("commercial", "margin_percent")}
                onBlur={handleBlur("commercial", "margin_percent")}
                type="number"
                placeholder="15"
                min="0"
                step="0.5"
              />
            </Field>
            <Field label="GST (%)">
              <Select
                value={commercial.gst_percent}
                onChange={handleChange("commercial", "gst_percent")}
                options={[
                  { value: 0,  label: "0% — Exempt" },
                  { value: 5,  label: "5%" },
                  { value: 12, label: "12%" },
                  { value: 18, label: "18% (Standard)" },
                ]}
              />
            </Field>
          </FieldGroup>
          <FieldGroup columns={1}>
            <Field label="Remarks">
              <textarea
                value={commercial.remarks}
                onChange={handleChange("commercial", "remarks")}
                placeholder="Special instructions, delivery terms, validity period…"
                rows={3}
                style={styles.textarea}
              />
            </Field>
          </FieldGroup>
        </div>

        {/* ── Pricing Summary (live, shows once inputs are filled) ── */}
        {showPricing && pricing && (
          <div style={{ ...styles.section, ...styles.pricingSection }}>
            <SectionHeader number="∑" title="Pricing Summary" icon="📊" />
            <div style={styles.pricingGrid}>

              <div style={styles.pricingBlock}>
                <p style={styles.pricingBlockLabel}>Cost Breakdown</p>
                <PricingRow label="Material Cost"   value={formatINR(pricing.material_cost)}  indent />
                <PricingRow label="Print Cost"      value={formatINR(pricing.print_cost)}     indent />
                <PricingRow label="Labour Cost"     value={formatINR(pricing.labour_cost)}    indent />
                <PricingRow label="Overhead"        value={formatINR(pricing.overhead_cost)}  indent />
                <PricingRow label="Subtotal (Cost)" value={formatINR(pricing.subtotal)} />
              </div>

              <div style={styles.pricingBlock}>
                <p style={styles.pricingBlockLabel}>Final Price</p>
                <PricingRow label="Margin Amount"           value={formatINR(pricing.margin_amount)}   indent />
                <PricingRow label="Taxable Value"           value={formatINR(pricing.taxable_amount)} />
                <PricingRow label={`GST @ ${commercial.gst_percent}%`} value={formatINR(pricing.gst_amount)} indent />
                <PricingRow label="Total (incl. GST)"       value={formatINR(pricing.total_amount)}   highlight />
                <PricingRow label="Unit Price / Piece"      value={formatINR(pricing.unit_price)}     highlight />
              </div>

            </div>
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────── */}
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
    background: "#0d1117",
    color: "#e2e8f0",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontSize: "13px",
    padding: "0 0 2rem",
    maxWidth: "900px",
    margin: "0 auto",
  },
  section: {
    background: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "1.25rem 1.5rem",
    marginBottom: "1rem",
  },
  pricingSection: {
    background: "#0f172a",
    border: "1px solid #1e3a5f",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    marginBottom: "1rem",
    paddingBottom: "0.6rem",
    borderBottom: "1px solid #1e293b",
  },
  sectionBadge: {
    background: "#1e3a5f",
    color: "#60a5fa",
    fontFamily: "monospace",
    fontSize: "11px",
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: "4px",
    letterSpacing: "0.05em",
    flexShrink: 0,
  },
  sectionIcon: {
    fontSize: "15px",
    flexShrink: 0,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  fieldGroup: {
    display: "grid",
    gap: "0.6rem 1rem",
    marginBottom: "0.6rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  required: {
    color: "#f87171",
    marginLeft: "3px",
  },
  hint: {
    margin: 0,
    fontSize: "11px",
    color: "#334155",
    fontStyle: "italic",
  },
  errorMsg: {
    margin: 0,
    fontSize: "11px",
    color: "#f87171",
  },
  input: {
    background: "#0d1117",
    border: "1px solid #1e293b",
    borderRadius: "5px",
    color: "#e2e8f0",
    fontSize: "13px",
    padding: "6px 10px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  inputDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  select: {
    background: "#0d1117",
    border: "1px solid #1e293b",
    borderRadius: "5px",
    color: "#e2e8f0",
    fontSize: "13px",
    padding: "6px 10px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  textarea: {
    background: "#0d1117",
    border: "1px solid #1e293b",
    borderRadius: "5px",
    color: "#e2e8f0",
    fontSize: "13px",
    padding: "8px 10px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },
  lockBanner: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "rgba(251,191,36,0.06)",
    border: "1px solid rgba(251,191,36,0.18)",
    borderRadius: "5px",
    padding: "6px 12px",
    marginBottom: "0.85rem",
    fontSize: "12px",
    color: "#fbbf24",
  },
  unlockBtn: {
    background: "rgba(251,191,36,0.12)",
    border: "1px solid rgba(251,191,36,0.25)",
    borderRadius: "4px",
    color: "#fbbf24",
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 10px",
    cursor: "pointer",
    flexShrink: 0,
  },
  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  pricingBlock: {
    background: "#0d1117",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    overflow: "hidden",
  },
  pricingBlockLabel: {
    margin: 0,
    padding: "5px 1rem",
    fontSize: "10px",
    fontWeight: 700,
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    background: "#0f172a",
    borderBottom: "1px solid #1e293b",
  },
  pricingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 1rem",
    borderBottom: "1px solid #0f172a",
  },
  pricingLabel: {
    fontSize: "12px",
    color: "#64748b",
  },
  pricingValue: {
    fontSize: "12px",
    fontFamily: "monospace",
    color: "#94a3b8",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    paddingTop: "0.25rem",
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 500,
    padding: "8px 20px",
    cursor: "pointer",
  },
  submitBtn: {
    background: "#2563eb",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 600,
    padding: "8px 24px",
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
};
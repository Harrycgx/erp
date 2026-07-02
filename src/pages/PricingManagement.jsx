// ============================================================
// PricingManagement.jsx
// Pricing Management Module — Phase 1
// Location: src/pages/PricingManagement.jsx
// ============================================================

import { useState, useEffect, useCallback } from "react";
import PageContainer from "../components/ui/PageContainer";
import {
  fetchActiveRates,
  fetchPricingAuditLog,
  updateGlobalRates,
  updateMaterialRate,
  createMarginRule,
  createCustomerContract,
  formatINR,
} from "../services/pricingService";
import supabase from "../lib/supabase";

// ─── Constants ────────────────────────────────────────────────
const PAPER_TYPES  = ["Kraft", "Duplex", "Test Liner", "Semi-Chemical"];
const PLY_TYPES    = ["2 Ply", "3 Ply", "5 Ply", "7 Ply"];
const BOX_TYPES    = [
  "Regular Slotted Container (RSC)", "Half Slotted Container (HSC)",
  "Full Overlap Container (FOL)", "Die Cut Box", "Tray", "Telescope Box", "Custom",
];
const RULE_TYPES   = ["global", "ply_type", "box_type", "customer"];
const TABS         = ["Global Controls", "Material Rates", "Margin Rules", "Customer Contracts", "Audit Log"];

// ─── Shared styles ────────────────────────────────────────────
const s = {
  section:    { background: "#111827", border: "1px solid #1e293b", borderRadius: "14px", padding: "1.5rem", marginBottom: "1.25rem" },
  secTitle:   { margin: "0 0 1.25rem", fontSize: "0.72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: "0.5rem", borderBottom: "1px solid #1e293b" },
  label:      { display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.35rem" },
  hint:       { display: "block", fontSize: "0.72rem", color: "#475569", marginTop: 3 },
  errText:    { display: "block", fontSize: "0.72rem", color: "#f87171", marginTop: 3 },
  row:        { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid #0f172a" },
  rowLabel:   { fontSize: "0.8rem", color: "#64748b" },
  rowValue:   { fontSize: "0.9rem", fontWeight: 600, color: "#f1f5f9" },
  grid2:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
  grid3:      { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" },
  grid4:      { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem" },
  field:      { marginBottom: "0.75rem" },
  alertErr:   { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", padding: "0.6rem 0.875rem", color: "#f87171", fontSize: "0.83rem", marginBottom: "0.75rem" },
  alertOk:    { background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "8px", padding: "0.6rem 0.875rem", color: "#4ade80", fontSize: "0.83rem", marginBottom: "0.75rem" },
  tableWrap:  { background: "#111827", border: "1px solid #1e293b", borderRadius: "14px", overflow: "hidden" },
  table:      { width: "100%", borderCollapse: "collapse" },
  th:         { padding: "0.65rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #1e293b", background: "#0f172a", whiteSpace: "nowrap" },
  td:         { padding: "0.7rem 1rem", borderBottom: "1px solid #1a2332", fontSize: "0.83rem", verticalAlign: "middle" },
  btnPrimary: { padding: "0.55rem 1.25rem", borderRadius: "8px", border: "none", background: "linear-gradient(135deg,#1e40af,#2563eb)", color: "#fff", fontWeight: 700, fontSize: "0.83rem", cursor: "pointer" },
  btnGhost:   { padding: "0.55rem 1.25rem", borderRadius: "8px", border: "1.5px solid #1e293b", background: "transparent", color: "#94a3b8", fontWeight: 600, fontSize: "0.83rem", cursor: "pointer" },
  btnOrange:  { padding: "0.65rem 1.4rem", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#ea580c,#f97316)", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" },
};

function inp(err) {
  return {
    width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px",
    border: `1.5px solid ${err ? "#ef4444" : "#1e293b"}`,
    background: "#0f172a", color: "#e2e8f0",
    fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };
}

function Field({ label, hint, error, children }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      {children}
      {hint  && !error && <span style={s.hint}>{hint}</span>}
      {error && <span style={s.errText}>{error}</span>}
    </div>
  );
}

function StatusChip({ active }) {
  return (
    <span style={{ background: active ? "rgba(74,222,128,0.1)" : "rgba(100,116,139,0.1)", color: active ? "#4ade80" : "#64748b", padding: "2px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700 }}>
      {active ? "Active" : "Superseded"}
    </span>
  );
}

// ─── Tab: Global Controls ─────────────────────────────────────
function GlobalControls({ globals, onSaved }) {
  const [form, setForm]   = useState({
    inflation_adjustment: globals?.inflation_adjustment ?? 0,
    material_adjustment:  globals?.material_adjustment  ?? 0,
    default_margin:       globals?.default_margin        ?? 15,
    default_gst:          globals?.default_gst           ?? 18,
    waste_factor:         globals?.waste_factor          ?? 1.08,
    effective_from:       new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState(null);
  const [err,    setErr]    = useState(null);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave() {
    setSaving(true); setMsg(null); setErr(null);
    try {
      await updateGlobalRates(form);
      setMsg("Global rates updated successfully.");
      onSaved();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div style={s.section}>
        <h3 style={s.secTitle}>Current Active Settings</h3>
        {globals ? (
          <div>
            <div style={s.row}><span style={s.rowLabel}>Effective From</span><span style={s.rowValue}>{globals.effective_from}</span></div>
            <div style={s.row}><span style={s.rowLabel}>Inflation Adjustment</span><span style={s.rowValue}>{globals.inflation_adjustment}%</span></div>
            <div style={s.row}><span style={s.rowLabel}>Material Adjustment</span><span style={s.rowValue}>{globals.material_adjustment}%</span></div>
            <div style={s.row}><span style={s.rowLabel}>Default Margin</span><span style={s.rowValue}>{globals.default_margin}%</span></div>
            <div style={s.row}><span style={s.rowLabel}>Default GST</span><span style={s.rowValue}>{globals.default_gst}%</span></div>
            <div style={s.row}><span style={s.rowLabel}>Waste Factor</span><span style={{ ...s.rowValue, fontFamily: "monospace" }}>{globals.waste_factor}</span></div>
          </div>
        ) : (
          <p style={{ color: "#475569", fontSize: "0.85rem" }}>No active global rates found.</p>
        )}
      </div>

      <div style={s.section}>
        <h3 style={s.secTitle}>Update Global Rates</h3>
        <p style={{ margin: "0 0 1rem", fontSize: "0.82rem", color: "#64748b" }}>
          Creating a new rate supersedes the current active row. All future quotations will use the new rates from the effective date.
        </p>

        {err && <div style={s.alertErr}>⚠ {err}</div>}
        {msg && <div style={s.alertOk}>✓ {msg}</div>}

        <div style={s.grid3}>
          <Field label="Inflation Adjustment %" hint="Applied to all cost components">
            <input type="number" style={inp()} step="0.1" value={form.inflation_adjustment} onChange={e => set("inflation_adjustment", e.target.value)} />
          </Field>
          <Field label="Material Cost Adjustment %" hint="Additional % on paper costs only">
            <input type="number" style={inp()} step="0.1" value={form.material_adjustment} onChange={e => set("material_adjustment", e.target.value)} />
          </Field>
          <Field label="Waste Factor" hint="Manufacturing waste multiplier (1.08 = 8%)">
            <input type="number" style={inp()} step="0.001" value={form.waste_factor} onChange={e => set("waste_factor", e.target.value)} />
          </Field>
        </div>
        <div style={s.grid3}>
          <Field label="Default Margin %" hint="Global fallback margin">
            <input type="number" style={inp()} step="0.5" value={form.default_margin} onChange={e => set("default_margin", e.target.value)} />
          </Field>
          <Field label="Default GST %">
            <input type="number" style={inp()} step="0.5" value={form.default_gst} onChange={e => set("default_gst", e.target.value)} />
          </Field>
          <Field label="Effective From">
            <input type="date" style={inp()} value={form.effective_from} onChange={e => set("effective_from", e.target.value)} />
          </Field>
        </div>
        <Field label="Reason for Change">
          <input style={inp()} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="e.g. Q2 paper price revision" />
        </Field>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button onClick={handleSave} disabled={saving} style={s.btnPrimary}>
            {saving ? "Saving…" : "Update Global Rates"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Material Rates ──────────────────────────────────────
function MaterialRates({ materialRates, onSaved }) {
  const [form, setForm] = useState({
    paper_type: "Kraft", gsm_min: "", gsm_max: "",
    cost_per_kg: "", effective_from: new Date().toISOString().split("T")[0], notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState(null);
  const [err,    setErr]    = useState(null);
  const [errors, setErrors] = useState({});

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n={...e}; delete n[k]; return n; }); }

  function validate() {
    const e = {};
    if (!form.gsm_min) e.gsm_min = "Required";
    if (!form.gsm_max) e.gsm_max = "Required";
    if (!form.cost_per_kg) e.cost_per_kg = "Required";
    if (Number(form.gsm_min) >= Number(form.gsm_max)) e.gsm_max = "Must be greater than GSM min";
    return e;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setMsg(null); setErr(null);
    try {
      await updateMaterialRate({ ...form, gsm_min: Number(form.gsm_min), gsm_max: Number(form.gsm_max), cost_per_kg: Number(form.cost_per_kg) });
      setMsg("Material rate updated.");
      setForm(f => ({ ...f, gsm_min: "", gsm_max: "", cost_per_kg: "", notes: "" }));
      onSaved();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  const active = materialRates.filter(r => !r.effective_to);
  const history = materialRates.filter(r => r.effective_to);

  return (
    <div>
      <div style={s.section}>
        <h3 style={s.secTitle}>Active Material Rates</h3>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr>
              {["Paper Type", "GSM Range", "Cost/kg", "Effective From", "Status"].map(h =>
                <th key={h} style={s.th}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {active.length === 0 ? (
                <tr><td colSpan={5} style={{ ...s.td, textAlign: "center", color: "#475569" }}>No active rates</td></tr>
              ) : active.map(r => (
                <tr key={r.id}>
                  <td style={s.td}><span style={{ fontWeight: 600, color: "#e2e8f0" }}>{r.paper_type}</span></td>
                  <td style={s.td}><span style={{ fontFamily: "monospace", color: "#94a3b8" }}>{r.gsm_min}–{r.gsm_max} GSM</span></td>
                  <td style={s.td}><span style={{ color: "#4ade80", fontWeight: 700 }}>₹{r.cost_per_kg}/kg</span></td>
                  <td style={s.td}><span style={{ color: "#64748b" }}>{r.effective_from}</span></td>
                  <td style={s.td}><StatusChip active={true} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={s.section}>
        <h3 style={s.secTitle}>Update Material Rate</h3>
        {err && <div style={s.alertErr}>⚠ {err}</div>}
        {msg && <div style={s.alertOk}>✓ {msg}</div>}

        <div style={s.grid2}>
          <Field label="Paper Type">
            <select style={inp()} value={form.paper_type} onChange={e => set("paper_type", e.target.value)}>
              {PAPER_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Effective From">
            <input type="date" style={inp()} value={form.effective_from} onChange={e => set("effective_from", e.target.value)} />
          </Field>
        </div>
        <div style={s.grid3}>
          <Field label="GSM Min" error={errors.gsm_min}>
            <input type="number" style={inp(errors.gsm_min)} value={form.gsm_min} onChange={e => set("gsm_min", e.target.value)} placeholder="100" />
          </Field>
          <Field label="GSM Max" error={errors.gsm_max}>
            <input type="number" style={inp(errors.gsm_max)} value={form.gsm_max} onChange={e => set("gsm_max", e.target.value)} placeholder="150" />
          </Field>
          <Field label="Cost per KG (₹)" error={errors.cost_per_kg}>
            <input type="number" style={inp(errors.cost_per_kg)} step="0.01" value={form.cost_per_kg} onChange={e => set("cost_per_kg", e.target.value)} placeholder="34.00" />
          </Field>
        </div>
        <Field label="Reason for Change">
          <input style={inp()} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="e.g. Supplier price increase" />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleSave} disabled={saving} style={s.btnPrimary}>
            {saving ? "Saving…" : "Update Rate"}
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div style={s.section}>
          <h3 style={s.secTitle}>Rate History</h3>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead><tr>
                {["Paper Type", "GSM Range", "Cost/kg", "Active From", "Active To"].map(h =>
                  <th key={h} style={s.th}>{h}</th>
                )}
              </tr></thead>
              <tbody>
                {history.slice(0, 20).map(r => (
                  <tr key={r.id}>
                    <td style={s.td}><span style={{ color: "#64748b" }}>{r.paper_type}</span></td>
                    <td style={s.td}><span style={{ fontFamily: "monospace", color: "#475569" }}>{r.gsm_min}–{r.gsm_max} GSM</span></td>
                    <td style={s.td}><span style={{ color: "#475569" }}>₹{r.cost_per_kg}/kg</span></td>
                    <td style={s.td}><span style={{ color: "#475569" }}>{r.effective_from}</span></td>
                    <td style={s.td}><span style={{ color: "#475569" }}>{r.effective_to}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Margin Rules ────────────────────────────────────────
function MarginRules({ marginRules, customers, onSaved }) {
  const [form, setForm] = useState({
    rule_type: "global", ply_type: "", box_type: "",
    customer_id: "", margin_percent: "", notes: "",
    effective_from: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState(null);
  const [err,    setErr]    = useState(null);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.margin_percent) { setErr("Margin percent is required."); return; }
    setSaving(true); setMsg(null); setErr(null);
    try {
      await createMarginRule(form);
      setMsg("Margin rule created.");
      setForm(f => ({ ...f, margin_percent: "", notes: "" }));
      onSaved();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  const active = marginRules.filter(r => !r.effective_to);

  return (
    <div>
      <div style={s.section}>
        <h3 style={s.secTitle}>Active Margin Rules</h3>
        <p style={{ margin: "0 0 1rem", fontSize: "0.8rem", color: "#64748b" }}>
          Resolution order: Customer Contract → Customer Rule → Ply Type → Box Type → Global
        </p>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr>
              {["Rule Type", "Applies To", "Margin %", "Effective From"].map(h =>
                <th key={h} style={s.th}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {active.length === 0 ? (
                <tr><td colSpan={4} style={{ ...s.td, textAlign: "center", color: "#475569" }}>No margin rules</td></tr>
              ) : active.map(r => (
                <tr key={r.id}>
                  <td style={s.td}>
                    <span style={{ background: "rgba(37,99,235,0.15)", color: "#93c5fd", borderRadius: "20px", padding: "2px 8px", fontSize: "0.72rem", fontWeight: 700 }}>
                      {r.rule_type}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ color: "#94a3b8" }}>
                      {r.rule_type === "global"   ? "All quotations"
                       : r.rule_type === "ply_type" ? r.ply_type
                       : r.rule_type === "box_type" ? r.box_type
                       : customers.find(c => c.id === r.customer_id)?.company_name || r.customer_id}
                    </span>
                  </td>
                  <td style={s.td}><span style={{ color: "#4ade80", fontWeight: 700 }}>{r.margin_percent}%</span></td>
                  <td style={s.td}><span style={{ color: "#64748b" }}>{r.effective_from}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={s.section}>
        <h3 style={s.secTitle}>Create Margin Rule</h3>
        {err && <div style={s.alertErr}>⚠ {err}</div>}
        {msg && <div style={s.alertOk}>✓ {msg}</div>}

        <div style={s.grid2}>
          <Field label="Rule Type">
            <select style={inp()} value={form.rule_type} onChange={e => set("rule_type", e.target.value)}>
              {RULE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Margin %" hint="Overrides higher-level rules for matching items">
            <input type="number" style={inp()} step="0.5" value={form.margin_percent} onChange={e => set("margin_percent", e.target.value)} placeholder="15" />
          </Field>
        </div>

        {form.rule_type === "ply_type" && (
          <Field label="Ply Type">
            <select style={inp()} value={form.ply_type} onChange={e => set("ply_type", e.target.value)}>
              <option value="">— Select —</option>
              {PLY_TYPES.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
        )}
        {form.rule_type === "box_type" && (
          <Field label="Box Type">
            <select style={inp()} value={form.box_type} onChange={e => set("box_type", e.target.value)}>
              <option value="">— Select —</option>
              {BOX_TYPES.map(b => <option key={b}>{b}</option>)}
            </select>
          </Field>
        )}
        {form.rule_type === "customer" && (
          <Field label="Customer">
            <select style={inp()} value={form.customer_id} onChange={e => set("customer_id", e.target.value)}>
              <option value="">— Select customer —</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </Field>
        )}

        <div style={s.grid2}>
          <Field label="Effective From">
            <input type="date" style={inp()} value={form.effective_from} onChange={e => set("effective_from", e.target.value)} />
          </Field>
          <Field label="Notes">
            <input style={inp()} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional reason" />
          </Field>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleSave} disabled={saving} style={s.btnPrimary}>
            {saving ? "Saving…" : "Create Rule"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Customer Contracts ──────────────────────────────────
function CustomerContracts({ customers, onSaved }) {
  const [contracts, setContracts] = useState([]);
  const [form, setForm] = useState({
    customer_id: "", valid_from: "", valid_to: "",
    discount_percent: 0, fixed_margin: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState(null);
  const [err,    setErr]    = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => { loadContracts(); }, []);

  async function loadContracts() {
    const { data } = await supabase
      .from("pricing_customer_contracts")
      .select("*")
      .order("created_at", { ascending: false });
    setContracts(data || []);
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n={...e}; delete n[k]; return n; }); }

  function validate() {
    const e = {};
    if (!form.customer_id) e.customer_id = "Select a customer";
    if (!form.valid_from)  e.valid_from  = "Required";
    if (!form.valid_to)    e.valid_to    = "Required";
    if (form.valid_from && form.valid_to && form.valid_from >= form.valid_to) e.valid_to = "Must be after start date";
    return e;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setMsg(null); setErr(null);
    try {
      await createCustomerContract({
        ...form,
        discount_percent: Number(form.discount_percent) || 0,
        fixed_margin: form.fixed_margin !== "" ? Number(form.fixed_margin) : null,
      });
      setMsg("Customer contract created.");
      setForm({ customer_id: "", valid_from: "", valid_to: "", discount_percent: 0, fixed_margin: "", notes: "" });
      await loadContracts();
      onSaved();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function toggleContract(id, current) {
    await supabase.from("pricing_customer_contracts").update({ is_active: !current }).eq("id", id);
    await loadContracts();
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div style={s.section}>
        <h3 style={s.secTitle}>Active Contracts</h3>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr>
              {["Contract No", "Customer", "Valid From", "Valid To", "Discount", "Fixed Margin", "Status", "Action"].map(h =>
                <th key={h} style={s.th}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr><td colSpan={8} style={{ ...s.td, textAlign: "center", color: "#475569" }}>No contracts yet</td></tr>
              ) : contracts.map(c => {
                const expired = c.valid_to < today;
                return (
                  <tr key={c.id}>
                    <td style={s.td}><span style={{ fontFamily: "monospace", color: "#60a5fa", fontSize: "0.78rem" }}>{c.contract_number}</span></td>
                    <td style={s.td}><span style={{ fontWeight: 600, color: "#e2e8f0" }}>{customers.find(cu => cu.id === c.customer_id)?.company_name || "—"}</span></td>
                    <td style={s.td}><span style={{ color: "#64748b" }}>{c.valid_from}</span></td>
                    <td style={s.td}><span style={{ color: expired ? "#f87171" : "#64748b" }}>{c.valid_to}</span></td>
                    <td style={s.td}><span style={{ color: "#4ade80" }}>{c.discount_percent}%</span></td>
                    <td style={s.td}><span style={{ color: "#94a3b8" }}>{c.fixed_margin != null ? `${c.fixed_margin}%` : "—"}</span></td>
                    <td style={s.td}>
                      <span style={{ background: c.is_active && !expired ? "rgba(74,222,128,0.1)" : "rgba(239,68,68,0.1)", color: c.is_active && !expired ? "#4ade80" : "#f87171", padding: "2px 8px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700 }}>
                        {expired ? "Expired" : c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={s.td}>
                      {!expired && (
                        <button onClick={() => toggleContract(c.id, c.is_active)} style={{ ...s.btnGhost, padding: "3px 10px", fontSize: "0.75rem" }}>
                          {c.is_active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={s.section}>
        <h3 style={s.secTitle}>New Customer Contract</h3>
        {err && <div style={s.alertErr}>⚠ {err}</div>}
        {msg && <div style={s.alertOk}>✓ {msg}</div>}

        <Field label="Customer" error={errors.customer_id}>
          <select style={inp(errors.customer_id)} value={form.customer_id} onChange={e => set("customer_id", e.target.value)}>
            <option value="">— Select customer —</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </Field>
        <div style={s.grid2}>
          <Field label="Valid From" error={errors.valid_from}>
            <input type="date" style={inp(errors.valid_from)} value={form.valid_from} onChange={e => set("valid_from", e.target.value)} />
          </Field>
          <Field label="Valid To" error={errors.valid_to}>
            <input type="date" style={inp(errors.valid_to)} value={form.valid_to} onChange={e => set("valid_to", e.target.value)} />
          </Field>
        </div>
        <div style={s.grid2}>
          <Field label="Discount %" hint="Applied on top of margin. Cannot be combined with fixed margin.">
            <input type="number" style={inp()} step="0.5" value={form.discount_percent} onChange={e => set("discount_percent", e.target.value)} placeholder="0" />
          </Field>
          <Field label="Fixed Margin %" hint="Overrides all margin rules. Leave blank to use rules.">
            <input type="number" style={inp()} step="0.5" value={form.fixed_margin} onChange={e => set("fixed_margin", e.target.value)} placeholder="Optional" />
          </Field>
        </div>
        <Field label="Notes">
          <input style={inp()} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Contract terms, negotiated rates, etc." />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleSave} disabled={saving} style={s.btnPrimary}>
            {saving ? "Saving…" : "Create Contract"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Audit Log ───────────────────────────────────────────
function AuditLog() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState("all");

  const TABLE_FILTERS = [
    "all", "pricing_globals", "pricing_material_rates",
    "pricing_margin_rules", "pricing_customer_contracts",
  ];

  useEffect(() => { load(); }, [tableFilter]);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchPricingAuditLog({
        table_name: tableFilter !== "all" ? tableFilter : undefined,
        limit: 100,
      });
      setLogs(data);
    } finally { setLoading(false); }
  }

  const ACTION_COLORS = {
    created:     { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
    superseded:  { color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
    deactivated: { color: "#f87171", bg: "rgba(239,68,68,0.1)" },
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {TABLE_FILTERS.map(f => (
          <button key={f} onClick={() => setTableFilter(f)}
            style={{ padding: "0.4rem 0.875rem", borderRadius: "8px", border: tableFilter === f ? "none" : "1px solid #1e293b", background: tableFilter === f ? "#f97316" : "transparent", color: tableFilter === f ? "#fff" : "#64748b", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
            {f === "all" ? "All Tables" : f.replace("pricing_", "").replace("_", " ")}
          </button>
        ))}
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr>
            {["When", "Table", "Action", "Changed By", "Reason"].map(h =>
              <th key={h} style={s.th}>{h}</th>
            )}
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ ...s.td, textAlign: "center", color: "#475569" }}>Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} style={{ ...s.td, textAlign: "center", color: "#475569" }}>No audit entries yet</td></tr>
            ) : logs.map(log => {
              const ac = ACTION_COLORS[log.action] || ACTION_COLORS.created;
              return (
                <tr key={log.id}>
                  <td style={s.td}><span style={{ color: "#64748b", fontSize: "0.78rem" }}>{new Date(log.changed_at).toLocaleString("en-IN")}</span></td>
                  <td style={s.td}><span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#94a3b8" }}>{log.table_name.replace("pricing_", "")}</span></td>
                  <td style={s.td}>
                    <span style={{ background: ac.bg, color: ac.color, padding: "2px 8px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700 }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={s.td}><span style={{ color: "#94a3b8" }}>{log.changed_by || "system"}</span></td>
                  <td style={s.td}><span style={{ color: "#64748b", fontSize: "0.8rem" }}>{log.reason || "—"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function PricingManagement() {
  const [activeTab,    setActiveTab]    = useState(0);
  const [rates,        setRates]        = useState(null);
  const [customers,    setCustomers]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [ratesData, custData] = await Promise.all([
        fetchActiveRates(),
        supabase.from("customers").select("id, company_name").order("company_name"),
      ]);
      setRates(ratesData);
      setCustomers(custData.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <PageContainer
      title="Pricing Management"
      subtitle="Manage material rates, margin rules, and customer contracts."
    >
      {/* KPI row */}
      {rates && (
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
            <p className="text-slate-400">Global Margin</p>
            <h2 className="mt-4 text-5xl font-black text-blue-400">{rates.globals?.default_margin ?? "—"}%</h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
            <p className="text-slate-400">Material Adj.</p>
            <h2 className="mt-4 text-5xl font-black text-orange-400">{rates.globals?.material_adjustment ?? 0}%</h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
            <p className="text-slate-400">Active Rates</p>
            <h2 className="mt-4 text-5xl font-black text-green-400">{rates.materialRates?.filter(r => !r.effective_to).length ?? 0}</h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
            <p className="text-slate-400">Default GST</p>
            <h2 className="mt-4 text-5xl font-black text-purple-400">{rates.globals?.default_gst ?? 18}%</h2>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.5rem", borderBottom: "1px solid #1e293b", paddingBottom: "0" }}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{
            padding: "0.6rem 1.1rem", borderRadius: "8px 8px 0 0",
            border: "none",
            background: activeTab === i ? "#111827" : "transparent",
            color: activeTab === i ? "#f97316" : "#64748b",
            fontWeight: activeTab === i ? 700 : 600,
            fontSize: "0.83rem", cursor: "pointer",
            borderBottom: activeTab === i ? "2px solid #f97316" : "2px solid transparent",
          }}>
            {tab}
          </button>
        ))}
      </div>

      {error && <div style={s.alertErr}>⚠ {error}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#475569" }}>Loading pricing data…</div>
      ) : (
        <>
          {activeTab === 0 && <GlobalControls globals={rates?.globals} onSaved={load} />}
          {activeTab === 1 && <MaterialRates materialRates={rates?.materialRates || []} onSaved={load} />}
          {activeTab === 2 && <MarginRules marginRules={rates?.marginRules || []} customers={customers} onSaved={load} />}
          {activeTab === 3 && <CustomerContracts customers={customers} onSaved={load} />}
          {activeTab === 4 && <AuditLog />}
        </>
      )}
    </PageContainer>
  );
}
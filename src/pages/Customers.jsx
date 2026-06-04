import { useEffect, useState } from "react";
import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";
import { useNavigate } from "react-router-dom";
import { fetchCustomers, createCustomer } from "../services/customerService";

const columns = [
  { key: "customer_code", label: "Code" },
  { key: "company_name",  label: "Company" },
  { key: "contact_person", label: "Contact" },
  { key: "phone",          label: "Phone" },
  { key: "outstanding_amount", label: "Outstanding" },
  { key: "status",         label: "Status" },
];

const EMPTY_FORM = {
  company_name:   "",
  contact_person: "",
  phone:          "",
  email:          "",
  address:        "",
};

function validate(form) {
  const errors = {};
  if (!form.company_name.trim())   errors.company_name   = "Company name is required.";
  if (!form.contact_person.trim()) errors.contact_person = "Contact person is required.";
  if (!form.phone.trim())          errors.phone          = "Phone number is required.";
  else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address.";
  return errors;
}

// ── Inline modal component ────────────────────────────────────
function NewCustomerModal({ onClose, onSuccess }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [apiError, setApiError] = useState(null);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  async function handleSave() {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setApiError(null);
    try {
      const { error } = await createCustomer({
        company_name:   form.company_name.trim(),
        contact_person: form.contact_person.trim(),
        phone:          form.phone.trim(),
        email:          form.email.trim()   || null,
        address:        form.address.trim() || null,
      });
      if (error) throw new Error(error.message);
      onSuccess();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── styles ──
  const inp = (err) => ({
    width: "100%", padding: "0.55rem 0.75rem",
    borderRadius: "8px",
    border: `1.5px solid ${err ? "#ef4444" : "#1e293b"}`,
    background: "#0f172a", color: "#e2e8f0",
    fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", padding: "1rem",
    }}>
      <div style={{
        width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto",
        background: "#111827", borderRadius: "16px",
        border: "1px solid #1e293b",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "1.25rem 1.5rem", borderBottom: "1px solid #1e293b",
        }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
            New Customer
          </h2>
          <button onClick={onClose} style={{
            padding: "4px 10px", borderRadius: "6px",
            border: "1px solid #1e293b", background: "#0f172a",
            color: "#94a3b8", cursor: "pointer", fontWeight: 700, fontSize: "1rem",
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

          {apiError && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px", padding: "0.6rem 0.875rem",
              color: "#f87171", fontSize: "0.83rem",
            }}>⚠ {apiError}</div>
          )}

          {/* company_name */}
          <div>
            <label style={labelStyle}>Company Name <span style={{ color: "#f87171" }}>*</span></label>
            <input
              style={inp(errors.company_name)}
              value={form.company_name}
              onChange={(e) => set("company_name", e.target.value)}
              placeholder="e.g. Reliance Industries Ltd"
            />
            {errors.company_name && <p style={errStyle}>{errors.company_name}</p>}
          </div>

          {/* contact_person */}
          <div>
            <label style={labelStyle}>Contact Person <span style={{ color: "#f87171" }}>*</span></label>
            <input
              style={inp(errors.contact_person)}
              value={form.contact_person}
              onChange={(e) => set("contact_person", e.target.value)}
              placeholder="e.g. Ramesh Kumar"
            />
            {errors.contact_person && <p style={errStyle}>{errors.contact_person}</p>}
          </div>

          {/* phone */}
          <div>
            <label style={labelStyle}>Phone <span style={{ color: "#f87171" }}>*</span></label>
            <input
              style={inp(errors.phone)}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="9876543210"
              maxLength={10}
            />
            {errors.phone
              ? <p style={errStyle}>{errors.phone}</p>
              : <p style={hintStyle}>10-digit Indian mobile number</p>}
          </div>

          {/* email */}
          <div>
            <label style={labelStyle}>Email <span style={{ color: "#475569" }}>(optional)</span></label>
            <input
              type="email"
              style={inp(errors.email)}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="purchase@company.com"
            />
            {errors.email && <p style={errStyle}>{errors.email}</p>}
          </div>

          {/* address */}
          <div>
            <label style={labelStyle}>Address <span style={{ color: "#475569" }}>(optional)</span></label>
            <textarea
              style={{ ...inp(false), minHeight: "70px", resize: "vertical" }}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Full business address"
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: "0.75rem",
          padding: "1rem 1.5rem", borderTop: "1px solid #1e293b",
        }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: "0.6rem 1.25rem", borderRadius: "8px",
              border: "1.5px solid #1e293b", background: "#0f172a",
              color: "#94a3b8", fontWeight: 600, fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none",
              background: saving ? "#1e3a8a" : "linear-gradient(135deg,#1e40af,#2563eb)",
              color: "#fff", fontWeight: 700, fontSize: "0.875rem",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
            }}
          >{saving ? "Saving…" : "Save Customer"}</button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: "0.75rem", fontWeight: 700,
  color: "#94a3b8", textTransform: "uppercase",
  letterSpacing: "0.06em", marginBottom: "0.35rem",
};
const errStyle  = { margin: "4px 0 0", fontSize: "0.75rem", color: "#f87171", fontWeight: 500 };
const hintStyle = { margin: "4px 0 0", fontSize: "0.75rem", color: "#64748b" };

// ── Main Page ─────────────────────────────────────────────────
export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { loadCustomers(); }, []);

  async function loadCustomers() {
    try {
      const result = await fetchCustomers();
      if (result.data) setCustomers(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  const activeCustomers  = customers.filter((c) => c.status === "active");
  const outstandingAmount = customers.reduce((sum, c) => sum + Number(c.outstanding_amount || 0), 0);

  return (
    <PageContainer
      title="Customers"
      subtitle="Manage customer relationships and account activity."
    >
      {/* NEW CUSTOMER BUTTON */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: "0.65rem 1.4rem", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg,#ea580c,#f97316)",
            color: "#fff", fontWeight: 700, fontSize: "0.9rem",
            cursor: "pointer", boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
          }}
        >+ New Customer</button>
      </div>

      {/* KPI CARDS */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">Total Customers</p>
          <h2 className="mt-4 text-5xl font-black text-blue-400">{customers.length}</h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">Active Customers</p>
          <h2 className="mt-4 text-5xl font-black text-green-400">{activeCustomers.length}</h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">Outstanding Amount</p>
          <h2 className="mt-4 text-5xl font-black text-orange-400">
            ₹{outstandingAmount.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* CUSTOMER TABLE */}
      <DataTable
        columns={columns}
        data={customers}
        onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
      />

      {/* MODAL */}
      {modalOpen && (
        <NewCustomerModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            loadCustomers();
          }}
        />
      )}
    </PageContainer>
  );
}
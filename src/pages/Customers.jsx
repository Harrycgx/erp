import { useEffect, useState } from "react";
import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";
import { useNavigate } from "react-router-dom";
import { fetchCustomers, createCustomer } from "../services/customerService";

// Column array rewired to use only the real data keys coming from the database
const columns = [
  { key: "customer_id", label: "Customer ID" },
  { key: "legal_entity_name", label: "Company Name" },
  { key: "plant_id", label: "Plant ID" },
];

const EMPTY_FORM = {
  company_name: "",
  plant_id: "",
};

function validate(form) {
  const errors = {};
  if (!form.company_name.trim()) errors.company_name = "Company name is required.";
  return errors;
}

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
        company_name: form.company_name.trim(),
        plant_id: form.plant_id.trim() || null,
      });
      if (error) throw new Error(error.message);
      onSuccess();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

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

        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {apiError && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px", padding: "0.6rem 0.875rem",
              color: "#f87171", fontSize: "0.83rem",
            }}>⚠ {apiError}</div>
          )}

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

          <div>
            <label style={labelStyle}>Plant ID <span style={{ color: "#475569" }}>(optional)</span></label>
            <input
              style={inp(false)}
              value={form.plant_id}
              onChange={(e) => set("plant_id", e.target.value)}
              placeholder="UUID Format"
            />
          </div>
        </div>

        <div style={{
          display: "flex", justifyContent: "flex-end", gap: "0.75rem",
          padding: "1rem 1.5rem", borderTop: "1px solid #1e293b",
        }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: "0.6rem 1.25rem", borderRadius: "8px",
              border: "1px solid #1e293b", background: "#0f172a",
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

  return (
    <PageContainer
      title="Customers"
      subtitle="Manage customer relationships and account activity."
    >
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

      <div className="mb-8 grid gap-6 md:grid-cols-1">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">Total Customers</p>
          <h2 className="mt-4 text-5xl font-black text-blue-400">{customers.length}</h2>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        onRowClick={(customer) => navigate(`/customers/${customer.customer_id}`)}
      />

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
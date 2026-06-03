// ============================================================
// QuoteDetail.jsx
// Full detail view for a single quotation
// Props: quotation, onEdit, onClose, onRefresh
// ============================================================

import { useState } from "react";
import {
  approveQuotation,
  convertToOrder,
} from "../features/quotations/services/quotationService";
import {
  submitQuotation,
  approveQuotation,
  rejectQuotation,
  cancelQuotation,
} from "../features/quotations/services/quotationService";
import { formatINR } from "../features/quotations/utils/pricingEngine";

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  Draft:     { color: "#94a3b8", bg: "rgba(100,116,139,0.15)", dot: "#64748b" },
  Submitted: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  dot: "#f59e0b" },
  Approved:  { color: "#4ade80", bg: "rgba(74,222,128,0.1)",  dot: "#22c55e" },
  Rejected:  { color: "#f87171", bg: "rgba(248,113,113,0.1)", dot: "#ef4444" },
  Cancelled: { color: "#64748b", bg: "rgba(100,116,139,0.1)", dot: "#475569" },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.Draft;
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: "4px 12px", borderRadius: "20px",
      fontSize: "0.8rem", fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: "6px",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot }} />
      {status}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div style={st.section}>
      <h3 style={st.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, mono, highlight }) {
  return (
    <div style={st.row}>
      <span style={st.rowLabel}>{label}</span>
      <span style={{
        ...st.rowValue,
        fontFamily: mono ? "monospace" : "inherit",
        color: highlight ? "#60a5fa" : "#f1f5f9",
        fontWeight: highlight ? 700 : 500,
        fontSize: highlight ? "1rem" : "0.9rem",
      }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function PricingRow({ label, value, highlight, divider }) {
  if (divider) return <div style={st.divider} />;
  return (
    <div style={{
      ...st.pRow,
      background: highlight ? "rgba(37,99,235,0.1)" : "transparent",
    }}>
      <span style={{ ...st.pLabel, fontWeight: highlight ? 700 : 400 }}>{label}</span>
      <span style={{ ...st.pValue, color: highlight ? "#60a5fa" : "#94a3b8", fontWeight: highlight ? 700 : 400 }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function QuoteDetail({ quotation, onEdit, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!quotation) return null;

  const q = quotation;
  const canEdit = ["Draft", "Submitted"].includes(q.status);
  const canSubmit = q.status === "Draft";
  const canApprove = q.status === "Submitted";
  const canReject = q.status === "Submitted";
  const canCancel = ["Draft", "Submitted"].includes(q.status);

  async function act(fn) {
    setLoading(true);
    setError(null);
    try {
      await fn();
      await onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={st.wrapper}>

      {/* ── Header ── */}
      <div style={st.header}>
        <div style={st.headerLeft}>
          <button onClick={onClose} style={st.backBtn}>← Quotations</button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={st.quoteNum}>{q.quotation_number}</span>
              <StatusBadge status={q.status} />
              {q.converted_to_order && (
                <span style={st.convertedChip}>✓ Converted to Order</span>
              )}
            </div>
            <p style={st.headerSub}>
              Created {q.created_at ? new Date(q.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>

        <div style={st.headerActions}>
          {canEdit && (
            <button onClick={onEdit} style={st.btnSecondary} disabled={loading}>
              ✏ Edit
            </button>
          )}
          {canSubmit && (
            <button onClick={() => act(() => submitQuotation(q.id))} style={st.btnBlue} disabled={loading}>
              📤 Submit for Approval
            </button>
          )}
          {canApprove && (
            <button onClick={() =>
  act(async () => {
    await approveQuotation(q.id);
    await convertToOrder(q.id);
  })
} style={st.btnGreen} disabled={loading}>
              ✓ Approve
            </button>
          )}
          {canReject && !showRejectInput && (
            <button onClick={() => setShowRejectInput(true)} style={st.btnRed} disabled={loading}>
              ✕ Reject
            </button>
          )}
          {canCancel && !showRejectInput && (
            <button onClick={() => act(() => cancelQuotation(q.id))} style={st.btnGhost} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={st.alertError} onClick={() => setError(null)}>
          ⚠ {error} <span style={{ opacity: 0.5 }}>✕</span>
        </div>
      )}

      {/* ── Reject input ── */}
      {showRejectInput && (
        <div style={st.rejectBox}>
          <p style={st.rejectLabel}>Reason for rejection:</p>
          <input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            style={st.rejectInput}
          />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button
              onClick={() => act(() => rejectQuotation(q.id, rejectReason)).then(() => setShowRejectInput(false))}
              style={st.btnRed}
              disabled={loading}
            >
              Confirm Reject
            </button>
            <button onClick={() => setShowRejectInput(false)} style={st.btnGhost}>Cancel</button>
          </div>
        </div>
      )}

      <div style={st.grid}>

        {/* ── Left column ── */}
        <div style={st.leftCol}>

          <Section title="Customer Details">
            <Row label="Customer Name" value={q.customer_name} />
            <Row label="Contact Person" value={q.contact_person} />
            <Row label="Phone" value={q.phone} />
            <Row label="Email" value={q.email} />
            <Row label="GST Number" value={q.gst_number} mono />
          </Section>

          <Section title="Box Specifications">
            <Row label="Box Type" value={q.box_type} />
            <Row label="Dimensions (L×W×H)" value={q.length && q.width && q.height ? `${q.length} × ${q.width} × ${q.height} mm` : "—"} />
            <Row label="Ply Type" value={q.ply_type} />
            <Row label="Flute Type" value={q.flute_type} />
            <Row label="Paper GSM" value={q.paper_gsm ? `${q.paper_gsm} GSM` : "—"} />
          </Section>

          <Section title="Printing">
            <Row label="Printing Type" value={q.printing_type} />
            <Row label="Number of Colours" value={q.printing_type === "None" ? "N/A" : q.printing_colors} />
          </Section>

          {q.remarks && (
            <Section title="Remarks">
              <p style={st.remarks}>{q.remarks}</p>
            </Section>
          )}

        </div>

        {/* ── Right column ── */}
        <div style={st.rightCol}>

          <Section title="Pricing Breakdown">
            <div style={st.pricingTable}>
              <PricingRow label="Quantity" value={`${Number(q.quantity || 0).toLocaleString("en-IN")} pcs`} />
              <PricingRow label="Material Cost" value={formatINR(q.material_cost)} />
              <PricingRow label="Printing Cost" value={formatINR(q.printing_cost)} />
              <PricingRow label="Labour Cost" value={formatINR(q.labour_cost)} />
              <PricingRow divider />
              <PricingRow label={`Margin (${q.margin_percent}%)`} value={formatINR(q.margin_amount)} />
              <PricingRow label="Subtotal" value={formatINR(q.subtotal)} />
              <PricingRow label={`GST (${q.gst_percent}%)`} value={formatINR(q.gst_amount)} />
              <PricingRow divider />
              <PricingRow label="Unit Price (excl. GST)" value={formatINR(q.unit_price)} highlight />
              <PricingRow label="Total Final Price (incl. GST)" value={formatINR(q.final_price)} highlight />
            </div>
          </Section>

          <Section title="Workflow Info">
            <Row label="Status" value={<StatusBadge status={q.status} />} />
            {q.submitted_at && <Row label="Submitted At" value={new Date(q.submitted_at).toLocaleString("en-IN")} />}
            {q.approved_at && <Row label="Approved At" value={new Date(q.approved_at).toLocaleString("en-IN")} />}
            {q.approved_by && <Row label="Approved By" value={q.approved_by} />}
            {q.rejected_at && <Row label="Rejected At" value={new Date(q.rejected_at).toLocaleString("en-IN")} />}
            {q.rejected_reason && <Row label="Rejection Reason" value={q.rejected_reason} />}
            {q.converted_to_order && <Row label="Order Linked" value="Yes" highlight />}
          </Section>

        </div>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const st = {
  wrapper: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: "#e2e8f0",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  headerLeft: { display: "flex", alignItems: "flex-start", gap: "1rem" },
  headerActions: { display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" },
  backBtn: {
    padding: "0.4rem 0.9rem", borderRadius: "8px",
    border: "1.5px solid #1e293b", background: "#111827",
    color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem",
    cursor: "pointer", whiteSpace: "nowrap",
  },
  quoteNum: {
    fontFamily: "monospace", fontWeight: 800,
    fontSize: "1.2rem", color: "#60a5fa",
  },
  headerSub: { margin: "0.3rem 0 0", fontSize: "0.8rem", color: "#64748b" },
  convertedChip: {
    fontSize: "0.72rem", fontWeight: 600, color: "#4ade80",
    background: "rgba(74,222,128,0.1)", borderRadius: "20px",
    padding: "2px 8px", border: "1px solid rgba(74,222,128,0.2)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    alignItems: "start",
  },
  leftCol: { display: "flex", flexDirection: "column", gap: "1rem" },
  rightCol: { display: "flex", flexDirection: "column", gap: "1rem" },
  section: {
    background: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem",
  },
  sectionTitle: {
    margin: "0 0 0.875rem",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #1e293b",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.45rem 0",
    borderBottom: "1px solid #0f172a",
    gap: "1rem",
  },
  rowLabel: { fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap" },
  rowValue: { fontSize: "0.9rem", color: "#f1f5f9", textAlign: "right", wordBreak: "break-word" },
  remarks: {
    margin: 0, fontSize: "0.875rem", color: "#94a3b8",
    lineHeight: 1.6, whiteSpace: "pre-wrap",
  },
  pricingTable: {
    border: "1px solid #1e293b",
    borderRadius: "8px",
    overflow: "hidden",
  },
  pRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0.875rem",
    borderBottom: "1px solid #1a2332",
  },
  pLabel: { fontSize: "0.85rem", color: "#94a3b8" },
  pValue: { fontSize: "0.85rem", fontVariantNumeric: "tabular-nums" },
  divider: { height: "2px", background: "#1e293b", margin: "0.15rem 0" },
  alertError: {
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "10px", padding: "0.7rem 1rem",
    color: "#f87171", fontSize: "0.85rem",
    marginBottom: "1rem", cursor: "pointer",
    display: "flex", justifyContent: "space-between",
  },
  rejectBox: {
    background: "#111827", border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "10px", padding: "1rem",
    marginBottom: "1rem",
  },
  rejectLabel: { margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#94a3b8" },
  rejectInput: {
    width: "100%", padding: "0.5rem 0.75rem",
    borderRadius: "8px", border: "1.5px solid #1e293b",
    background: "#0f172a", color: "#e2e8f0",
    fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box",
  },
  btnBlue: {
    padding: "0.5rem 1.1rem", borderRadius: "8px", border: "none",
    background: "linear-gradient(135deg, #1e40af, #2563eb)",
    color: "#fff", fontWeight: 700, fontSize: "0.85rem",
    cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
  },
  btnGreen: {
    padding: "0.5rem 1.1rem", borderRadius: "8px", border: "none",
    background: "linear-gradient(135deg, #15803d, #16a34a)",
    color: "#fff", fontWeight: 700, fontSize: "0.85rem",
    cursor: "pointer",
  },
  btnRed: {
    padding: "0.5rem 1.1rem", borderRadius: "8px", border: "none",
    background: "#dc2626", color: "#fff",
    fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
  },
  btnSecondary: {
    padding: "0.5rem 1.1rem", borderRadius: "8px",
    border: "1.5px solid #1e293b", background: "#0f172a",
    color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem",
    cursor: "pointer",
  },
  btnGhost: {
    padding: "0.5rem 1.1rem", borderRadius: "8px",
    border: "1.5px solid #1e293b", background: "transparent",
    color: "#64748b", fontWeight: 600, fontSize: "0.85rem",
    cursor: "pointer",
  },
};
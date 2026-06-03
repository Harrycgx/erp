// ============================================================
// QuoteDetail.jsx
// Read-only quotation detail view with:
// - Full field display in sections
// - Workflow action buttons (Submit / Approve / Reject / Cancel / Convert)
// - Print / PDF trigger
// ============================================================

import { useRef, useState } from "react";
import {
  approveQuotation,
  convertToOrder,
} from "../features/quotations/services/quotationService";
import { formatINR } from "./pricingEngine";
import {
  submitQuotation,
  approveQuotation,
  rejectQuotation,
  cancelQuotation,
  convertToOrder,
} from "./quotationService";

const STATUS_COLORS = {
  Draft:     { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af" },
  Submitted: { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b" },
  Approved:  { bg: "#f0fdf4", text: "#166534", dot: "#22c55e" },
  Rejected:  { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
  Cancelled: { bg: "#f9fafb", text: "#6b7280", dot: "#d1d5db" },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Draft;
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: "4px 14px", borderRadius: "20px",
      fontSize: "0.8rem", fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: "6px",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function DetailSection({ title, icon, children }) {
  return (
    <div style={s.section}>
      <div style={s.secHeader}>
        <span style={s.secIcon}>{icon}</span>
        <span style={s.secTitle}>{title}</span>
      </div>
      <div style={s.secBody}>{children}</div>
    </div>
  );
}

function DetailGrid({ children, cols = 3 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "1.25rem" }}>
      {children}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div style={s.item}>
      <div style={s.itemLabel}>{label}</div>
      <div style={s.itemValue}>{value || "—"}</div>
    </div>
  );
}

function PriceRow({ label, value, bold, indent, divider }) {
  return (
    <>
      {divider && <div style={s.priceDivider} />}
      <div style={{ ...s.priceRow, paddingLeft: indent ? "1.5rem" : "0.75rem" }}>
        <span style={{ fontWeight: bold ? 700 : 400, fontSize: bold ? "0.9rem" : "0.85rem", color: "#374151" }}>
          {label}
        </span>
        <span style={{ fontWeight: bold ? 700 : 400, fontSize: bold ? "0.9rem" : "0.85rem", color: bold ? "#1e40af" : "#374151" }}>
          {value}
        </span>
      </div>
    </>
  );
}

export default function QuoteDetail({ quotation, onEdit, onClose, onRefresh }) {
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const printRef = useRef();

  if (!quotation) return null;

  const canEdit   = quotation.status === "Draft";
  const canSubmit = quotation.status === "Draft";
  const canApprove  = quotation.status === "Submitted";
  const canReject   = quotation.status === "Submitted";
  const canCancel   = ["Draft", "Submitted"].includes(quotation.status);
  const canConvert  = quotation.status === "Approved" && !quotation.converted_to_order;

  const handleAction = async (action, label) => {
    setActionLoading(label);
    setError(null);
    setSuccessMsg(null);
    try {
      await action();
      setSuccessMsg(`${label} successful.`);
      onRefresh?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("quote-print-area");
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Quotation ${quotation.quotation_number}</title>
      <style>
        @media print { body { margin: 0; } }
        body { font-family: 'Segoe UI', Arial, sans-serif; }
      </style></head>
      <body>${printContent.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div style={s.wrapper}>

      {/* ── Header Bar ── */}
      <div style={s.headerBar}>
        <div>
          <div style={s.quotNumber}>{quotation.quotation_number}</div>
          <div style={s.quotMeta}>
            Created {new Date(quotation.created_at).toLocaleString("en-IN")}
            {quotation.updated_at !== quotation.created_at &&
              ` · Updated ${new Date(quotation.updated_at).toLocaleString("en-IN")}`}
          </div>
        </div>
        <div style={s.headerRight}>
          <StatusBadge status={quotation.status} />
          {quotation.converted_to_order && (
            <span style={s.convertedBadge}>✅ Converted to Order</span>
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && <div style={s.alertError}>⚠ {error}</div>}
      {successMsg && <div style={s.alertSuccess}>✓ {successMsg}</div>}
      {quotation.rejected_reason && (
        <div style={s.alertError}>
          <strong>Rejection Reason:</strong> {quotation.rejected_reason}
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div style={s.actionsRow}>
        {canEdit && (
          <button onClick={onEdit} style={s.btnSecondary}>✏️ Edit</button>
        )}
        {canSubmit && (
          <button
            onClick={() => handleAction(() => submitQuotation(quotation.id), "Submit")}
            disabled={!!actionLoading}
            style={s.btnWarning}
          >
            {actionLoading === "Submit" ? "Submitting…" : "📤 Submit for Approval"}
          </button>
        )}
        {canApprove && (
          <button
            onClick={() =>
  handleAction(
    async () => {
      await approveQuotation(quotation.id);
      await convertToOrder(quotation.id);
    },
    "Approve & Convert"
  )
}
            disabled={!!actionLoading}
            style={s.btnSuccess}
          >
            {actionLoading === "Approve" ? "Approving…" : "✅ Approve"}
          </button>
        )}
        {canReject && (
          <button onClick={() => setRejectModal(true)} style={s.btnDanger}>
            ❌ Reject
          </button>
        )}
        {canConvert && (
          <button
            onClick={() => handleAction(() => convertToOrder(quotation.id), "Convert")}
            disabled={!!actionLoading}
            style={s.btnPrimary}
          >
            {actionLoading === "Convert" ? "Converting…" : "🔄 Convert to Order"}
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => handleAction(() => cancelQuotation(quotation.id), "Cancel")}
            disabled={!!actionLoading}
            style={s.btnGhost}
          >
            🚫 Cancel Quotation
          </button>
        )}
        <button onClick={handlePrint} style={s.btnGhost}>🖨 Print / PDF</button>
        <button onClick={onClose} style={s.btnGhost}>← Back</button>
      </div>

      {/* ── Detail Sections ── */}
      <DetailSection title="Customer Details" icon="🏢">
        <DetailGrid cols={3}>
          <DetailItem label="Customer Name" value={quotation.customer_name} />
          <DetailItem label="Contact Person" value={quotation.contact_person} />
          <DetailItem label="Phone" value={quotation.phone} />
          <DetailItem label="Email" value={quotation.email} />
          <DetailItem label="GST Number" value={quotation.gst_number} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Box Specifications" icon="📦">
        <DetailGrid cols={3}>
          <DetailItem label="Box Type" value={quotation.box_type} />
          <DetailItem label="Dimensions (L×W×H)" value={`${quotation.length} × ${quotation.width} × ${quotation.height} mm`} />
          <DetailItem label="Ply Type" value={quotation.ply_type} />
          <DetailItem label="Flute Type" value={quotation.flute_type} />
          <DetailItem label="Paper GSM" value={`${quotation.paper_gsm} GSM`} />
          <DetailItem label="Board Area" value={`${quotation.board_area_sqm} m²/box`} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Printing" icon="🎨">
        <DetailGrid cols={3}>
          <DetailItem label="Printing Type" value={quotation.printing_type} />
          <DetailItem label="No. of Colours" value={quotation.printing_type === "None" ? "N/A" : quotation.printing_colors} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Commercial" icon="💼">
        <DetailGrid cols={3}>
          <DetailItem label="Quantity" value={quotation.quantity?.toLocaleString("en-IN") + " pcs"} />
          <DetailItem label="Unit Price (excl. GST)" value={formatINR(quotation.unit_price)} />
          <DetailItem label="Final Price (incl. GST)" value={formatINR(quotation.final_price)} />
        </DetailGrid>
        {quotation.remarks && (
          <div style={{ marginTop: "1rem" }}>
            <DetailItem label="Remarks" value={quotation.remarks} />
          </div>
        )}
      </DetailSection>

      <DetailSection title="Pricing Breakdown" icon="📊">
        <div style={s.priceBreakdown}>
          <PriceRow label="Material Cost" value={formatINR(quotation.material_cost)} indent />
          <PriceRow label="Printing Cost" value={formatINR(quotation.printing_cost)} indent />
          <PriceRow label="Labour Cost" value={formatINR(quotation.labour_cost)} indent />
          <PriceRow label={`Margin (${quotation.margin_percent}%)`} value={formatINR(quotation.margin_amount)} indent />
          <PriceRow label="Subtotal" value={formatINR(quotation.subtotal)} divider />
          <PriceRow label={`GST (${quotation.gst_percent}%)`} value={formatINR(quotation.gst_amount)} indent />
          <PriceRow label="TOTAL FINAL PRICE" value={formatINR(quotation.final_price)} bold divider />
        </div>
      </DetailSection>

      {(quotation.order_id || quotation.production_job_id) && (
        <DetailSection title="Linked Records" icon="🔗">
          <DetailGrid cols={2}>
            {quotation.order_id && <DetailItem label="Order ID" value={quotation.order_id} />}
            {quotation.production_job_id && <DetailItem label="Production Job ID" value={quotation.production_job_id} />}
          </DetailGrid>
        </DetailSection>
      )}

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>Reject Quotation</h3>
            <p style={s.modalSubtitle}>Please provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="e.g. Price too high, specifications unclear..."
              style={s.modalTextarea}
            />
            <div style={s.modalActions}>
              <button onClick={() => setRejectModal(false)} style={s.btnGhost}>Cancel</button>
              <button
                disabled={!rejectReason.trim() || !!actionLoading}
                onClick={() => {
                  setRejectModal(false);
                  handleAction(() => rejectQuotation(quotation.id, rejectReason), "Reject");
                }}
                style={s.btnDanger}
              >
                {actionLoading === "Reject" ? "Rejecting…" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hidden Print Area ── */}
      <div id="quote-print-area" style={{ display: "none" }}>
        <div style={{ fontFamily: "Arial, sans-serif", padding: "40px", color: "#111" }}>
          <h1 style={{ color: "#1e3a8a" }}>QUOTATION — {quotation.quotation_number}</h1>
          <p><strong>Customer:</strong> {quotation.customer_name} | <strong>Contact:</strong> {quotation.contact_person} | <strong>Phone:</strong> {quotation.phone}</p>
          <hr />
          <h3>Box Specifications</h3>
          <p>{quotation.box_type} | {quotation.length}×{quotation.width}×{quotation.height}mm | {quotation.ply_type} | {quotation.flute_type} | {quotation.paper_gsm} GSM</p>
          <p>Printing: {quotation.printing_type} {quotation.printing_type !== "None" ? `(${quotation.printing_colors} colour(s))` : ""}</p>
          <hr />
          <h3>Pricing</h3>
          <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
            <tr><td>Quantity</td><td>{quotation.quantity} pcs</td></tr>
            <tr><td>Unit Price (excl. GST)</td><td>{formatINR(quotation.unit_price)}</td></tr>
            <tr><td>Subtotal</td><td>{formatINR(quotation.subtotal)}</td></tr>
            <tr><td>GST ({quotation.gst_percent}%)</td><td>{formatINR(quotation.gst_amount)}</td></tr>
            <tr><td><strong>TOTAL</strong></td><td><strong>{formatINR(quotation.final_price)}</strong></td></tr>
          </table>
          {quotation.remarks && <p><strong>Remarks:</strong> {quotation.remarks}</p>}
        </div>
      </div>

    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const s = {
  wrapper: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: "#111827",
    maxWidth: "960px",
    margin: "0 auto",
  },
  headerBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.25rem",
    padding: "1.25rem 1.5rem",
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  quotNumber: { fontSize: "1.3rem", fontWeight: 800, color: "#1e3a8a", fontFamily: "monospace" },
  quotMeta: { fontSize: "0.78rem", color: "#9ca3af", marginTop: "0.25rem" },
  headerRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" },
  convertedBadge: {
    background: "#f0fdf4", color: "#166534",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "0.75rem", fontWeight: 600,
  },
  alertError: {
    background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "8px", padding: "0.75rem 1rem",
    color: "#991b1b", fontSize: "0.85rem",
    marginBottom: "0.75rem",
  },
  alertSuccess: {
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    borderRadius: "8px", padding: "0.75rem 1rem",
    color: "#166534", fontSize: "0.85rem",
    marginBottom: "0.75rem",
  },
  actionsRow: {
    display: "flex", flexWrap: "wrap", gap: "0.5rem",
    marginBottom: "1.25rem",
  },
  btnPrimary: { padding: "0.55rem 1.25rem", borderRadius: "8px", border: "none", background: "#1e40af", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" },
  btnSuccess: { padding: "0.55rem 1.25rem", borderRadius: "8px", border: "none", background: "#16a34a", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" },
  btnDanger: { padding: "0.55rem 1.25rem", borderRadius: "8px", border: "none", background: "#dc2626", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" },
  btnWarning: { padding: "0.55rem 1.25rem", borderRadius: "8px", border: "none", background: "#d97706", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" },
  btnSecondary: { padding: "0.55rem 1.25rem", borderRadius: "8px", border: "1.5px solid #d1d5db", background: "#fff", color: "#374151", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" },
  btnGhost: { padding: "0.55rem 1.25rem", borderRadius: "8px", border: "1.5px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" },
  section: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    marginBottom: "0.75rem",
    overflow: "hidden",
  },
  secHeader: {
    display: "flex", alignItems: "center", gap: "0.6rem",
    padding: "0.75rem 1.25rem",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  secIcon: { fontSize: "1rem" },
  secTitle: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" },
  secBody: { padding: "1.25rem" },
  item: {},
  itemLabel: { fontSize: "0.72rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" },
  itemValue: { fontSize: "0.9rem", color: "#111827", fontWeight: 500 },
  priceBreakdown: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
    maxWidth: "420px",
  },
  priceRow: {
    display: "flex", justifyContent: "space-between",
    padding: "0.45rem 0.75rem",
    borderBottom: "1px solid #f3f4f6",
  },
  priceDivider: { borderTop: "2px solid #dbeafe", margin: "0.2rem 0" },
  modalOverlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff", borderRadius: "12px",
    padding: "2rem", width: "100%", maxWidth: "480px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  modalTitle: { margin: "0 0 0.25rem", fontSize: "1.1rem", fontWeight: 800 },
  modalSubtitle: { margin: "0 0 1rem", color: "#6b7280", fontSize: "0.9rem" },
  modalTextarea: {
    width: "100%", borderRadius: "8px", border: "1.5px solid #d1d5db",
    padding: "0.6rem 0.75rem", fontSize: "0.9rem",
    resize: "vertical", fontFamily: "inherit",
    boxSizing: "border-box",
  },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" },
};
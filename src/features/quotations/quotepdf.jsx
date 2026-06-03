// ============================================================
// QuotePDF.jsx
// Printable / PDF-exportable quotation document
// Uses react-to-print or browser window.print()
// Import and render inside a modal, then call handlePrint()
// ============================================================

import { forwardRef } from "react";
import { formatINR } from "./pricingEngine";

// ─── PDF Template (rendered off-screen, passed to react-to-print) ──

const QuotePDF = forwardRef(function QuotePDF({ quotation }, ref) {
  if (!quotation) return null;

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const validUntil = new Date(
    new Date(quotation.created_at).getTime() + 30 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div ref={ref} style={pdf.page}>

      {/* ── Header ── */}
      <div style={pdf.header}>
        <div>
          <div style={pdf.companyName}>YOUR COMPANY NAME</div>
          <div style={pdf.companyTagline}>Corrugated Packaging Solutions</div>
          <div style={pdf.companyAddress}>
            Plot No. 12, Industrial Area, Phase II<br />
            Ludhiana, Punjab – 141003<br />
            GST: 03ABCDE1234F1Z5 &nbsp;|&nbsp; info@yourcompany.com
          </div>
        </div>
        <div style={pdf.quoteRefBlock}>
          <div style={pdf.quoteRefLabel}>QUOTATION</div>
          <div style={pdf.quoteRefNumber}>{quotation.quotation_number}</div>
          <div style={pdf.quoteRefMeta}>Date: {today}</div>
          <div style={pdf.quoteRefMeta}>Valid Until: {validUntil}</div>
          <div style={{ ...pdf.statusBadge, background: STATUS_COLORS[quotation.status] || "#6b7280" }}>
            {quotation.status}
          </div>
        </div>
      </div>

      <div style={pdf.divider} />

      {/* ── Bill To ── */}
      <div style={pdf.twoCol}>
        <div style={pdf.billBlock}>
          <div style={pdf.blockLabel}>BILL TO</div>
          <div style={pdf.billName}>{quotation.customer_name}</div>
          <div style={pdf.billMeta}>Attn: {quotation.contact_person}</div>
          <div style={pdf.billMeta}>📞 {quotation.phone}</div>
          {quotation.email && <div style={pdf.billMeta}>✉ {quotation.email}</div>}
          {quotation.gst_number && <div style={pdf.billMeta}>GST: {quotation.gst_number}</div>}
        </div>
        <div style={pdf.specBlock}>
          <div style={pdf.blockLabel}>BOX SPECIFICATIONS</div>
          <table style={pdf.specTable}>
            <tbody>
              <SpecRow label="Box Type" value={quotation.box_type} />
              <SpecRow label="Dimensions (L×W×H)" value={`${quotation.length} × ${quotation.width} × ${quotation.height} mm`} />
              <SpecRow label="Ply Type" value={quotation.ply_type} />
              <SpecRow label="Flute Type" value={quotation.flute_type} />
              <SpecRow label="Paper GSM" value={`${quotation.paper_gsm} GSM`} />
              <SpecRow label="Printing" value={quotation.printing_type === "None" ? "No Printing" : `${quotation.printing_type} (${quotation.printing_colors} Colour${quotation.printing_colors !== 1 ? "s" : ""})`} />
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pricing Table ── */}
      <div style={pdf.section}>
        <div style={pdf.blockLabel}>PRICING DETAILS</div>
        <table style={pdf.table}>
          <thead>
            <tr style={pdf.thead}>
              <th style={{ ...pdf.th, width: "50%" }}>Description</th>
              <th style={{ ...pdf.th, textAlign: "right" }}>Cost (INR)</th>
              <th style={{ ...pdf.th, textAlign: "right" }}>Qty</th>
              <th style={{ ...pdf.th, textAlign: "right" }}>Total (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={pdf.td}>
                <strong>{quotation.box_type}</strong><br />
                <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {quotation.length}×{quotation.width}×{quotation.height}mm &nbsp;|&nbsp;
                  {quotation.ply_type} &nbsp;|&nbsp; {quotation.flute_type} &nbsp;|&nbsp; {quotation.paper_gsm} GSM
                </span>
              </td>
              <td style={{ ...pdf.td, textAlign: "right" }}>{formatINR(quotation.unit_price)}</td>
              <td style={{ ...pdf.td, textAlign: "right" }}>{quotation.quantity?.toLocaleString("en-IN")}</td>
              <td style={{ ...pdf.td, textAlign: "right" }}>{formatINR(quotation.subtotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div style={pdf.totalsBlock}>
          <TotalRow label="Subtotal" value={formatINR(quotation.subtotal)} />
          <TotalRow label={`GST (${quotation.gst_percent}%)`} value={formatINR(quotation.gst_amount)} />
          <div style={pdf.totalDivider} />
          <TotalRow label="TOTAL AMOUNT" value={formatINR(quotation.final_price)} bold />
        </div>
      </div>

      {/* ── Cost Breakdown ── */}
      <div style={pdf.section}>
        <div style={pdf.blockLabel}>COST BREAKDOWN (Per Lot)</div>
        <div style={pdf.breakdownGrid}>
          <BreakdownCard label="Material Cost" value={formatINR(quotation.material_cost)} icon="🧱" />
          <BreakdownCard label="Printing Cost" value={formatINR(quotation.printing_cost)} icon="🎨" />
          <BreakdownCard label="Labour Cost" value={formatINR(quotation.labour_cost)} icon="⚙️" />
          <BreakdownCard label="Margin" value={`${quotation.margin_percent}% (${formatINR(quotation.margin_amount)})`} icon="📈" />
        </div>
      </div>

      {/* ── Remarks ── */}
      {quotation.remarks && (
        <div style={pdf.section}>
          <div style={pdf.blockLabel}>REMARKS</div>
          <p style={pdf.remarks}>{quotation.remarks}</p>
        </div>
      )}

      {/* ── Terms ── */}
      <div style={pdf.termsSection}>
        <div style={pdf.blockLabel}>TERMS & CONDITIONS</div>
        <ol style={pdf.termsList}>
          <li>Prices are valid for 30 days from the date of quotation.</li>
          <li>Payment terms: 50% advance, balance before dispatch.</li>
          <li>Delivery: 10–14 working days from order confirmation.</li>
          <li>GST @ {quotation.gst_percent}% applicable as above.</li>
          <li>Minimum order quantity as per quotation.</li>
        </ol>
      </div>

      {/* ── Signature ── */}
      <div style={pdf.signatureBlock}>
        <div style={pdf.signatureCol}>
          <div style={pdf.signatureLine} />
          <div style={pdf.signatureLabel}>Authorised Signatory</div>
          <div style={pdf.signatureCompany}>For YOUR COMPANY NAME</div>
        </div>
        <div style={pdf.signatureCol}>
          <div style={pdf.signatureLine} />
          <div style={pdf.signatureLabel}>Customer Acceptance</div>
          <div style={pdf.signatureCompany}>For {quotation.customer_name}</div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={pdf.footer}>
        This is a computer-generated quotation. For queries, contact us at info@yourcompany.com
      </div>

    </div>
  );
});

export default QuotePDF;

// ─── Sub-components ──────────────────────────────────────────

function SpecRow({ label, value }) {
  return (
    <tr>
      <td style={pdf.specTdLabel}>{label}</td>
      <td style={pdf.specTdValue}>{value}</td>
    </tr>
  );
}

function TotalRow({ label, value, bold }) {
  return (
    <div style={pdf.totalRow}>
      <span style={{ fontWeight: bold ? 700 : 400, fontSize: bold ? "1rem" : "0.875rem" }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 400, fontSize: bold ? "1rem" : "0.875rem" }}>{value}</span>
    </div>
  );
}

function BreakdownCard({ label, value, icon }) {
  return (
    <div style={pdf.breakdownCard}>
      <span style={pdf.breakdownIcon}>{icon}</span>
      <span style={pdf.breakdownLabel}>{label}</span>
      <span style={pdf.breakdownValue}>{value}</span>
    </div>
  );
}

// ─── Status colours ──────────────────────────────────────────
const STATUS_COLORS = {
  Draft: "#6b7280",
  Submitted: "#d97706",
  Approved: "#16a34a",
  Rejected: "#dc2626",
  Cancelled: "#9ca3af",
};

// ─── PDF styles ──────────────────────────────────────────────
const pdf = {
  page: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontSize: "0.875rem",
    color: "#111827",
    padding: "2.5rem",
    maxWidth: "800px",
    margin: "0 auto",
    background: "#fff",
    lineHeight: 1.5,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
  },
  companyName: { fontSize: "1.5rem", fontWeight: 800, color: "#1e3a8a", letterSpacing: "-0.02em" },
  companyTagline: { fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" },
  companyAddress: { fontSize: "0.78rem", color: "#6b7280", lineHeight: 1.8 },
  quoteRefBlock: { textAlign: "right" },
  quoteRefLabel: { fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", color: "#6b7280", textTransform: "uppercase" },
  quoteRefNumber: { fontSize: "1.2rem", fontWeight: 800, color: "#1e3a8a", fontFamily: "monospace" },
  quoteRefMeta: { fontSize: "0.78rem", color: "#6b7280" },
  statusBadge: {
    display: "inline-block",
    marginTop: "0.5rem",
    padding: "2px 10px",
    borderRadius: "20px",
    color: "#fff",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  divider: { borderTop: "2px solid #1e3a8a", marginBottom: "1.5rem" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" },
  billBlock: {},
  specBlock: {},
  blockLabel: {
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: "0.5rem",
  },
  billName: { fontSize: "1rem", fontWeight: 700 },
  billMeta: { fontSize: "0.8rem", color: "#4b5563", lineHeight: 1.8 },
  specTable: { width: "100%", borderCollapse: "collapse" },
  specTdLabel: { fontSize: "0.78rem", color: "#6b7280", padding: "2px 0", paddingRight: "1rem", whiteSpace: "nowrap" },
  specTdValue: { fontSize: "0.78rem", color: "#111827", fontWeight: 500, padding: "2px 0" },
  section: { marginBottom: "1.5rem" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" },
  thead: { background: "#1e3a8a" },
  th: { color: "#fff", padding: "0.5rem 0.75rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600 },
  td: { padding: "0.6rem 0.75rem", borderBottom: "1px solid #f3f4f6", verticalAlign: "top" },
  totalsBlock: { marginLeft: "auto", width: "300px", marginTop: "0.5rem" },
  totalRow: { display: "flex", justifyContent: "space-between", padding: "0.3rem 0" },
  totalDivider: { borderTop: "1.5px solid #1e3a8a", margin: "0.4rem 0" },
  breakdownGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" },
  breakdownCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  breakdownIcon: { fontSize: "1.25rem" },
  breakdownLabel: { fontSize: "0.72rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600 },
  breakdownValue: { fontSize: "0.85rem", fontWeight: 700, color: "#111827" },
  remarks: { fontSize: "0.85rem", color: "#4b5563", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "0.75rem", margin: 0 },
  termsSection: { borderTop: "1px solid #e5e7eb", paddingTop: "1rem", marginBottom: "1.5rem" },
  termsList: { fontSize: "0.78rem", color: "#6b7280", paddingLeft: "1.25rem", lineHeight: 2 },
  signatureBlock: { display: "flex", justifyContent: "space-between", marginTop: "2rem", marginBottom: "1.5rem" },
  signatureCol: { textAlign: "center", width: "200px" },
  signatureLine: { borderTop: "1px solid #374151", marginBottom: "0.4rem", width: "100%" },
  signatureLabel: { fontSize: "0.78rem", fontWeight: 600 },
  signatureCompany: { fontSize: "0.72rem", color: "#6b7280" },
  footer: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "0.75rem",
    fontSize: "0.72rem",
    color: "#9ca3af",
    textAlign: "center",
  },
};
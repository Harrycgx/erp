// ============================================================
// Quotations.jsx
// Main Quotations module — ERP-grade list view
// Features: Status filter tabs, search, stats bar, action modals
// Views: List → Detail | List → Create | List → Edit
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  fetchQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
} from "../features/quotations/services/quotationService";
import {
  calcPricing,
  formatINR,
} from "../features/quotations/utils/pricingEngine";
import QuoteForm from "../features/quotations/QuoteForm";
import QuoteDetail from "./QuoteDetail";
import supabase from "../lib/supabase";

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  All:       { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", dot: "#64748b" },
  Draft:     { color: "#94a3b8", bg: "rgba(100,116,139,0.15)", dot: "#64748b" },
  Submitted: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", dot: "#f59e0b" },
  Approved:  { color: "#4ade80", bg: "rgba(74,222,128,0.1)", dot: "#22c55e" },
  Rejected:  { color: "#f87171", bg: "rgba(248,113,113,0.1)", dot: "#ef4444" },
  Cancelled: { color: "#64748b", bg: "rgba(100,116,139,0.1)", dot: "#475569" },
};

const ALL_STATUSES = ["All", "Draft", "Submitted", "Approved", "Rejected", "Cancelled"];

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.Draft;
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "0.75rem", fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: "5px",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── Stats card ──────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ ...st.statCard, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{value}</div>
      <div style={st.statLabel}>{label}</div>
      {sub && <div style={st.statSub}>{sub}</div>}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────
function EmptyState({ onNew }) {
  return (
    <div style={st.emptyState}>
      <div style={st.emptyIcon}>📋</div>
      <h3 style={st.emptyTitle}>No Quotations Found</h3>
      <p style={st.emptyText}>Create your first quotation to get started.</p>
      <button onClick={onNew} style={st.btnPrimary}>+ New Quotation</button>
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────
function QuoteRow({ quote, onView, onDelete, isDeleting }) {
  const canDelete = quote.status === "Draft";

  return (
    <tr
      style={st.tr}
      onClick={() => onView(quote)}
    >
      <td style={st.td}>
        <span style={st.quoteNum}>{quote.quotation_number}</span>
      </td>
      <td style={st.td}>
        <div style={st.customerName}>{quote.customer_name}</div>
        <div style={st.customerContact}>{quote.contact_person} · {quote.phone}</div>
      </td>
      <td style={st.td}>
        <div style={st.specText}>{quote.box_type?.split("(")[0].trim()}</div>
        <div style={st.specSub}>{quote.length}×{quote.width}×{quote.height}mm · {quote.ply_type}</div>
      </td>
      <td style={{ ...st.td, textAlign: "right" }}>
        <div style={st.qtyText}>{Number(quote.quantity || 0).toLocaleString("en-IN")}</div>
        <div style={st.specSub}>pcs</div>
      </td>
      <td style={{ ...st.td, textAlign: "right" }}>
        <div style={st.priceText}>{formatINR(quote.final_price)}</div>
        <div style={st.specSub}>{formatINR(quote.unit_price)}/unit</div>
      </td>
      <td style={st.td}>
        <StatusBadge status={quote.status} />
        {quote.converted_to_order && (
          <div style={st.convertedChip}>Converted</div>
        )}
      </td>
      <td style={st.td}>
        <div style={st.specSub}>{new Date(quote.created_at).toLocaleDateString("en-IN")}</div>
      </td>
      <td style={{ ...st.td, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
        <div style={st.rowActions}>
          <button onClick={() => onView(quote)} style={st.iconBtn} title="View">👁</button>
          {canDelete && (
            <button
              onClick={() => onDelete(quote)}
              style={{ ...st.iconBtn, color: "#ef4444" }}
              title="Delete"
              disabled={isDeleting}
            >
              🗑
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────
function DeleteModal({ quote, onConfirm, onCancel, isLoading }) {
  return (
    <div style={st.overlay}>
      <div style={st.modal}>
        <h3 style={st.modalTitle}>Delete Quotation?</h3>
        <p style={st.modalText}>
          You are about to permanently delete <strong>{quote.quotation_number}</strong> for{" "}
          <strong>{quote.customer_name}</strong>. This action cannot be undone.
        </p>
        <div style={st.modalActions}>
          <button onClick={onCancel} style={st.btnSecondary} disabled={isLoading}>Cancel</button>
          <button onClick={onConfirm} style={st.btnDanger} disabled={isLoading}>
            {isLoading ? "Deleting…" : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View state: "list" | "create" | "edit" | "detail"
  const [view, setView] = useState("list");
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Filtering
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Modals
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [globalSuccess, setGlobalSuccess] = useState(null);

  const loadQuotations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuotations();
      setQuotations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuotations();
  }, [loadQuotations]);

  // ── Stats
  const stats = {
    total: quotations.length,
    draft: quotations.filter((q) => q.status === "Draft").length,
    submitted: quotations.filter((q) => q.status === "Submitted").length,
    approved: quotations.filter((q) => q.status === "Approved").length,
    totalValue: quotations
      .filter((q) => q.status === "Approved")
      .reduce((sum, q) => sum + (Number(q.final_price) || 0), 0),
  };

  // ── Filtered list
  const filtered = quotations.filter((q) => {
    const matchStatus = statusFilter === "All" || q.status === statusFilter;
    const matchSearch =
      !search ||
      q.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      q.quotation_number?.toLowerCase().includes(search.toLowerCase()) ||
      q.contact_person?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ── Handlers
  const handleCreate = async (payload) => {
    setFormLoading(true);
    setGlobalError(null);
    try {
      await createQuotation(payload);
      setGlobalSuccess("Quotation created successfully.");
      setView("list");
      await loadQuotations();
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    setFormLoading(true);
    setGlobalError(null);
    try {
      await updateQuotation(selectedQuote.id, payload);
      setGlobalSuccess("Quotation updated successfully.");
      setView("list");
      setSelectedQuote(null);
      await loadQuotations();
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteQuotation(deleteTarget.id);
      setGlobalSuccess(`${deleteTarget.quotation_number} deleted.`);
      setDeleteTarget(null);
      await loadQuotations();
    } catch (err) {
      setGlobalError(err.message);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewDetail = (quote) => {
    setSelectedQuote(quote);
    setView("detail");
  };

  const handleEditFromDetail = () => {
    setView("edit");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedQuote(null);
    loadQuotations();
  };

  const dismissAlert = () => {
    setGlobalError(null);
    setGlobalSuccess(null);
  };

  // ─── RENDER: Create Form ──────────────────────────────────
  if (view === "create") {
    return (
      <div style={st.pageWrapper}>
        <div style={st.pageHeader}>
          <button onClick={() => setView("list")} style={st.backBtn}>← Quotations</button>
          <h1 style={st.pageTitle}>New Quotation</h1>
        </div>
        <QuoteForm
          onSubmit={handleCreate}
          onCancel={() => setView("list")}
          isLoading={formLoading}
        />
      </div>
    );
  }

  // ─── RENDER: Edit Form ────────────────────────────────────
  if (view === "edit" && selectedQuote) {
    return (
      <div style={st.pageWrapper}>
        <div style={st.pageHeader}>
          <button onClick={() => setView("detail")} style={st.backBtn}>← Back to Detail</button>
          <h1 style={st.pageTitle}>Edit {selectedQuote.quotation_number}</h1>
        </div>
        <QuoteForm
          initialData={selectedQuote}
          onSubmit={handleUpdate}
          onCancel={() => setView("detail")}
          isLoading={formLoading}
        />
      </div>
    );
  }

  // ─── RENDER: Detail View ──────────────────────────────────
  if (view === "detail" && selectedQuote) {
    return (
      <div style={st.pageWrapper}>
        <QuoteDetail
          quotation={selectedQuote}
          onEdit={handleEditFromDetail}
          onClose={handleBackToList}
          onRefresh={async () => {
            const fresh = await fetchQuotations();
            setQuotations(fresh);
            const updated = fresh.find((q) => q.id === selectedQuote.id);
            if (updated) setSelectedQuote(updated);
          }}
        />
      </div>
    );
  }

  // ─── RENDER: List View ────────────────────────────────────
  return (
    <div style={st.pageWrapper}>

      {/* ── Page Header ── */}
      <div style={st.listHeader}>
        <div>
          <h1 style={st.pageTitle}>Quotations</h1>
          <p style={st.pageSubtitle}>Manage customer quotations and convert to orders</p>
        </div>
        <button onClick={() => setView("create")} style={st.btnPrimary}>
          + New Quotation
        </button>
      </div>

      {/* ── Global Alerts ── */}
      {globalError && (
        <div style={st.alertError} onClick={dismissAlert}>
          ⚠ {globalError} <span style={st.dismissX}>✕</span>
        </div>
      )}
      {globalSuccess && (
        <div style={st.alertSuccess} onClick={dismissAlert}>
          ✓ {globalSuccess} <span style={st.dismissX}>✕</span>
        </div>
      )}

      {/* ── Stats Bar ── */}
      <div style={st.statsBar}>
        <StatCard label="Total Quotations" value={stats.total} color="#6366f1" />
        <StatCard label="Drafts" value={stats.draft} color="#9ca3af" />
        <StatCard label="Pending Approval" value={stats.submitted} color="#f59e0b" />
        <StatCard label="Approved" value={stats.approved} color="#22c55e" />
        <StatCard label="Approved Value" value={formatINR(stats.totalValue)} color="#2563eb" sub="Total" />
      </div>

      {/* ── Filters ── */}
      <div style={st.filtersRow}>
        <div style={st.statusTabs}>
          {ALL_STATUSES.map((status) => {
            const count = status === "All" ? quotations.length : quotations.filter((q) => q.status === status).length;
            const active = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  ...st.tabBtn,
                  background: active ? "#2563eb" : "transparent",
                  color: active ? "#fff" : "#94a3b8",
                  border: active ? "1.5px solid #2563eb" : "1.5px solid #1e293b",
                }}
              >
                {status}
                <span style={{
                  ...st.tabCount,
                  background: active ? "rgba(255,255,255,0.2)" : "#1e293b",
                  color: active ? "#fff" : "#64748b",
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer, quotation no..."
          style={st.searchInput}
        />
      </div>

      {/* ── Main Table ── */}
      <div style={st.tableWrapper}>
        {loading ? (
          <div style={st.loadingState}>
            <div style={st.spinner} />
            <p>Loading quotations…</p>
          </div>
        ) : error ? (
          <div style={st.alertError}>⚠ {error}</div>
        ) : filtered.length === 0 ? (
          <EmptyState onNew={() => setView("create")} />
        ) : (
          <table style={st.table}>
            <thead>
              <tr style={st.thead}>
                <th style={st.th}>Quot. No.</th>
                <th style={st.th}>Customer</th>
                <th style={st.th}>Box Specs</th>
                <th style={{ ...st.th, textAlign: "right" }}>Qty</th>
                <th style={{ ...st.th, textAlign: "right" }}>Value</th>
                <th style={st.th}>Status</th>
                <th style={st.th}>Date</th>
                <th style={{ ...st.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((quote) => (
                <QuoteRow
                  key={quote.id}
                  quote={quote}
                  onView={handleViewDetail}
                  onDelete={setDeleteTarget}
                  isDeleting={deleteLoading}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer count ── */}
      {!loading && filtered.length > 0 && (
        <div style={st.tableFooter}>
          Showing {filtered.length} of {quotations.length} quotations
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <DeleteModal
          quote={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isLoading={deleteLoading}
        />
      )}

    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const st = {
  pageWrapper: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: "#e2e8f0",
    padding: "1.5rem",
    maxWidth: "1280px",
    margin: "0 auto",
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
  },
  pageTitle: { margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" },
  pageSubtitle: { margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" },
  backBtn: {
    padding: "0.4rem 0.9rem", borderRadius: "8px",
    border: "1.5px solid #1e293b", background: "#111827",
    color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem",
    cursor: "pointer",
  },
  statsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "0.75rem",
    marginBottom: "1.25rem",
  },
  statCard: {
    background: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "0.875rem 1.1rem",
  },
  statLabel: { fontSize: "0.72rem", color: "#64748b", fontWeight: 600, marginTop: "0.2rem", textTransform: "uppercase", letterSpacing: "0.05em" },
  statSub: { fontSize: "0.7rem", color: "#475569" },
  filtersRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  statusTabs: { display: "flex", gap: "0.4rem", flexWrap: "wrap" },
  tabBtn: {
    padding: "0.38rem 0.75rem",
    borderRadius: "7px",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    transition: "all 0.15s",
  },
  tabCount: {
    borderRadius: "20px",
    padding: "1px 6px",
    fontSize: "0.68rem",
    fontWeight: 700,
  },
  searchInput: {
    padding: "0.5rem 0.9rem",
    borderRadius: "8px",
    border: "1.5px solid #1e293b",
    background: "#111827",
    fontSize: "0.875rem",
    color: "#e2e8f0",
    width: "260px",
    outline: "none",
  },
  tableWrapper: {
    background: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#0f172a", borderBottom: "1px solid #1e293b" },
  th: {
    padding: "0.65rem 1rem",
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #1a2332",
    cursor: "pointer",
    transition: "background 0.1s",
  },
  td: { padding: "0.7rem 1rem", verticalAlign: "middle" },
  quoteNum: { fontFamily: "monospace", fontWeight: 700, fontSize: "0.85rem", color: "#60a5fa" },
  customerName: { fontWeight: 600, fontSize: "0.875rem", color: "#e2e8f0" },
  customerContact: { fontSize: "0.75rem", color: "#64748b", marginTop: "2px" },
  specText: { fontSize: "0.8rem", fontWeight: 500, color: "#cbd5e1" },
  specSub: { fontSize: "0.72rem", color: "#64748b", marginTop: "2px" },
  qtyText: { fontWeight: 600, fontSize: "0.875rem", color: "#e2e8f0" },
  priceText: { fontWeight: 700, fontSize: "0.875rem", color: "#f1f5f9" },
  convertedChip: {
    marginTop: "4px",
    fontSize: "0.68rem",
    fontWeight: 600,
    color: "#4ade80",
    background: "rgba(74,222,128,0.1)",
    borderRadius: "20px",
    padding: "1px 7px",
    display: "inline-block",
    border: "1px solid rgba(74,222,128,0.2)",
  },
  rowActions: { display: "flex", gap: "0.35rem", justifyContent: "flex-end" },
  iconBtn: {
    padding: "4px 8px",
    borderRadius: "6px",
    border: "1px solid #1e293b",
    background: "#0f172a",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  tableFooter: {
    textAlign: "center",
    padding: "0.65rem",
    fontSize: "0.78rem",
    color: "#475569",
    borderTop: "1px solid #1e293b",
    background: "#111827",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
  },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    padding: "2.5rem",
    color: "#64748b",
  },
  spinner: {
    width: "26px", height: "26px",
    border: "3px solid #1e293b",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  emptyState: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "0.5rem", padding: "2.5rem 2rem", textAlign: "center",
  },
  emptyIcon: { fontSize: "2rem", opacity: 0.5 },
  emptyTitle: { margin: 0, fontSize: "1rem", fontWeight: 700, color: "#94a3b8" },
  emptyText: { margin: 0, color: "#64748b", fontSize: "0.825rem" },
  alertError: {
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "10px", padding: "0.7rem 1rem",
    color: "#f87171", fontSize: "0.85rem",
    marginBottom: "1rem", cursor: "pointer",
    display: "flex", justifyContent: "space-between",
  },
  alertSuccess: {
    background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
    borderRadius: "10px", padding: "0.7rem 1rem",
    color: "#4ade80", fontSize: "0.85rem",
    marginBottom: "1rem", cursor: "pointer",
    display: "flex", justifyContent: "space-between",
  },
  dismissX: { fontWeight: 700, opacity: 0.4, fontSize: "0.9rem" },
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(2px)",
  },
  modal: {
    background: "#111827", borderRadius: "14px",
    padding: "2rem", width: "100%", maxWidth: "440px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
    border: "1px solid #1e293b",
  },
  modalTitle: { margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 800, color: "#f1f5f9" },
  modalText: { color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.6 },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" },
  btnPrimary: {
    padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none",
    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
    color: "#fff", fontWeight: 700, fontSize: "0.9rem",
    cursor: "pointer", boxShadow: "0 2px 12px rgba(37,99,235,0.35)",
  },
  btnSecondary: {
    padding: "0.55rem 1.25rem", borderRadius: "8px",
    border: "1.5px solid #1e293b", background: "#0f172a",
    color: "#94a3b8", fontWeight: 600, fontSize: "0.875rem",
    cursor: "pointer",
  },
  btnDanger: {
    padding: "0.55rem 1.25rem", borderRadius: "8px", border: "none",
    background: "#dc2626", color: "#fff",
    fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
  },
};
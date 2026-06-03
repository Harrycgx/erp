// ============================================================
// ProductMaster.jsx
// Product Master — list, create, edit, delete, view
// Location: src/pages/ProductMaster.jsx
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  fetchCustomersForSelect,
} from "../features/products/services/productService";
import ProductForm from "../features/products/ProductForm";

// ─── Helpers ─────────────────────────────────────────────────
function dim(p) {
  if (!p.length || !p.width || !p.height) return "—";
  return `${p.length}×${p.width}×${p.height} mm`;
}

function ActiveBadge({ active }) {
  return (
    <span style={{
      background: active ? "rgba(74,222,128,0.1)" : "rgba(100,116,139,0.1)",
      color: active ? "#4ade80" : "#64748b",
      padding: "2px 10px", borderRadius: "20px",
      fontSize: "0.72rem", fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: "5px",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: active ? "#22c55e" : "#475569",
      }} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{ ...st.statCard, borderTopColor: color }}>
      <div style={{ ...st.statValue, color }}>{value}</div>
      <div style={st.statLabel}>{label}</div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────
function ProductDetail({ product, onEdit, onClose, onToggleActive, onDelete }) {
  const [busy, setBusy] = useState(false);

  async function act(fn) {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  }

  function Row({ label, value }) {
    return (
      <div style={st.detailRow}>
        <span style={st.detailLabel}>{label}</span>
        <span style={st.detailValue}>{value ?? "—"}</span>
      </div>
    );
  }

  return (
    <div style={st.detailWrapper}>
      <div style={st.detailHeader}>
        <div>
          <button onClick={onClose} style={st.backBtn}>← Products</button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
            <span style={st.detailCode}>{product.product_code}</span>
            <ActiveBadge active={product.is_active} />
          </div>
          <h2 style={st.detailName}>{product.product_name}</h2>
          {product.customer_name && (
            <p style={st.detailCustomer}>👤 {product.customer_name}</p>
          )}
        </div>
        <div style={st.detailActions}>
          <button onClick={onEdit} style={st.btnSecondary} disabled={busy}>✏ Edit</button>
          <button
            onClick={() => act(() => onToggleActive(product.id, !product.is_active))}
            style={product.is_active ? st.btnGhost : st.btnGreen}
            disabled={busy}
          >
            {product.is_active ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete "${product.product_name}"? This cannot be undone.`)) {
                act(() => onDelete(product.id));
              }
            }}
            style={st.btnRed}
            disabled={busy}
          >
            🗑 Delete
          </button>
        </div>
      </div>

      <div style={st.detailGrid}>
        <div style={st.detailSection}>
          <h3 style={st.sectionTitle}>Box Specifications</h3>
          <Row label="Box Type"    value={product.box_type} />
          <Row label="Dimensions"  value={dim(product)} />
          <Row label="Ply Type"    value={product.ply_type} />
          <Row label="Flute Type"  value={product.flute_type} />
          <Row label="Paper GSM"   value={product.gsm ? `${product.gsm} GSM` : "—"} />
        </div>
        <div style={st.detailSection}>
          <h3 style={st.sectionTitle}>Printing & Notes</h3>
          <Row label="Printing Type" value={product.printing_type} />
          <Row label="Status"        value={<ActiveBadge active={product.is_active} />} />
          <Row label="Created"       value={product.created_at ? new Date(product.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
          {product.notes && (
            <div style={{ marginTop: "0.75rem" }}>
              <div style={st.detailLabel}>Notes</div>
              <p style={st.notesText}>{product.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ProductMaster() {
  const [products,  setProducts]  = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all"); // all | active | inactive

  // view: "list" | "detail" | "create" | "edit"
  const [view,     setView]     = useState("list");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, custs] = await Promise.all([
        fetchProducts({ search }),
        fetchCustomersForSelect(),
      ]);
      setProducts(prods);
      setCustomers(custs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  // ── filtered list ──
  const displayed = products.filter((p) => {
    if (filter === "active"   && !p.is_active) return false;
    if (filter === "inactive" &&  p.is_active) return false;
    return true;
  });

  // ── stats ──
  const total    = products.length;
  const active   = products.filter((p) => p.is_active).length;
  const inactive = total - active;

  // ── CRUD handlers ──
  async function handleCreate(payload) {
    await createProduct(payload);
    await load();
    setView("list");
  }

  async function handleUpdate(payload) {
    await updateProduct(selected.id, payload);
    await load();
    setView("list");
    setSelected(null);
  }

  async function handleDelete(id) {
    await deleteProduct(id);
    await load();
    setView("list");
    setSelected(null);
  }

  async function handleToggleActive(id, isActive) {
    await toggleProductActive(id, isActive);
    await load();
    // refresh selected if in detail view
    if (selected?.id === id) {
      setSelected((p) => ({ ...p, is_active: isActive }));
    }
  }

  // ── CREATE view ──
  if (view === "create") {
    return (
      <div style={st.page}>
        <div style={st.formHeader}>
          <button onClick={() => setView("list")} style={st.backBtn}>← Products</button>
          <h1 style={st.pageTitle}>New Product</h1>
        </div>
        <ProductForm
          customers={customers}
          onSubmit={handleCreate}
          onCancel={() => setView("list")}
        />
      </div>
    );
  }

  // ── EDIT view ──
  if (view === "edit" && selected) {
    return (
      <div style={st.page}>
        <div style={st.formHeader}>
          <button onClick={() => setView("detail")} style={st.backBtn}>← {selected.product_name}</button>
          <h1 style={st.pageTitle}>Edit Product</h1>
        </div>
        <ProductForm
          initialData={selected}
          customers={customers}
          onSubmit={handleUpdate}
          onCancel={() => setView("detail")}
        />
      </div>
    );
  }

  // ── DETAIL view ──
  if (view === "detail" && selected) {
    return (
      <div style={st.page}>
        {error && <div style={st.alertError}>{error}</div>}
        <ProductDetail
          product={selected}
          onEdit={() => setView("edit")}
          onClose={() => { setView("list"); setSelected(null); }}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      </div>
    );
  }

  // ── LIST view ──
  return (
    <div style={st.page}>

      {/* Header */}
      <div style={st.pageHeader}>
        <div>
          <p style={st.pageEyebrow}>BOXIQ ERP</p>
          <h1 style={st.pageTitle}>Product Master</h1>
          <p style={st.pageSubtitle}>Manage standard box specifications for customers</p>
        </div>
        <button onClick={() => setView("create")} style={st.newBtn}>
          + New Product
        </button>
      </div>

      {/* Stats */}
      <div style={st.statsRow}>
        <StatCard label="TOTAL PRODUCTS" value={total}    color="#60a5fa" />
        <StatCard label="ACTIVE"          value={active}   color="#4ade80" />
        <StatCard label="INACTIVE"        value={inactive} color="#64748b" />
      </div>

      {/* Toolbar */}
      <div style={st.toolbar}>
        <div style={st.filterTabs}>
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={filter === f ? st.tabActive : st.tabInactive}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "all"      && <span style={st.tabCount}>{total}</span>}
              {f === "active"   && <span style={st.tabCount}>{active}</span>}
              {f === "inactive" && <span style={st.tabCount}>{inactive}</span>}
            </button>
          ))}
        </div>
        <input
          style={st.search}
          placeholder="Search by name, code, customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && <div style={st.alertError} onClick={() => setError(null)}>⚠ {error}</div>}

      {/* Table */}
      <div style={st.tableWrap}>
        <table style={st.table}>
          <thead>
            <tr>
              {["CODE", "PRODUCT NAME", "CUSTOMER", "BOX TYPE", "DIMENSIONS", "PLY", "PRINTING", "STATUS", "ACTIONS"].map((h) => (
                <th key={h} style={st.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={st.emptyCell}>Loading…</td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={9} style={st.emptyCell}>
                {search ? "No products match your search." : "No products yet. Click '+ New Product' to create one."}
              </td></tr>
            ) : displayed.map((p) => (
              <tr
                key={p.id}
                style={st.tr}
                onMouseEnter={(e) => e.currentTarget.style.background = "#0f172a"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={st.td}>
                  <span style={st.codeText}>{p.product_code}</span>
                </td>
                <td style={st.td}>
                  <button
                    onClick={() => { setSelected(p); setView("detail"); }}
                    style={st.nameBtn}
                  >
                    {p.product_name}
                  </button>
                </td>
                <td style={st.td}>
                  <span style={st.cellMuted}>{p.customer_name || "—"}</span>
                </td>
                <td style={st.td}>
                  <span style={st.cellText}>{p.box_type?.replace(" Container", "").replace(" (RSC)", "").replace(" (HSC)", "").replace(" (FOL)", "") || "—"}</span>
                </td>
                <td style={st.td}>
                  <span style={st.cellMono}>{dim(p)}</span>
                </td>
                <td style={st.td}>
                  <span style={st.cellText}>{p.ply_type}</span>
                </td>
                <td style={st.td}>
                  <span style={st.cellMuted}>{p.printing_type}</span>
                </td>
                <td style={st.td}>
                  <ActiveBadge active={p.is_active} />
                </td>
                <td style={st.td}>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button
                      onClick={() => { setSelected(p); setView("detail"); }}
                      style={st.iconBtn}
                      title="View"
                    >👁</button>
                    <button
                      onClick={() => { setSelected(p); setView("edit"); }}
                      style={st.iconBtn}
                      title="Edit"
                    >✏</button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${p.product_name}"?`)) {
                          handleDelete(p.id);
                        }
                      }}
                      style={{ ...st.iconBtn, color: "#f87171" }}
                      title="Delete"
                    >🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && displayed.length > 0 && (
        <p style={st.countText}>
          Showing {displayed.length} of {total} product{total !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const st = {
  page: {
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    color: "#e2e8f0",
    maxWidth: "1300px",
  },
  pageHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem",
  },
  pageEyebrow: {
    fontSize: "0.72rem", fontWeight: 700, color: "#f97316",
    textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 0.3rem",
  },
  pageTitle: { margin: "0 0 0.25rem", fontSize: "2.5rem", fontWeight: 900, color: "#fff" },
  pageSubtitle: { margin: 0, fontSize: "0.9rem", color: "#64748b" },
  formHeader: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" },
  newBtn: {
    padding: "0.65rem 1.4rem", borderRadius: "10px", border: "none",
    background: "linear-gradient(135deg,#ea580c,#f97316)",
    color: "#fff", fontWeight: 700, fontSize: "0.9rem",
    cursor: "pointer", boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
    whiteSpace: "nowrap",
  },
  statsRow: {
    display: "grid", gridTemplateColumns: "repeat(3,1fr)",
    gap: "1rem", marginBottom: "1.5rem",
  },
  statCard: {
    background: "#111827", border: "1px solid #1e293b",
    borderTop: "3px solid #60a5fa",
    borderRadius: "12px", padding: "1.1rem 1.25rem",
  },
  statValue: { fontSize: "2rem", fontWeight: 900, lineHeight: 1 },
  statLabel: { fontSize: "0.7rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.3rem" },
  toolbar: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap",
  },
  filterTabs: { display: "flex", gap: "0.4rem" },
  tabActive: {
    padding: "0.4rem 0.9rem", borderRadius: "8px", border: "none",
    background: "#f97316", color: "#fff",
    fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "0.4rem",
  },
  tabInactive: {
    padding: "0.4rem 0.9rem", borderRadius: "8px",
    border: "1px solid #1e293b", background: "transparent",
    color: "#64748b", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "0.4rem",
  },
  tabCount: {
    background: "rgba(255,255,255,0.15)", borderRadius: "20px",
    padding: "0 6px", fontSize: "0.68rem", fontWeight: 700,
  },
  search: {
    padding: "0.45rem 0.875rem", borderRadius: "8px",
    border: "1.5px solid #1e293b", background: "#111827",
    color: "#e2e8f0", fontSize: "0.85rem", outline: "none",
    width: "260px",
  },
  tableWrap: {
    background: "#111827", border: "1px solid #1e293b",
    borderRadius: "14px", overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.7rem 1rem", textAlign: "left",
    fontSize: "0.68rem", fontWeight: 700, color: "#475569",
    textTransform: "uppercase", letterSpacing: "0.07em",
    borderBottom: "1px solid #1e293b", background: "#0f172a",
    whiteSpace: "nowrap",
  },
  tr: { transition: "background 0.1s", cursor: "default" },
  td: {
    padding: "0.75rem 1rem", borderBottom: "1px solid #1a2332",
    fontSize: "0.85rem", verticalAlign: "middle",
  },
  codeText: { fontFamily: "monospace", fontSize: "0.78rem", color: "#60a5fa", fontWeight: 600 },
  nameBtn: {
    background: "none", border: "none", color: "#e2e8f0",
    fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
    padding: 0, textAlign: "left",
  },
  cellText:  { fontSize: "0.825rem", color: "#94a3b8" },
  cellMuted: { fontSize: "0.8rem", color: "#64748b" },
  cellMono:  { fontFamily: "monospace", fontSize: "0.8rem", color: "#94a3b8" },
  iconBtn: {
    padding: "4px 8px", borderRadius: "6px",
    border: "1px solid #1e293b", background: "#0f172a",
    color: "#94a3b8", cursor: "pointer", fontSize: "0.82rem",
  },
  emptyCell: {
    textAlign: "center", padding: "3rem",
    fontSize: "0.875rem", color: "#475569",
  },
  countText: { fontSize: "0.78rem", color: "#475569", textAlign: "center", marginTop: "0.75rem" },
  alertError: {
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "10px", padding: "0.7rem 1rem",
    color: "#f87171", fontSize: "0.85rem", marginBottom: "1rem",
  },
  backBtn: {
    padding: "0.4rem 0.9rem", borderRadius: "8px",
    border: "1.5px solid #1e293b", background: "#111827",
    color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem",
    cursor: "pointer",
  },
  // Detail view
  detailWrapper: { color: "#e2e8f0" },
  detailHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem",
  },
  detailCode: { fontFamily: "monospace", fontWeight: 800, fontSize: "1rem", color: "#60a5fa" },
  detailName: { margin: "0.35rem 0 0.2rem", fontSize: "1.6rem", fontWeight: 900, color: "#fff" },
  detailCustomer: { margin: 0, fontSize: "0.875rem", color: "#64748b" },
  detailActions: { display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" },
  detailGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "1rem", alignItems: "start",
  },
  detailSection: {
    background: "#111827", border: "1px solid #1e293b",
    borderRadius: "12px", padding: "1.25rem",
  },
  sectionTitle: {
    margin: "0 0 0.875rem", fontSize: "0.72rem", fontWeight: 700,
    color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em",
    paddingBottom: "0.5rem", borderBottom: "1px solid #1e293b",
  },
  detailRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "0.45rem 0", borderBottom: "1px solid #0f172a", gap: "1rem",
  },
  detailLabel: { fontSize: "0.78rem", color: "#64748b" },
  detailValue: { fontSize: "0.875rem", color: "#f1f5f9", fontWeight: 500, textAlign: "right" },
  notesText: { margin: "0.3rem 0 0", fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 },
  btnSecondary: {
    padding: "0.45rem 1rem", borderRadius: "8px",
    border: "1.5px solid #1e293b", background: "#0f172a",
    color: "#94a3b8", fontWeight: 600, fontSize: "0.83rem", cursor: "pointer",
  },
  btnGreen: {
    padding: "0.45rem 1rem", borderRadius: "8px", border: "none",
    background: "#15803d", color: "#fff",
    fontWeight: 700, fontSize: "0.83rem", cursor: "pointer",
  },
  btnGhost: {
    padding: "0.45rem 1rem", borderRadius: "8px",
    border: "1.5px solid #1e293b", background: "transparent",
    color: "#64748b", fontWeight: 600, fontSize: "0.83rem", cursor: "pointer",
  },
  btnRed: {
    padding: "0.45rem 1rem", borderRadius: "8px", border: "none",
    background: "#dc2626", color: "#fff",
    fontWeight: 700, fontSize: "0.83rem", cursor: "pointer",
  },
};
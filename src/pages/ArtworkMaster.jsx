// ============================================================
// ArtworkMaster.jsx
// Artwork Master — upload, list, view, status edit, download
// Location: src/pages/ArtworkMaster.jsx
// ============================================================

import { useState, useEffect, useRef } from "react";
import PageContainer from "../components/ui/PageContainer";
import {
  fetchArtworks,
  fetchProductsForSelect,
  uploadArtwork,
  updateArtworkStatus,
  deleteArtwork,
  getArtworkDownloadUrl,
  isImageFile,
  MAX_FILE_SIZE,
  ALLOWED_MIMES,
  APPROVAL_STATUSES,
} from "../services/artworkService";

// ─── Constants ───────────────────────────────────────────────
const STATUS_STYLE = {
  Pending:  { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  dot: "#f59e0b" },
  Approved: { color: "#4ade80", bg: "rgba(74,222,128,0.1)",  dot: "#22c55e" },
  Rejected: { color: "#f87171", bg: "rgba(248,113,113,0.1)", dot: "#ef4444" },
};

// ─── Sub-components ───────────────────────────────────────────

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.Pending;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "0.72rem", fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {status ?? "Pending"}
    </span>
  );
}

function IconBtn({ onClick, title, disabled, children, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        padding: "4px 8px", borderRadius: "6px",
        border: "1px solid #1e293b", background: "#0f172a",
        color: danger ? "#f87171" : "#94a3b8",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "0.85rem", opacity: disabled ? 0.5 : 1,
      }}
    >{children}</button>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────
function UploadModal({ products, onClose, onSuccess }) {
  const [productId, setProductId]     = useState("");
  const [version, setVersion]         = useState("1.0");
  const [status, setStatus]           = useState("Pending");
  const [file, setFile]               = useState(null);
  const [fileError, setFileError]     = useState(null);
  const [errors, setErrors]           = useState({});
  const [uploading, setUploading]     = useState(false);
  const [apiError, setApiError]       = useState(null);
  const fileRef                       = useRef(null);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) { setFileError("File exceeds 20 MB limit."); setFile(null); return; }
    if (!ALLOWED_MIMES.includes(f.type)) { setFileError("Unsupported file type. Use JPG, PNG, WebP, SVG, or PDF."); setFile(null); return; }
    setFileError(null);
    setFile(f);
  }

  function validate() {
    const e = {};
    if (!productId)    e.productId = "Select a product.";
    if (!version.trim()) e.version = "Version is required.";
    if (!file)           e.file    = "Select a file to upload.";
    return e;
  }

  async function handleUpload() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setUploading(true);
    setApiError(null);
    try {
      await uploadArtwork({ productId, version, file, approvalStatus: status });
      onSuccess();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setUploading(false);
    }
  }

  const inp = (err) => ({
    width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px",
    border: `1.5px solid ${err ? "#ef4444" : "#1e293b"}`,
    background: "#0f172a", color: "#e2e8f0",
    fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  });

  return (
    <div style={st.overlay}>
      <div style={{ ...st.modal, maxWidth: "500px" }}>
        {/* Header */}
        <div style={st.modalHeader}>
          <h2 style={st.modalTitle}>Upload Artwork</h2>
          <button onClick={onClose} style={st.closeBtn}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {apiError && <div style={st.alertError}>⚠ {apiError}</div>}

          {/* Product */}
          <div>
            <label style={lbl}>Product <span style={{ color: "#f87171" }}>*</span></label>
            <select style={inp(errors.productId)} value={productId} onChange={e => { setProductId(e.target.value); setErrors(v => ({ ...v, productId: null })); }}>
              <option value="">— Select product —</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.product_name}{p.product_code ? ` (${p.product_code})` : ""}</option>
              ))}
            </select>
            {errors.productId && <p style={err}>{errors.productId}</p>}
          </div>

          {/* Version */}
          <div>
            <label style={lbl}>Version <span style={{ color: "#f87171" }}>*</span></label>
            <input style={inp(errors.version)} value={version} onChange={e => { setVersion(e.target.value); setErrors(v => ({ ...v, version: null })); }} placeholder="e.g. 1.0, 2.1, Final" />
            {errors.version && <p style={err}>{errors.version}</p>}
          </div>

          {/* Approval Status */}
          <div>
            <label style={lbl}>Approval Status</label>
            <select style={inp(false)} value={status} onChange={e => setStatus(e.target.value)}>
              {APPROVAL_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* File */}
          <div>
            <label style={lbl}>Artwork File <span style={{ color: "#f87171" }}>*</span></label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${errors.file || fileError ? "#ef4444" : "#1e293b"}`,
                borderRadius: "10px", padding: "1.25rem",
                textAlign: "center", cursor: "pointer",
                background: "#0f172a", transition: "border-color 0.2s",
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { fileRef.current.files = e.dataTransfer.files; handleFileChange({ target: { files: [f] } }); } }}
            >
              <input ref={fileRef} type="file" accept={ALLOWED_MIMES.join(",")} onChange={handleFileChange} style={{ display: "none" }} />
              {file ? (
                <div>
                  <div style={{ fontSize: "1.5rem" }}>{isImageFile(file.name) ? "🖼" : "📄"}</div>
                  <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem", color: "#e2e8f0", fontWeight: 600 }}>{file.name}</p>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "1.5rem", opacity: 0.5 }}>📁</div>
                  <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>Click or drag file here</p>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.72rem", color: "#475569" }}>JPG, PNG, WebP, SVG, PDF · Max 20 MB</p>
                </div>
              )}
            </div>
            {(errors.file || fileError) && <p style={err}>{errors.file || fileError}</p>}
          </div>
        </div>

        {/* Footer */}
        <div style={st.modalFooter}>
          <button onClick={onClose} disabled={uploading} style={st.btnSecondary}>Cancel</button>
          <button onClick={handleUpload} disabled={uploading} style={{ ...st.btnPrimary, opacity: uploading ? 0.7 : 1, cursor: uploading ? "not-allowed" : "pointer" }}>
            {uploading ? "Uploading…" : "⬆ Upload Artwork"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Edit Modal ────────────────────────────────────────
function StatusModal({ artwork, onClose, onSuccess }) {
  const [status, setStatus]     = useState(artwork.approval_status ?? "Pending");
  const [saving, setSaving]     = useState(false);
  const [apiError, setApiError] = useState(null);

  async function handleSave() {
    setSaving(true);
    try {
      await updateArtworkStatus(artwork.id, status);
      onSuccess();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={st.overlay}>
      <div style={{ ...st.modal, maxWidth: "360px" }}>
        <div style={st.modalHeader}>
          <h2 style={st.modalTitle}>Update Status</h2>
          <button onClick={onClose} style={st.closeBtn}>✕</button>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", color: "#94a3b8" }}>
            <strong style={{ color: "#e2e8f0" }}>{artwork.file_name}</strong>
          </p>
          {apiError && <div style={{ ...st.alertError, marginBottom: "0.75rem" }}>⚠ {apiError}</div>}
          <label style={lbl}>Approval Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1.5px solid #1e293b", background: "#0f172a", color: "#e2e8f0", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          >
            {APPROVAL_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={st.modalFooter}>
          <button onClick={onClose} disabled={saving} style={st.btnSecondary}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ ...st.btnPrimary, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────────
function PreviewModal({ url, fileName, onClose }) {
  return (
    <div style={{ ...st.overlay, zIndex: 60 }} onClick={onClose}>
      <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: "14px", width: "90vw", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.875rem 1.25rem", borderBottom: "1px solid #1e293b" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0" }}>{fileName}</span>
          <button onClick={onClose} style={st.closeBtn}>✕</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          {isImageFile(fileName)
            ? <img src={url} alt={fileName} style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: "8px", objectFit: "contain" }} />
            : <iframe src={url} title={fileName} style={{ width: "100%", height: "75vh", border: "none", borderRadius: "8px" }} />
          }
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ArtworkMaster() {
  const [artworks,  setArtworks]  = useState([]);
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [showUpload,  setShowUpload]  = useState(false);
  const [editArtwork, setEditArtwork] = useState(null);   // for status edit
  const [preview,     setPreview]     = useState(null);   // { url, fileName }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [a, p] = await Promise.all([fetchArtworks(), fetchProductsForSelect()]);
      setArtworks(a);
      setProducts(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(artwork) {
    try {
      const url = await getArtworkDownloadUrl(artwork.file_url);
      const a   = document.createElement("a");
      a.href = url; a.download = artwork.file_name; a.target = "_blank"; a.click();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handlePreview(artwork) {
    try {
      const url = await getArtworkDownloadUrl(artwork.file_url);
      setPreview({ url, fileName: artwork.file_name });
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(artwork) {
    if (!window.confirm(`Delete "${artwork.file_name}"? This cannot be undone.`)) return;
    try {
      await deleteArtwork(artwork.id, artwork.file_url);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  // ── Stats
  const total    = artworks.length;
  const approved = artworks.filter(a => a.approval_status === "Approved").length;
  const pending  = artworks.filter(a => a.approval_status === "Pending").length;
  const rejected = artworks.filter(a => a.approval_status === "Rejected").length;

  // ── Filter + search
  const displayed = artworks.filter(a => {
    const matchStatus = filterStatus === "All" || a.approval_status === filterStatus;
    const term = search.toLowerCase();
    const matchSearch = !term ||
      a.file_name?.toLowerCase().includes(term) ||
      a.products?.product_name?.toLowerCase().includes(term) ||
      a.version?.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  return (
    <PageContainer
      title="Artwork Master"
      subtitle="Manage artwork files linked to products and quotations."
    >
      {/* Header actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button onClick={() => setShowUpload(true)} style={st.btnOrange}>
          ⬆ Upload Artwork
        </button>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        {[
          { label: "Total Artworks", value: total,    color: "text-blue-400" },
          { label: "Approved",       value: approved,  color: "text-green-400" },
          { label: "Pending",        value: pending,   color: "text-yellow-400" },
          { label: "Rejected",       value: rejected,  color: "text-red-400" },
        ].map(card => (
          <div key={card.label} className="rounded-3xl border border-white/10 bg-[#111827] p-6">
            <p className="text-slate-400">{card.label}</p>
            <h2 className={`mt-4 text-5xl font-black ${card.color}`}>{card.value}</h2>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {["All", ...APPROVAL_STATUSES].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={filterStatus === s ? st.tabOn : st.tabOff}>
              {s}
              <span style={{ background: "rgba(255,255,255,0.12)", borderRadius: "20px", padding: "0 6px", fontSize: "0.68rem", marginLeft: "4px" }}>
                {s === "All" ? total : artworks.filter(a => a.approval_status === s).length}
              </span>
            </button>
          ))}
        </div>
        <input
          style={{ padding: "0.45rem 0.875rem", borderRadius: "8px", border: "1.5px solid #1e293b", background: "#111827", color: "#e2e8f0", fontSize: "0.85rem", outline: "none", width: "240px" }}
          placeholder="Search file name, product…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ ...st.alertError, marginBottom: "1rem" }} onClick={() => setError(null)}>
          ⚠ {error} <span style={{ opacity: 0.5 }}>✕</span>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: "14px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["FILE NAME", "PRODUCT", "VERSION", "STATUS", "UPLOADED", "ACTIONS"].map(h => (
                <th key={h} style={{ padding: "0.7rem 1rem", textAlign: "left", fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #1e293b", background: "#0f172a", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#475569" }}>Loading artworks…</td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#475569" }}>
                {search || filterStatus !== "All" ? "No artworks match your filter." : 'No artworks yet. Click "Upload Artwork" to add one.'}
              </td></tr>
            ) : displayed.map(a => (
              <tr
                key={a.id}
                style={{ transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#0f172a"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={st.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1rem" }}>{isImageFile(a.file_name) ? "🖼" : "📄"}</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e2e8f0" }}>{a.file_name}</span>
                  </div>
                </td>
                <td style={st.td}>
                  <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                    {a.products?.product_name ?? "—"}
                  </span>
                  {a.products?.product_code && (
                    <span style={{ display: "block", fontSize: "0.72rem", color: "#475569", fontFamily: "monospace" }}>
                      {a.products.product_code}
                    </span>
                  )}
                </td>
                <td style={st.td}>
                  <span style={{ fontSize: "0.82rem", color: "#94a3b8", fontFamily: "monospace" }}>
                    v{a.version ?? "—"}
                  </span>
                </td>
                <td style={st.td}><StatusBadge status={a.approval_status} /></td>
                <td style={st.td}>
                  <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    {a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </span>
                </td>
                <td style={st.td}>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <IconBtn onClick={() => handlePreview(a)} title="Preview">👁</IconBtn>
                    <IconBtn onClick={() => handleDownload(a)} title="Download">⬇</IconBtn>
                    <IconBtn onClick={() => setEditArtwork(a)} title="Edit Status">✏</IconBtn>
                    <IconBtn onClick={() => handleDelete(a)} title="Delete" danger>🗑</IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && displayed.length > 0 && (
        <p style={{ fontSize: "0.78rem", color: "#475569", textAlign: "center", marginTop: "0.75rem" }}>
          Showing {displayed.length} of {total} artwork{total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Modals */}
      {showUpload && (
        <UploadModal
          products={products}
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); load(); }}
        />
      )}
      {editArtwork && (
        <StatusModal
          artwork={editArtwork}
          onClose={() => setEditArtwork(null)}
          onSuccess={() => { setEditArtwork(null); load(); }}
        />
      )}
      {preview && (
        <PreviewModal
          url={preview.url}
          fileName={preview.fileName}
          onClose={() => setPreview(null)}
        />
      )}
    </PageContainer>
  );
}

// ─── Shared Styles ────────────────────────────────────────────
const st = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 50,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", padding: "1rem",
  },
  modal: {
    width: "100%", background: "#111827",
    borderRadius: "16px", border: "1px solid #1e293b",
    boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    maxHeight: "90vh", overflowY: "auto",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "1.25rem 1.5rem", borderBottom: "1px solid #1e293b",
  },
  modalTitle: { margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#fff" },
  modalFooter: {
    display: "flex", justifyContent: "flex-end", gap: "0.75rem",
    padding: "1rem 1.5rem", borderTop: "1px solid #1e293b",
  },
  closeBtn: {
    padding: "4px 10px", borderRadius: "6px",
    border: "1px solid #1e293b", background: "#0f172a",
    color: "#94a3b8", cursor: "pointer", fontWeight: 700, fontSize: "1rem",
  },
  btnPrimary: {
    padding: "0.6rem 1.4rem", borderRadius: "8px", border: "none",
    background: "linear-gradient(135deg,#1e40af,#2563eb)",
    color: "#fff", fontWeight: 700, fontSize: "0.875rem",
    cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
  },
  btnSecondary: {
    padding: "0.6rem 1.25rem", borderRadius: "8px",
    border: "1.5px solid #1e293b", background: "#0f172a",
    color: "#94a3b8", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
  },
  btnOrange: {
    padding: "0.65rem 1.4rem", borderRadius: "10px", border: "none",
    background: "linear-gradient(135deg,#ea580c,#f97316)",
    color: "#fff", fontWeight: 700, fontSize: "0.9rem",
    cursor: "pointer", boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
  },
  tabOn: {
    padding: "0.4rem 0.9rem", borderRadius: "8px", border: "none",
    background: "#f97316", color: "#fff",
    fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
  },
  tabOff: {
    padding: "0.4rem 0.9rem", borderRadius: "8px",
    border: "1px solid #1e293b", background: "transparent",
    color: "#64748b", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
  },
  td: {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #1a2332",
    fontSize: "0.85rem", verticalAlign: "middle",
  },
  alertError: {
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "8px", padding: "0.6rem 0.875rem",
    color: "#f87171", fontSize: "0.82rem", cursor: "pointer",
    display: "flex", justifyContent: "space-between",
  },
};

const lbl = {
  display: "block", fontSize: "0.72rem", fontWeight: 700,
  color: "#64748b", textTransform: "uppercase",
  letterSpacing: "0.07em", marginBottom: "0.35rem",
};
const err = { margin: "4px 0 0", fontSize: "0.75rem", color: "#f87171" };
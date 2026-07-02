// ============================================================
// Inventory.jsx  —  Inventory Master
// Location: src/pages/Inventory.jsx
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import PageContainer from '../components/ui/PageContainer';
import {
  fetchInventoryItems,
  insertInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  MATERIAL_TYPES,
  FLUTE_TYPES,
  UNITS,
} from '../services/inventoryService';

// ─── helpers ─────────────────────────────────────────────────
const fmt = (n) =>
  n == null ? '—' : Number(n).toLocaleString('en-IN');

const fmtCurrency = (n) =>
  n == null
    ? '—'
    : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

function LowStockBadge() {
  return (
    <span style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '20px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700 }}>
      ⚠ Low Stock
    </span>
  );
}

// ─── Material Form (shared for create + edit) ─────────────────
const EMPTY = {
  material_name: '', material_code: '', material_type: '',
  gsm: '', flute_type: 'N/A', unit: 'kg',
  current_stock: '', minimum_stock: '', cost_per_unit: '',
  warehouse_location: '',
};

function validate(f) {
  const e = {};
  if (!f.material_name.trim()) e.material_name = 'Material name is required.';
  if (!f.material_code.trim()) e.material_code = 'Material code is required.';
  if (!f.material_type)             e.material_type      = 'Select a material type.';
  if (!f.unit)                 e.unit          = 'Select a unit.';
  if (f.current_stock === '' || Number(f.current_stock) < 0) e.current_stock = 'Enter valid stock quantity.';
  if (f.minimum_stock === '' || Number(f.minimum_stock) < 0) e.minimum_stock = 'Enter valid minimum stock.';
  if (f.cost_per_unit === '' || Number(f.cost_per_unit) < 0) e.cost_per_unit = 'Enter valid cost.';
  return e;
}

function inp(err) {
  return {
    width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px',
    border: `1.5px solid ${err ? '#ef4444' : '#1e293b'}`,
    background: '#0f172a', color: '#e2e8f0',
    fontSize: '0.875rem', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };
}

function Field({ label, error, hint, required, children }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>
        {label}{required && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint  && !error && <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#475569' }}>{hint}</p>}
      {error && <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#f87171' }}>{error}</p>}
    </div>
  );
}

function MaterialModal({ initialData, onClose, onSuccess }) {
  const isEdit = !!initialData?.id;
  const [form, setForm]     = useState(isEdit ? { ...EMPTY, ...initialData, gsm: initialData.gsm ?? '', flute_type: initialData.flute_type || 'N/A' } : EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState(null);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n = { ...e }; delete n[k]; return n; }); }

  async function handleSave() {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setApiErr(null);
    try {
      const payload = {
        ...form,
        gsm:           form.gsm !== '' ? Number(form.gsm) : null,
        current_stock: Number(form.current_stock),
        minimum_stock: Number(form.minimum_stock),
        cost_per_unit: Number(form.cost_per_unit),
        item_name:     form.material_name,
      };
      if (isEdit) await updateInventoryItem(initialData.id, payload);
      else        await insertInventoryItem(payload);
      onSuccess();
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  const sec = { background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' };
  const secT = { margin: '0 0 1rem', fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', paddingBottom: '0.5rem', borderBottom: '1px solid #1e293b' };
  const g2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' };
  const g3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', background: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{isEdit ? 'Edit Material' : 'Add Material'}</h2>
          <button onClick={onClose} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #1e293b', background: '#111827', color: '#94a3b8', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {apiErr && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '0.6rem 0.875rem', color: '#f87171', fontSize: '0.83rem', marginBottom: '1rem' }}>⚠ {apiErr}</div>}

          <div style={sec}>
            <h3 style={secT}>Identity</h3>
            <div style={g2}>
              <Field label="Material Name" required error={errors.material_name}>
                <input style={inp(errors.material_name)} value={form.material_name} onChange={e => set('material_name', e.target.value)} placeholder="e.g. Kraft Liner 150 GSM" />
              </Field>
              <Field label="Material Code" required error={errors.material_code}>
                <input style={inp(errors.material_code)} value={form.material_code} onChange={e => set('material_code', e.target.value)} placeholder="e.g. KL-150" />
              </Field>
            </div>
            <Field label="Material Type" required error={errors.material_type}>
              <select style={inp(errors.material_type)} value={form.material_type} onChange={e => set('material_type', e.target.value)}>
                <option value="">— Select type —</option>
                {MATERIAL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <div style={sec}>
            <h3 style={secT}>Specifications</h3>
            <div style={g2}>
              <Field label="GSM" hint="Leave blank if not applicable">
                <input type="number" style={inp(false)} value={form.gsm} onChange={e => set('gsm', e.target.value)} placeholder="150" min="0" />
              </Field>
              <Field label="Flute Type">
                <select style={inp(false)} value={form.flute_type} onChange={e => set('flute_type', e.target.value)}>
                  {FLUTE_TYPES.map(f => <option key={f}>{f}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Unit" required error={errors.unit}>
              <select style={inp(errors.unit)} value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </Field>
          </div>

          <div style={sec}>
            <h3 style={secT}>Stock & Cost</h3>
            <div style={g3}>
              <Field label="Current Stock" required error={errors.current_stock}>
                <input type="number" style={inp(errors.current_stock)} value={form.current_stock} onChange={e => set('current_stock', e.target.value)} placeholder="0" min="0" step="0.01" />
              </Field>
              <Field label="Minimum Stock" required error={errors.minimum_stock} hint="Low stock threshold">
                <input type="number" style={inp(errors.minimum_stock)} value={form.minimum_stock} onChange={e => set('minimum_stock', e.target.value)} placeholder="100" min="0" step="0.01" />
              </Field>
              <Field label="Cost Per Unit (₹)" required error={errors.cost_per_unit}>
                <input type="number" style={inp(errors.cost_per_unit)} value={form.cost_per_unit} onChange={e => set('cost_per_unit', e.target.value)} placeholder="0.00" min="0" step="0.01" />
              </Field>
            </div>
            <Field label="Warehouse Location">
              <input style={inp(false)} value={form.warehouse_location} onChange={e => set('warehouse_location', e.target.value)} placeholder="e.g. Rack A-12, Zone B" />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid #1e293b' }}>
          <button onClick={onClose} disabled={saving} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1.5px solid #1e293b', background: '#111827', color: '#94a3b8', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: saving ? '#1e3a8a' : 'linear-gradient(135deg,#1e40af,#2563eb)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Material'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function Inventory() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all'); // all | low | ok
  const [typeFilter, setTypeFilter] = useState('All');

  const [modal,   setModal]   = useState(null); // null | 'create' | item (for edit)

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems(await fetchInventoryItems()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.material_name}"? This cannot be undone.`)) return;
    try { await deleteInventoryItem(item.id); await load(); }
    catch (e) { setError(e.message); }
  }

  // ── stats
  const total    = items.length;
  const lowStock = items.filter(i => i.isLowStock).length;
  const totalValue = items.reduce((s, i) => s + i.current_stock * i.cost_per_unit, 0);

  // ── filtered
  const typeOptions = ['All', ...new Set(items.map(i => i.material_type).filter(Boolean))];
  const displayed = items.filter(i => {
    if (filter === 'low' && !i.isLowStock) return false;
    if (filter === 'ok'  &&  i.isLowStock) return false;
    if (typeFilter !== 'All' && i.material_type !== typeFilter) return false;
    if (!search) return true;
    const t = search.toLowerCase();
    return (
      i.material_name?.toLowerCase().includes(t) ||
      i.material_code?.toLowerCase().includes(t) ||
      i.material_type?.toLowerCase().includes(t) ||
      i.warehouse_location?.toLowerCase().includes(t)
    );
  });

  return (
    <PageContainer title="Inventory" subtitle="Manage raw materials and stock levels.">

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div /> {/* spacer */}
        <button onClick={() => setModal('create')} style={{ padding: '0.65rem 1.4rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#ea580c,#f97316)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
          + Add Material
        </button>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">Total Materials</p>
          <h2 className="mt-4 text-5xl font-black text-blue-400">{total}</h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">Low Stock Alerts</p>
          <h2 className={`mt-4 text-5xl font-black ${lowStock > 0 ? 'text-red-400' : 'text-green-400'}`}>{lowStock}</h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">Total Inventory Value</p>
          <h2 className="mt-4 text-4xl font-black text-orange-400">{fmtCurrency(totalValue)}</h2>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[['all', 'All', total], ['low', '⚠ Low Stock', lowStock], ['ok', 'In Stock', total - lowStock]].map(([val, lbl, count]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ padding: '0.4rem 0.9rem', borderRadius: '8px', border: filter === val ? 'none' : '1px solid #1e293b', background: filter === val ? (val === 'low' ? '#dc2626' : '#f97316') : 'transparent', color: filter === val ? '#fff' : '#64748b', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
              {lbl} <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '0 6px', fontSize: '0.68rem', marginLeft: 4 }}>{count}</span>
            </button>
          ))}

          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '0.4rem 0.7rem', borderRadius: '8px', border: '1px solid #1e293b', background: '#111827', color: '#94a3b8', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}>
            {typeOptions.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <input
          style={{ padding: '0.45rem 0.875rem', borderRadius: '8px', border: '1.5px solid #1e293b', background: '#111827', color: '#e2e8f0', fontSize: '0.85rem', outline: 'none', width: '240px' }}
          placeholder="Search name, code, location…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '0.7rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => setError(null)}>
          ⚠ {error}
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['CODE', 'MATERIAL NAME', 'TYPE', 'GSM', 'UNIT', 'CURRENT STOCK', 'MIN STOCK', 'COST/UNIT', 'LOCATION', 'ACTIONS'].map(h => (
                <th key={h} style={{ padding: '0.7rem 0.875rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid #1e293b', background: '#0f172a', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>Loading inventory…</td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                {search || filter !== 'all' || typeFilter !== 'All' ? 'No items match your filter.' : 'No materials yet. Click "+ Add Material" to get started.'}
              </td></tr>
            ) : displayed.map(item => (
              <tr key={item.id} onMouseEnter={e => e.currentTarget.style.background = '#0f172a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ transition: 'background 0.1s' }}>
                <td style={td}><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#60a5fa', fontWeight: 600 }}>{item.material_code || '—'}</span></td>
                <td style={td}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0' }}>{item.material_name}</div>
                  {item.isLowStock && <LowStockBadge />}
                </td>
                <td style={td}><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.material_type || '—'}</span></td>
                <td style={td}><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.gsm ? `${item.gsm}` : '—'}</span></td>
                <td style={td}><span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.unit || '—'}</span></td>
                <td style={td}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: item.isLowStock ? '#f87171' : '#4ade80' }}>
                    {fmt(item.current_stock)}
                  </span>
                </td>
                <td style={td}><span style={{ fontSize: '0.82rem', color: '#64748b' }}>{fmt(item.minimum_stock)}</span></td>
                <td style={td}><span style={{ fontSize: '0.82rem', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>{fmtCurrency(item.cost_per_unit)}</span></td>
                <td style={td}><span style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.warehouse_location || '—'}</span></td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button onClick={() => setModal(item)} title="Edit" style={iconBtn}>✏</button>
                    <button onClick={() => handleDelete(item)} title="Delete" style={{ ...iconBtn, color: '#f87171' }}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && displayed.length > 0 && (
        <p style={{ fontSize: '0.78rem', color: '#475569', textAlign: 'center', marginTop: '0.75rem' }}>
          Showing {displayed.length} of {total} material{total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Modal */}
      {modal && (
        <MaterialModal
          initialData={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); load(); }}
        />
      )}
    </PageContainer>
  );
}

const td = { padding: '0.7rem 0.875rem', borderBottom: '1px solid #1a2332', fontSize: '0.85rem', verticalAlign: 'middle' };
const iconBtn = { padding: '4px 8px', borderRadius: '6px', border: '1px solid #1e293b', background: '#0f172a', color: '#94a3b8', cursor: 'pointer', fontSize: '0.82rem' };
export default function InventoryFilters({ filters, onChange, categories, suppliers }) {
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Inventory filters</p>
          <h2 className="mt-2 text-2xl font-black text-white">Find raw materials</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <select
          value={filters.category}
          onChange={(event) => onChange({ ...filters, category: event.target.value })}
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filters.supplier}
          onChange={(event) => onChange({ ...filters, supplier: event.target.value })}
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="">All suppliers</option>
          {suppliers.map((sup) => (
            <option key={sup.id} value={sup.id}>{sup.supplier_name}</option>
          ))}
        </select>
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Search material"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
      </div>
    </div>
  );
}

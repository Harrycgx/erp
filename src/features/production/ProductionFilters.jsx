import { PRIORITY_LEVELS } from '../../utils/productionHelpers';
import { PRODUCTION_STAGES } from '../../utils/productionHelpers';

export default function ProductionFilters({ filters, onChange }) {
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Production filters</p>
          <h2 className="mt-2 text-2xl font-black text-white">Find jobs fast</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <select
          value={filters.stage}
          onChange={(event) => onChange({ ...filters, stage: event.target.value })}
          className="rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
        >
          <option value="">All stages</option>
          {PRODUCTION_STAGES.map((stage) => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(event) => onChange({ ...filters, priority: event.target.value })}
          className="rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
        >
          <option value="">All priorities</option>
          {PRIORITY_LEVELS.map((priority) => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>
        <input
          type="search"
          value={filters.staff}
          onChange={(event) => onChange({ ...filters, staff: event.target.value })}
          placeholder="Search staff or machine"
          className="rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
        />
      </div>
    </div>
  );
}

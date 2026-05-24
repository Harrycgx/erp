export default function AnalyticsFilters({ period, onPeriodChange }) {
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-4 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Filters</p>
          <h2 className="mt-2 text-xl font-black text-white">Analytics view</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm text-slate-300">
            Period
            <select
              value={period}
              onChange={(event) => onPeriodChange(event.target.value)}
              className="mt-2 block w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

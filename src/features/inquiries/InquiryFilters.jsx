import { INQUIRY_STATUSES, PRIORITY_LEVELS } from '../../utils/inquiryHelpers';

export default function InquiryFilters({ search, status, priority, onSearch, onStatusChange, onPriorityChange, onCreate }) {
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Inquiry workflow</p>
          <h2 className="mt-2 text-2xl font-black text-white">Track requests with precision</h2>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
        >
          New inquiry
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
        <label className="block">
          <span className="text-sm font-medium text-slate-400">Search inquiries</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Customer, box type, notes..."
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-400">Status</span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          >
            <option value="">All statuses</option>
            {INQUIRY_STATUSES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-400">Priority</span>
          <select
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          >
            <option value="">All priorities</option>
            {PRIORITY_LEVELS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

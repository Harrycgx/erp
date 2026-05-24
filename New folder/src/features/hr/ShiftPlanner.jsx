import { getShiftBadgeClass, SHIFT_DETAILS } from '../../utils/shiftHelpers';

export default function ShiftPlanner({ employees = [] }) {
  const counts = employees.reduce(
    (acc, employee) => {
      const shift = employee.shift || 'Unassigned';
      acc[shift] = (acc[shift] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Shift planning</p>
        <h2 className="mt-2 text-2xl font-black text-white">Shift workload</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.keys(SHIFT_DETAILS).map((shift) => (
          <div key={shift} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{shift}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${getShiftBadgeClass(shift)}`}>{counts[shift] || 0}</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">{SHIFT_DETAILS[shift].description}</p>
            <p className="mt-2 text-sm text-slate-300">{SHIFT_DETAILS[shift].start} - {SHIFT_DETAILS[shift].end}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

import { getAttendanceStatusClass } from '../../utils/attendanceHelpers';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AttendanceCalendar({ records = [] }) {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDate = records.reduce((acc, record) => {
    if (record.attendance_date) acc[record.attendance_date] = record;
    return acc;
  }, {});

  const cells = [];
  for (let index = 0; index < firstDay; index += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ label: day, record: byDate[dateString] });
  }

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Attendance calendar</p>
        <h2 className="mt-2 text-2xl font-black text-white">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
      </div>
      <div className="grid gap-2 text-slate-500 sm:grid-cols-7">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs uppercase tracking-[0.3em]">{day}</div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-7">
        {cells.map((cell, index) => {
          if (!cell) return <div key={`empty-${index}`} className="min-h-[72px] rounded-3xl bg-slate-900/80" />;
          const status = cell.record?.attendance_status || 'Absent';
          return (
            <div key={cell.label} className="min-h-[72px] rounded-3xl border border-slate-800 bg-slate-900/80 p-3">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{cell.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${getAttendanceStatusClass(status)}`}>{status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

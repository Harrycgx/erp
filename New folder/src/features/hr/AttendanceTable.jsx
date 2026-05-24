import { formatAttendanceTime, getAttendanceStatusClass } from '../../utils/attendanceHelpers';

export default function AttendanceTable({ records = [] }) {
  return (
    <div className="overflow-x-auto rounded-[32px] border border-slate-700 bg-slate-950/90 p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Attendance</p>
          <h2 className="mt-2 text-2xl font-black text-white">Daily attendance</h2>
        </div>
      </div>
      <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-300">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Date</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Shift</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Check in</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Check out</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Status</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Overtime</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-slate-900/80">
              <td className="px-4 py-4 text-white">{record.attendance_date}</td>
              <td className="px-4 py-4 text-slate-300">{record.shift || 'N/A'}</td>
              <td className="px-4 py-4 text-slate-300">{formatAttendanceTime(record.check_in)}</td>
              <td className="px-4 py-4 text-slate-300">{formatAttendanceTime(record.check_out)}</td>
              <td className="px-4 py-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${getAttendanceStatusClass(record.attendance_status)}`}>
                  {record.attendance_status || 'Present'}
                </span>
              </td>
              <td className="px-4 py-4 text-slate-300">{record.overtime_hours || 0}h</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

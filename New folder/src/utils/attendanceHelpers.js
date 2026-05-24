export const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Half Day', 'Leave', 'Late'];

export function getAttendanceStatusClass(status) {
  switch (status) {
    case 'Present':
      return 'bg-emerald-900 text-emerald-100';
    case 'Absent':
      return 'bg-rose-900 text-rose-100';
    case 'Half Day':
      return 'bg-orange-900 text-orange-100';
    case 'Leave':
      return 'bg-slate-700 text-slate-100';
    case 'Late':
      return 'bg-amber-900 text-amber-100';
    default:
      return 'bg-slate-700 text-slate-100';
  }
}

export function buildAttendanceStatus(checkIn, checkOut, scheduledStart) {
  if (!checkIn) return 'Absent';
  if (checkIn && !checkOut) return 'Late';
  if (checkIn && checkOut && checkIn !== checkOut && new Date(checkIn) > new Date(scheduledStart)) return 'Late';
  return 'Present';
}

export function formatAttendanceTime(value) {
  if (!value) return '--:--';
  return new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

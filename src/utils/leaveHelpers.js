export const LEAVE_TYPES = ['Casual leave', 'Sick leave', 'Paid leave'];
export const LEAVE_STATUS = ['Pending', 'Approved', 'Rejected'];

export function getLeaveStatusClass(status) {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-900 text-emerald-100';
    case 'Rejected':
      return 'bg-rose-900 text-rose-100';
    case 'Pending':
      return 'bg-orange-900 text-orange-100';
    default:
      return 'bg-slate-700 text-slate-100';
  }
}

export function getLeaveDuration(startDate, endDate) {
  const from = new Date(startDate);
  const to = new Date(endDate);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  const diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(0, diff);
}

export const SHIFT_OPTIONS = ['Morning', 'Evening', 'Night'];

export const SHIFT_DETAILS = {
  Morning: { start: '08:00', end: '16:00', description: 'Day production shift' },
  Evening: { start: '16:00', end: '00:00', description: 'Afternoon / finishing shift' },
  Night: { start: '00:00', end: '08:00', description: 'Night operations shift' },
};

export function getShiftBadgeClass(shift) {
  switch (shift) {
    case 'Morning':
      return 'bg-amber-900 text-amber-100';
    case 'Evening':
      return 'bg-sky-900 text-sky-100';
    case 'Night':
      return 'bg-violet-900 text-violet-100';
    default:
      return 'bg-slate-700 text-slate-100';
  }
}

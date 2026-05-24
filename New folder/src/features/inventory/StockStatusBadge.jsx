const statusMap = {
  'Out of stock': 'bg-rose-900 text-rose-100',
  'Low stock': 'bg-amber-900 text-amber-100',
  'In stock': 'bg-emerald-900 text-emerald-100',
  Planned: 'bg-slate-700 text-slate-100',
  'Material Pending': 'bg-orange-900 text-orange-100',
  Ready: 'bg-sky-900 text-sky-100',
  Running: 'bg-emerald-900 text-emerald-100',
  QC: 'bg-violet-900 text-violet-100',
  Completed: 'bg-slate-600 text-slate-100',
  Delayed: 'bg-rose-900 text-rose-100',
  Unknown: 'bg-slate-700 text-slate-100',
};

export default function StockStatusBadge({ status = 'Unknown' }) {
  const classes = statusMap[status] || statusMap.Unknown;
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${classes}`}>
      {status}
    </span>
  );
}

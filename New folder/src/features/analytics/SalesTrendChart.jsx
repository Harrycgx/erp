export default function SalesTrendChart({ data = [] }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Sales trend</p>
      <h2 className="mt-2 text-2xl font-black text-white">Trend over time</h2>
      <div className="mt-6 flex items-end gap-3 overflow-x-auto">
        {data.map((point) => (
          <div key={point.label} className="flex-1 min-w-[60px] text-center">
            <div className="mx-auto mb-3 h-36 w-10 rounded-3xl bg-slate-900/90">
              <div className="h-full rounded-3xl bg-orange-500" style={{ height: `${(point.value / maxValue) * 100}%` }} />
            </div>
            <div className="text-sm text-slate-300">{point.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

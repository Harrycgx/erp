export default function RevenueChart({ data = [] }) {
  const maxAmount = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Revenue</p>
      <h2 className="mt-2 text-2xl font-black text-white">Monthly revenue</h2>
      <div className="mt-6 grid gap-3">
        <div className="grid gap-2">
          {data.map((point) => (
            <div key={point.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
              <span className="text-sm text-slate-400">{point.label}</span>
              <div className="h-3 w-full rounded-full bg-slate-900/90">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(point.value / maxAmount) * 100}%` }} />
              </div>
              <span className="ml-3 text-sm font-semibold text-white">₹{point.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

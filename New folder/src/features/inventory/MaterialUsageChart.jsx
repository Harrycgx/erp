export default function MaterialUsageChart({ items }) {
  const topItems = items
    .slice()
    .sort((a, b) => (Number(b.current_stock || 0) - Number(a.current_stock || 0)))
    .slice(0, 4);

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Material usage</p>
          <h2 className="mt-2 text-2xl font-black text-white">Top stock items</h2>
        </div>
      </div>
      <div className="space-y-4">
        {topItems.map((item) => {
          const percentage = item.current_stock ? Math.min(100, Math.round((Number(item.current_stock) / (topItems[0]?.current_stock || 1)) * 100)) : 0;
          return (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
                <span>{item.material_name}</span>
                <span>{item.current_stock} {item.unit}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

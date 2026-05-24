export default function KPIGrid({ metrics = [] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-5 shadow-xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
          <p className="mt-4 text-3xl font-black text-white">{metric.value}</p>
          {metric.change ? <p className="mt-2 text-sm text-slate-500">{metric.change}</p> : null}
        </div>
      ))}
    </div>
  );
}

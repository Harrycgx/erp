export default function PredictionCard({ title, current, forecast, trend }) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{title}</p>
      <h3 className="mt-3 text-3xl font-black text-white">{forecast?.toLocaleString ? `₹${forecast.toLocaleString()}` : forecast}</h3>
      <p className="mt-2 text-sm text-slate-400">Current: {current?.toLocaleString ? `₹${current.toLocaleString()}` : current}</p>
      <div className="mt-4 inline-flex rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold text-slate-300">{trend}</div>
    </div>
  );
}

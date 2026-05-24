export default function InventoryHealthChart({ riskScore = 0 }) {
  const status = riskScore > 70 ? 'High risk' : riskScore > 40 ? 'Moderate risk' : 'Healthy';
  const color = riskScore > 70 ? 'bg-rose-500' : riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Inventory health</p>
      <h2 className="mt-2 text-2xl font-black text-white">Stock risk score</h2>
      <div className="mt-6 rounded-3xl bg-slate-900/90 p-6 text-center">
        <p className="text-sm text-slate-400">Current inventory risk</p>
        <p className={`mt-4 text-5xl font-black ${color}`}>{riskScore}%</p>
        <p className="mt-3 text-sm text-slate-300">{status}</p>
      </div>
    </div>
  );
}

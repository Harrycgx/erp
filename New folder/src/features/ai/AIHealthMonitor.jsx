export default function AIHealthMonitor({ overview = {} }) {
  const { healthScore = 0, inventoryRiskScore, productionPressureScore, financeRiskScore, hrRiskScore } = overview;
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Factory health</p>
          <h2 className="mt-2 text-3xl font-black text-white">Operational score</h2>
        </div>
        <div className="rounded-full bg-slate-900/90 px-5 py-3 text-2xl font-black text-emerald-400">{healthScore}%</div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Inventory risk', value: `${inventoryRiskScore ?? 0}%` },
          { label: 'Production pressure', value: `${productionPressureScore ?? 0}%` },
          { label: 'Finance risk', value: `${financeRiskScore ?? 0}%` },
          { label: 'HR strain', value: `${hrRiskScore ?? 0}%` },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl bg-slate-900/90 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

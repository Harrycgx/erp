export default function AIInsightsPanel({ insights = [] }) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">AI insights</p>
          <h2 className="mt-2 text-3xl font-black text-white">Operational intelligence</h2>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {insights.map((insight) => (
          <div key={insight.title} className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-white">{insight.title}</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${insight.level === 'Critical' ? 'bg-rose-500 text-white' : insight.level === 'High' ? 'bg-orange-500 text-white' : insight.level === 'Medium' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-200'}`}>
                {insight.level}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

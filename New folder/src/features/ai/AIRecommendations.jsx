export default function AIRecommendations({ recommendations = [] }) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Recommendations</p>
          <h2 className="mt-2 text-3xl font-black text-white">Actionable next steps</h2>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {recommendations.map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5">
            <h3 className="font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

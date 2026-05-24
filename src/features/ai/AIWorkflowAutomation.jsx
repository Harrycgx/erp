export default function AIWorkflowAutomation({ workflows = [] }) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Automation workflow</p>
          <h2 className="mt-2 text-3xl font-black text-white">Intelligent orchestration</h2>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {workflows.map((flow) => (
          <div key={flow.name} className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">{flow.name}</h3>
                <p className="text-sm text-slate-400">{flow.status}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${flow.active ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-200'}`}>
                {flow.active ? 'Active' : 'Paused'}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{flow.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

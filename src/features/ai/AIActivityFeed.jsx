export default function AIActivityFeed({ events = [] }) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Activity feed</p>
          <h2 className="mt-2 text-3xl font-black text-white">Recent AI events</h2>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {events.map((event) => (
          <div key={`${event.time}-${event.message}`} className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-white">{event.message}</p>
              <span className="text-xs uppercase tracking-[0.24em] text-slate-400">{event.time}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{event.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

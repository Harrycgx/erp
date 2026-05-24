export default function QuoteTimeline({ events = [] }) {
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-5 shadow-xl shadow-black/20">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Approval history</p>
      <div className="mt-4 space-y-4">
        {sortedEvents.length ? (
          sortedEvents.map((event) => (
            <div key={`${event.type}-${event.date}-${event.label}`} className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
              <div>
                <p className="text-sm font-semibold text-white">{event.label}</p>
                <p className="text-sm text-slate-400">{event.description}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">{new Date(event.date).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No history recorded for this quotation yet.</p>
        )}
      </div>
    </div>
  );
}

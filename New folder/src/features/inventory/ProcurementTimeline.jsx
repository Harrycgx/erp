export default function ProcurementTimeline({ items }) {
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Procurement timeline</p>
          <h2 className="mt-2 text-2xl font-black text-white">Recent purchase activity</h2>
        </div>
      </div>
      <div className="space-y-4">
        {items.length ? (
          items.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{item.po_number || 'PO pending'}</p>
                  <p className="mt-1 text-slate-400">{item.material_name} • {item.quantity}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{item.status || 'Pending'}</span>
              </div>
              <p className="mt-3 text-slate-500 text-xs">Expected delivery: {item.expected_delivery ? new Date(item.expected_delivery).toLocaleDateString('en-IN') : 'TBD'}</p>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 text-sm text-slate-400">No recent procurement activity available.</div>
        )}
      </div>
    </div>
  );
}

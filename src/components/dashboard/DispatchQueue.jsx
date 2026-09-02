// MOCK DATA — not connected to real dispatch database (SCHEMA / ADMIN blocked)
const dispatches = [
  { id: 'DIS001', customer: 'Premium Retail Inc', weight: '240kg', status: 'ready', priority: 'urgent', eta: 'Today' },
  { id: 'DIS002', customer: 'Tech Packaging Co', weight: '180kg', status: 'ready', priority: 'high', eta: 'Today' },
  { id: 'DIS003', customer: 'Global Logistics', weight: '520kg', status: 'processing', priority: 'normal', eta: 'Tomorrow' },
  { id: 'DIS004', customer: 'Regional Distrib', weight: '360kg', status: 'delayed', priority: 'normal', eta: '2 days' },
  { id: 'DIS005', customer: 'Express Shipping', weight: '95kg', status: 'ready', priority: 'high', eta: 'Today' },
  { id: 'DIS006', customer: 'Multi-Channel Ret', weight: '450kg', status: 'processing', priority: 'normal', eta: 'Tomorrow' },
];

const statusConfig = {
  ready: { badge: 'bg-green-100 text-green-700', icon: '✓', label: 'Ready' },
  processing: { badge: 'bg-blue-100 text-blue-700', icon: '⟳', label: 'Processing' },
  delayed: { badge: 'bg-red-100 text-red-700', icon: '!', label: 'Delayed' },
};

const priorityConfig = {
  urgent: 'text-red-600 font-black',
  high: 'text-orange-600 font-semibold',
  normal: 'text-slate-600 font-medium',
};

export default function DispatchQueue() {
  const ready = dispatches.filter(d => d.status === 'ready').length;
  const delayed = dispatches.filter(d => d.status === 'delayed').length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Dispatch Queue</h3>
          <p className="mt-1 text-sm text-slate-500">{dispatches.length} shipments</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-lg bg-green-50 px-3 py-1.5">
            <span className="text-sm font-semibold text-green-700">{ready} Ready</span>
          </div>
          {delayed > 0 && (
            <div className="rounded-lg bg-red-50 px-3 py-1.5">
              <span className="text-sm font-semibold text-red-700">{delayed} Delayed</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {dispatches.map((dispatch) => {
          const config = statusConfig[dispatch.status];
          return (
            <div
              key={dispatch.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-slate-300"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-semibold ${config.badge}`}>
                {config.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <h4 className="font-semibold text-slate-900 truncate">{dispatch.id}</h4>
                  <span className={`text-xs ${priorityConfig[dispatch.priority]}`}>
                    {dispatch.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 truncate">{dispatch.customer}</p>
              </div>

              <div className="hidden sm:flex sm:flex-col sm:items-end sm:gap-1">
                <span className="text-sm font-medium text-slate-900">{dispatch.weight}</span>
                <span className="text-xs text-slate-500">{dispatch.eta}</span>
              </div>

              <div className="text-right">
                <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${config.badge}`}>
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

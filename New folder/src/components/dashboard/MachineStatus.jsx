const machines = [
  { id: 1, name: 'Cutting Line A', status: 'running', uptime: 98.5, efficiency: 94 },
  { id: 2, name: 'Print Press B', status: 'running', uptime: 97.2, efficiency: 91 },
  { id: 3, name: 'Die Cut C', status: 'running', uptime: 95.8, efficiency: 88 },
  { id: 4, name: 'Laminating D', status: 'maintenance', uptime: 0, efficiency: 0 },
  { id: 5, name: 'Folding Line E', status: 'idle', uptime: 92.1, efficiency: 85 },
  { id: 6, name: 'Quality Check F', status: 'running', uptime: 99.1, efficiency: 96 },
];

const statusConfig = {
  running: { badge: 'bg-green-100 text-green-700', light: 'bg-green-500', label: 'Running' },
  idle: { badge: 'bg-yellow-100 text-yellow-700', light: 'bg-yellow-500', label: 'Idle' },
  maintenance: { badge: 'bg-red-100 text-red-700', light: 'bg-red-500', label: 'Maintenance' },
};

export default function MachineStatus() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Machine Fleet</h3>
        <p className="mt-1 text-sm text-slate-500">6 production machines</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {machines.map((machine) => {
          const config = statusConfig[machine.status];
          return (
            <div
              key={machine.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">{machine.name}</h4>
                  <span className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${config.badge}`}>
                    {config.label}
                  </span>
                </div>
                <div className={`h-3 w-3 rounded-full ${config.light}`} />
              </div>

              {machine.status !== 'maintenance' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Uptime</span>
                      <span className="font-semibold text-slate-900">{machine.uptime}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${machine.uptime}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Efficiency</span>
                      <span className="font-semibold text-slate-900">{machine.efficiency}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-purple-500"
                        style={{ width: `${machine.efficiency}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {machine.status === 'maintenance' && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  Scheduled maintenance in progress
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

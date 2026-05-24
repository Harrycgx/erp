import StatCard from '../ui/StatCard';

const metrics = {
  dailyOutput: 1240,
  weeklyProduction: 8950,
  wasteEstimate: 2.4,
  efficiency: 94,
  orderCompletion: 96,
};

const dailyTrend = [
  { day: 'Mon', units: 1100, target: 1200 },
  { day: 'Tue', units: 1180, target: 1200 },
  { day: 'Wed', units: 1240, target: 1200 },
  { day: 'Thu', units: 1150, target: 1200 },
  { day: 'Fri', units: 1280, target: 1200 },
  { day: 'Sat', units: 850, target: 1200 },
  { day: 'Sun', units: 0, target: 0 },
];

export default function ProductionMetrics() {
  const maxUnits = Math.max(...dailyTrend.map(d => d.target));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Production Analytics</h3>
        <p className="mt-1 text-sm text-slate-500">Weekly performance overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          value={metrics.dailyOutput}
          label="Today's Output"
          className="border-l-4 border-l-blue-500"
        />
        <StatCard
          value={metrics.weeklyProduction}
          label="Weekly Units"
          className="border-l-4 border-l-emerald-500"
        />
        <StatCard
          value={`${metrics.wasteEstimate}%`}
          label="Waste Rate"
          className="border-l-4 border-l-orange-500"
        />
        <StatCard
          value={`${metrics.efficiency}%`}
          label="Efficiency"
          className="border-l-4 border-l-purple-500"
        />
        <StatCard
          value={`${metrics.orderCompletion}%`}
          label="On-Time Rate"
          className="border-l-4 border-l-green-500"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="font-semibold text-slate-900">Daily Output vs Target</h4>
        <div className="mt-6 flex items-end justify-between gap-1 h-40">
          {dailyTrend.map((day, idx) => (
            <div key={idx} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full h-32 flex items-end justify-center gap-1">
                {day.units > 0 && (
                  <div
                    className="w-full bg-blue-500 rounded-t-lg transition hover:bg-blue-600"
                    style={{ height: `${(day.units / maxUnits) * 100}%` }}
                    title={`${day.units} units`}
                  />
                )}
                {day.target > 0 && (
                  <div
                    className="absolute bottom-0 left-1/2 w-1 bg-slate-400 rounded-full opacity-50"
                    style={{ height: `${(day.target / maxUnits) * 100}%`, transform: 'translateX(-50%)' }}
                    title={`Target: ${day.target}`}
                  />
                )}
              </div>
              <span className="text-xs font-medium text-slate-600">{day.day}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-4 rounded-sm bg-blue-500" />
            <span className="text-slate-600">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-4 rounded-sm bg-slate-400" />
            <span className="text-slate-600">Target</span>
          </div>
        </div>
      </div>
    </div>
  );
}

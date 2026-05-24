import StatCard from '../ui/StatCard';

const mockData = {
  activeOrders: 24,
  productionLoad: 87,
  dispatchCount: 8,
  delayedJobs: 2,
  machineUtilization: 92,
};

export default function FactoryOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Factory Status</h3>
        <p className="mt-1 text-sm text-slate-500">Real-time operational metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          value={mockData.activeOrders}
          label="Active Orders"
          className="border-l-4 border-l-blue-500"
        />
        <StatCard
          value={`${mockData.productionLoad}%`}
          label="Production Load"
          className="border-l-4 border-l-green-500"
        />
        <StatCard
          value={mockData.dispatchCount}
          label="Ready to Ship"
          className="border-l-4 border-l-emerald-500"
        />
        <StatCard
          value={mockData.delayedJobs}
          label="Delayed Jobs"
          className="border-l-4 border-l-orange-500"
        />
        <StatCard
          value={`${mockData.machineUtilization}%`}
          label="Machine Util."
          className="border-l-4 border-l-purple-500"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Overall Factory Health</span>
            <span className="text-2xl font-black text-green-600">94%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-600" style={{ width: '94%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

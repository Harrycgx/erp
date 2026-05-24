import { useEffect, useState } from 'react';
import { fetchDashboardMetrics } from '../services/dashboardService';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      setLoading(true);
      const { data, error: fetchError } = await fetchDashboardMetrics();
      if (!mounted) return;
      if (fetchError) {
        setError(fetchError.message || 'Unable to load dashboard metrics.');
        setDashboard(null);
      } else {
        setError('');
        setDashboard(data);
      }
      setLoading(false);
    }
    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = dashboard?.metrics || [
    { value: loading ? '...' : '0', label: 'Active Quotes' },
    { value: loading ? '...' : '0', label: 'Orders Running' },
    { value: loading ? '...' : '0%', label: 'Production Efficiency' },
    { value: loading ? '...' : '0', label: 'Low Stock Alerts' },
  ];

  return (
    <main className="min-h-screen bg-[#0B1020] text-white px-6 lg:px-10 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">Dashboard</h1>
          <p className="text-slate-400 text-lg">
            Enterprise control center for quotes, orders, production,
            and operational workflows.
          </p>
        </div>

        {error ? (
          <div className="mb-8 rounded-3xl border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {metrics.map(({ value, label }) => (
            <div key={label} className="glass rounded-3xl p-8 card-hover">
              <div className="text-4xl font-bold text-blue-400 mb-3">{value}</div>
              <div className="text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass rounded-3xl p-8 card-hover">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Recent Production</h2>
                <p className="text-slate-400">Live manufacturing workflow overview</p>
              </div>
            </div>

            <div className="space-y-5">
              {(dashboard?.productionJobs || []).map((job) => {
                const status = String(job.production_stage || 'pending').replace(/_/g, ' ');
                const progressMap = {
                  pending: 10,
                  paper_ordered: 20,
                  printing: 35,
                  punching: 50,
                  pasting: 65,
                  qc: 78,
                  dispatch_ready: 88,
                  dispatched: 95,
                  delivered: 100,
                };
                const progress = progressMap[String(job.production_stage || '').toLowerCase()] || 10;
                return (
                  <div key={job.id} className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold text-lg">{job.box_type || job.order_number || 'Production job'}</div>
                        <div className="text-slate-400 text-sm capitalize">{status}</div>
                      </div>
                      <div className="text-blue-400 font-bold">{progress}%</div>
                    </div>
                    <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}

              {!loading && !dashboard?.productionJobs?.length ? (
                <div className="glass rounded-2xl p-5 text-sm text-slate-400">No production jobs are available.</div>
              ) : null}
            </div>
          </div>

          <div className="glass rounded-3xl p-8 card-hover h-fit">
            <h2 className="text-2xl font-bold mb-8">Recent Activity</h2>
            <div className="space-y-4">
              {(dashboard?.activityLogs || []).map((activity) => (
                <div key={activity.id} className="glass rounded-2xl p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">{activity.activity_type?.replace(/_/g, ' ') || 'Activity'}</p>
                  <p className="mt-2 text-slate-400">{activity.message}</p>
                </div>
              ))}
              {!loading && !dashboard?.activityLogs?.length ? (
                <div className="glass rounded-2xl p-5 text-sm text-slate-400">No activity logs are available.</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

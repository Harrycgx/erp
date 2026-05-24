import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardMetrics } from '../services/dashboardService';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadMetrics() {
      setLoading(true);
      const { data, error: fetchError } = await fetchDashboardMetrics();
      if (!mounted) return;
      if (fetchError) {
        setError(fetchError.message || 'Unable to load admin metrics.');
      } else {
        setMetrics(data);
      }
      setLoading(false);
    }
    loadMetrics();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-24">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-orange-400">Admin console</p>
              <h1 className="mt-3 text-4xl font-semibold">Operational command center</h1>
              <p className="mt-3 max-w-2xl text-slate-400">Monitor user access, manage ERP workflows, and validate role-based routing for your organization.</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 px-6 py-4 text-right text-slate-200 shadow-inner shadow-black/20">
              <p className="text-sm text-slate-400">Signed in as</p>
              <p className="mt-2 text-xl font-semibold">{profile?.full_name || 'Administrator'}</p>
              <p className="text-sm text-slate-400">Role: {profile?.role}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {['Active users', 'Pending approvals', 'System health'].map((label, index) => (
            <div key={label} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{label}</p>
              <p className="mt-6 text-4xl font-bold text-white">{loading ? '...' : metrics?.summary?.[index] ?? '—'}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10">
          <h2 className="text-2xl font-semibold">Quick actions</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <p className="text-sm text-slate-400">Review role assignments</p>
              <p className="mt-3 text-lg font-medium">Ensure every login path matches the correct role.</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <p className="text-sm text-slate-400">Audit profiles</p>
              <p className="mt-3 text-lg font-medium">Confirm employee and customer profile integrity.</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <p className="text-sm text-slate-400">Access control</p>
              <p className="mt-3 text-lg font-medium">Use role protection to keep admin routes private.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

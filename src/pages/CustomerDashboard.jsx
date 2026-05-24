import { useAuth } from '../context/AuthContext';

export default function CustomerDashboard() {
  const { profile } = useAuth();

  return (
    <main className="min-h-screen bg-[#080d1e] text-white px-6 py-24">
      <div className="mx-auto max-w-5xl space-y-10">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-10 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-orange-400">Customer dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold">Account overview</h1>
              <p className="mt-3 max-w-2xl text-slate-400">View your orders, quotations, invoices, and account details in a secure customer workspace.</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 px-6 py-4 text-right text-slate-200 shadow-inner shadow-black/20">
              <p className="text-sm text-slate-400">Welcome back</p>
              <p className="mt-2 text-xl font-semibold">{profile?.full_name || 'Customer'}</p>
              <p className="text-sm text-slate-400">{profile?.email}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Active quotations</p>
            <p className="mt-6 text-4xl font-bold text-white">12</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Open orders</p>
            <p className="mt-6 text-4xl font-bold text-white">8</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Invoices</p>
            <p className="mt-6 text-4xl font-bold text-white">4</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-10">
          <h2 className="text-2xl font-semibold">Your account details</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
              <p className="text-sm text-slate-400">Company</p>
              <p className="mt-3 text-lg font-medium">{profile?.company_name || 'Not specified'}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
              <p className="text-sm text-slate-400">Phone</p>
              <p className="mt-3 text-lg font-medium">{profile?.phone || 'Not specified'}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

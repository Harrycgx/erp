import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const { profile, loading, getRoleHomePath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-20">
        <div className="rounded-3xl border border-slate-700 bg-slate-900/90 px-8 py-8 text-center">
          <p className="text-sm text-slate-400">Checking permissions…</p>
        </div>
      </div>
    );
  }

  const homePath = profile ? getRoleHomePath(profile.role) : '/login';

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-24">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900/90 p-10 text-center shadow-2xl shadow-black/20">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Unauthorized</p>
        <h1 className="mt-4 text-4xl font-semibold">Access denied</h1>
        <p className="mt-4 text-base text-slate-400">Your account does not have permission to view this resource.</p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to={homePath}
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Return to dashboard
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-slate-700 bg-transparent px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-orange-400"
          >
            Sign in as another user
          </Link>
        </div>
      </div>
    </main>
  );
}

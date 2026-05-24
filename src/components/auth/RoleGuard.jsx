import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { hasRole } from '../../config/permissions';

export default function RoleGuard({ allowedRoles = [], children }) {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-slate-300">
        <p className="inline-flex items-center rounded-3xl border border-slate-700 bg-slate-950/90 px-6 py-5 text-sm font-medium">Checking permissions...</p>
      </div>
    );
  }

  if (!profile || !hasRole(profile, allowedRoles)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center text-slate-200">
        <div className="rounded-[2rem] border border-slate-700 bg-slate-950/80 p-10 shadow-xl shadow-black/20 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">Unauthorized</h2>
          <p className="mt-4 text-sm text-slate-400">You do not have permission to access this area.</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-8 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Return to dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}

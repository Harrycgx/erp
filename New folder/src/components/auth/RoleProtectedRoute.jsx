import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasRole } from '../../config/permissions';

export default function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-slate-300">
        <p className="inline-flex items-center rounded-3xl border border-slate-700 bg-slate-950/90 px-6 py-5 text-sm font-medium">Checking permissions...</p>
      </div>
    );
  }

  if (!profile || !hasRole(profile, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

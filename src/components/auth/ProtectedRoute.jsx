import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-slate-300">
        <p className="inline-flex items-center rounded-3xl border border-slate-700 bg-slate-950/90 px-6 py-5 text-sm font-medium">Loading authentication status...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

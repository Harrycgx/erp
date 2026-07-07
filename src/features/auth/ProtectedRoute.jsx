import useAuth from "./useAuth";
import { useLocation, Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const location = useLocation();
  const {
    user,
    roles,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="p-10 text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const allowed =
    allowedRoles.length === 0 ||
    allowedRoles.some((role) =>
      roles.includes(role)
    );

  if (!allowed) {
    return (
      <div className="p-10 text-red-400">
        Access Denied
      </div>
    );
  }

  return children;
}
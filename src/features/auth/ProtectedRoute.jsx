import useAuth from "./useAuth";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
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
    return (
      <div className="p-10 text-red-400">
        Unauthorized
      </div>
    );
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
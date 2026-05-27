import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RoleProtectedRoute({
  allowedRoles = [],
  children,
}) {
  const {
    user,
    profile,
    loading,
  } = useAuth();

  console.log("ROLE ROUTE CHECK");
  console.log("USER", user);
  console.log("PROFILE", profile);
  console.log("LOADING", loading);

  // WAIT until auth finishes
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-slate-300">
        <p className="inline-flex items-center rounded-3xl border border-slate-700 bg-slate-950/90 px-6 py-5 text-sm font-medium">
          Verifying permissions...
        </p>
      </div>
    );
  }

  // NO USER
  if (!user) {
    console.log("NO USER FOUND");
    return <Navigate to="/login" replace />;
  }

  // PROFILE MISSING
  if (!profile) {
    console.log("PROFILE MISSING");
    return (
      <div className="text-center text-red-400 py-20">
        Profile not found.
      </div>
    );
  }

  console.log("PROFILE ROLE", profile.role);
  console.log("ALLOWED ROLES", allowedRoles);

  // ROLE CHECK
  const hasAccess = allowedRoles.includes(
    profile.role
  );

  if (!hasAccess) {
    console.log("ACCESS DENIED");
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("ACCESS GRANTED");

  return children;
}
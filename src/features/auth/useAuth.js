import { useAuthContext } from "./AuthProvider";

export default function useAuth() {
  const context =
    useAuthContext();

  const hasRole = (role) => {
    return context.roles.includes(
      role
    );
  };

  return {
    ...context,
    hasRole,
  };
}
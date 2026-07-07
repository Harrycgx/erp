import { useAuthContext } from "./AuthProvider";

export default function useAuth() {
  const context =
    useAuthContext();

  console.log("[TRACE:A] useAuth() — context values", {
    hasUser: !!context.user,
    hasLogin: typeof context.login === "function",
    hasLogout: typeof context.logout === "function",
    loading: context.loading,
    rolesLength: context.roles?.length,
  });

  const hasRole = (role) => {
    return context.roles.includes(role);
  };

  return {
    ...context,
    hasRole,
  };
}

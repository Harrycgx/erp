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
  console.log("AUTH START");

async function loadUser() {
  console.log("GET SESSION");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("SESSION", session);

  const currentUser =
    session?.user ?? null;

  setUser(currentUser);

  console.log("BEFORE LOAD ROLES");

  if (currentUser) {
    await loadRoles(currentUser.id);
  }

  console.log("SETTING LOADING FALSE");

  setLoading(false);
}
}
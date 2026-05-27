import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import supabase from "../../lib/supabase";

const AuthContext =
  createContext();

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [roles, setRoles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      const currentUser =
        session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await loadRoles(
          currentUser.id
        );
      }

      setLoading(false);
    }

    loadUser();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        async (_event, session) => {
          const currentUser =
            session?.user ?? null;

          setUser(currentUser);

          if (currentUser) {
            await loadRoles(
              currentUser.id
            );
          } else {
            setRoles([]);
          }
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loadRoles(
    userId
  ) {
    const { data, error } =
      await supabase
        .from("user_roles")
        .select(`
          roles (
            name
          )
        `)
        .eq("user_id", userId);

    if (error) {
      console.error(error);

      return;
    }

    const mappedRoles =
      data.map(
        (item) =>
          item.roles.name
      );

    setRoles(mappedRoles);
  }

  const value = {
    user,
    roles,
    loading,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
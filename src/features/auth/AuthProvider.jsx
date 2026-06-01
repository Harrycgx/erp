import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import supabase from "../../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [roles, setRoles] =
    useState(["admin"]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        const currentUser =
          session?.user ?? null;

        setUser(currentUser);

        // TEMPORARY BYPASS
        setRoles(["admin"]);
      } catch (error) {
        console.error(
          "AUTH ERROR",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          session
        ) => {
          const currentUser =
            session?.user ?? null;

          setUser(currentUser);

          // TEMPORARY BYPASS
          setRoles(["admin"]);
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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
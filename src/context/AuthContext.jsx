// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useRef, useState } from "react";
import supabase from "../lib/supabase";

const getRoleHomePath = (role) => {

  switch (role) {

    case "admin":
      return "/";

    case "staff":
      return "/staff";

    default:
      return "/";
  }
};
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const initialized = useRef(false);

  // ─── fetchProfile ─────────────────────────────────────────────────────────
  const fetchProfile = async (userId) => {

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .limit(1);


    if (error) {
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const profile = data[0];
    return profile;
  };

  // ─── Auth Listener ────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;


    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id).then((p) => {
          setProfile(p);
          setAuthReady(true);
        });
      } else {
        setAuthReady(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
        }

        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async ({ email, password }) => {

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const user = data?.user;

    if (!user) throw new Error("No authenticated user returned");

    const profile = await fetchProfile(user.id);

    if (!profile) throw new Error("Profile not found in database");

    if (profile.role !== "admin") {
      throw new Error("Unauthorized: admin role required");
    }

    setUser(user);
    setProfile(profile);

    return { user, profile };
  };


  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // ─── Forgot Password ──────────────────────────────────────────────────────
  const forgotPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  // ─── Provider ─────────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{ user, profile, authReady, login, logout, forgotPassword,getRoleHomePath }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

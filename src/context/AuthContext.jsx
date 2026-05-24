import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import supabase from '../lib/supabase';
import { createProfile, getProfileById, createRoleLinkedRecord } from '../services/authService';
import { getRoleHomePath, ROLES } from '../config/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    const { data, error: profileError } = await getProfileById(userId);
    if (profileError) {
      setProfile(null);
      return null;
    }

    setProfile(data);
    return data;
  };

  useEffect(() => {
    let authSubscription = null;

    const initializeAuth = async () => {
      setLoading(true);
      setError(null);

      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session ?? null;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user?.id) {
        await loadProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }

      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession ?? null);
        setUser(newSession?.user ?? null);

        if (newSession?.user?.id) {
          await loadProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      });

      authSubscription = listener.subscription;
      setLoading(false);
    };

    initializeAuth();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      throw authError;
    }

    const sessionData = data?.session ?? null;
    setSession(sessionData);
    setUser(sessionData?.user ?? null);

    const profileData = sessionData?.user?.id ? await loadProfile(sessionData.user.id) : null;
    setLoading(false);

    return {
      session: sessionData,
      user: sessionData?.user ?? data?.user ?? null,
      profile: profileData,
    };
  };

  const register = async ({
    fullName,
    email,
    password,
    role = ROLES.CUSTOMER,
    phone,
    companyName,
    billingAddress,
    shippingAddress,
    gstNumber,
    vendorType,
    paymentTerms,
    department,
    designation,
    joiningDate,
    salary,
    employeeCode,
  }) => {
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      throw authError;
    }

    const userId = data?.user?.id ?? data?.session?.user?.id;
    if (!userId) {
      const errorMessage = 'Unable to create authentication user.';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }

    const profilePayload = {
      id: userId,
      auth_user_id: userId,
      full_name: fullName,
      email,
      phone,
      role,
    };

    const { error: profileError } = await createProfile(profilePayload);
    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      throw profileError;
    }

    const rolePayload = {
      full_name: fullName,
      email,
      phone,
      company_name: companyName,
      billing_address: billingAddress,
      shipping_address: shippingAddress,
      gst_number: gstNumber,
      vendor_type: vendorType,
      payment_terms: paymentTerms,
      department,
      designation,
      joining_date: joiningDate,
      salary,
      employee_code: employeeCode,
    };

    const { error: entityError } = await createRoleLinkedRecord(userId, role, rolePayload);
    if (entityError) {
      setError(entityError.message);
      setLoading(false);
      throw entityError;
    }

    const profileData = await loadProfile(userId);
    setLoading(false);

    return {
      session: data?.session ?? null,
      user: data?.user ?? (data?.session?.user ?? null),
      profile: profileData,
    };
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      setLoading(false);
      throw signOutError;
    }

    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);

    const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      throw resetError;
    }

    setLoading(false);
    return data;
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      loading,
      error,
      isAuthenticated: Boolean(user),
      getRoleHomePath,
      login,
      register,
      logout,
      forgotPassword,
    }),
    [user, profile, session, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

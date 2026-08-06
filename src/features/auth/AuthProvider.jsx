import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import supabase from "../../lib/supabase";

const AuthContext = createContext();

// In-flight cache: if fetchProfile() is called twice for the same userId
// while the first call is still resolving (e.g. login()'s own fetch and the
// onAuthStateChange listener's fetch both firing for the same sign-in), the
// second call reuses the first's promise instead of firing a duplicate query.
const inFlightProfileFetches = new Map();

async function fetchProfile(userId) {
  if (inFlightProfileFetches.has(userId)) {
    return inFlightProfileFetches.get(userId);
  }

  const promise = (async () => {
    console.log("[TRACE:PF1] fetchProfile() ENTERED", { userId });
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .limit(1);

    console.log("[TRACE:PF2] fetchProfile() query result", {
      hasError: !!error,
      errorMessage: error?.message,
      errorCode: error?.code,
      hasData: !!data,
      dataLength: data?.length,
      firstRow: data?.[0],
    });

    if (error || !data || data.length === 0) {
      console.log("[TRACE:PF3] fetchProfile() returning NULL");
      return null;
    }

    console.log("[TRACE:PF4] fetchProfile() returning profile", data[0]);
    return data[0];
  })();

  inFlightProfileFetches.set(userId, promise);

  try {
    return await promise;
  } finally {
    inFlightProfileFetches.delete(userId);
  }
}

function rolesFromProfile(profile) {
  if (!profile?.role) return [];
  return [profile.role];
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[TRACE:INIT1] AuthProvider useEffect() MOUNTED");

    async function loadUser() {
      console.log("[TRACE:INIT2] loadUser() STARTED");
      try {
        console.log("[TRACE:INIT3] Calling supabase.auth.getSession()...");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("[TRACE:INIT4] getSession() returned", {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
        });

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          console.log("[TRACE:INIT5] Session exists — fetching profile...");
          const profile = await fetchProfile(currentUser.id);
          setRoles(rolesFromProfile(profile));
        } else {
          console.log("[TRACE:INIT5a] No session — user is null");
        }
      } catch (error) {
        console.error("[TRACE:INIT-ERR] loadUser() CATCH", {
          message: error?.message,
          name: error?.name,
          stack: error?.stack?.substring(0, 300),
        });
      } finally {
        setLoading(false);
        console.log("[TRACE:INIT6] loadUser() FINISHED — loading set to false");
      }
    }

    loadUser();

    console.log("[TRACE:INIT7] Registering onAuthStateChange listener...");
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("[TRACE:AUTH-CHANGE] onAuthStateChange FIRED", {
          event: _event,
          hasSession: !!session,
          userId: session?.user?.id,
        });

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (!currentUser) {
          setRoles([]);
          return;
        }

        // Deferred: fetchProfile() calls supabase.from(...), which needs the
        // client's internal auth lock. Calling it synchronously in this
        // callback deadlocks against signInWithPassword/getSession, which
        // are still holding that lock when this fires.
        setTimeout(() => {
          fetchProfile(currentUser.id).then((profile) => {
            setRoles(rolesFromProfile(profile));
          });
        }, 0);
      }
    );
    console.log("[TRACE:INIT8] onAuthStateChange listener registered");

    return () => {
      console.log("[TRACE:INIT9] AuthProvider UNMOUNTING — unsubscribing listener");
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    console.log("[TRACE:3] login() ENTERED", {
      email,
      passwordLength: password?.length,
    });

    console.log("[TRACE:4] Calling supabase.auth.signInWithPassword()...");
    const signInPromise = supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log("[TRACE:4a] signInWithPassword() called — Promise created", {
      isPromise: signInPromise instanceof Promise,
    });

    console.log("[TRACE:4b] Awaiting signInWithPassword() Promise...");
    const { data, error } = await signInPromise;
    console.log("[TRACE:5] signInWithPassword() Promise RESOLVED", {
      hasError: !!error,
      errorStatus: error?.status,
      errorMessage: error?.message,
      errorName: error?.name,
      errorCode: error?.code,
      fullError: error
        ? JSON.stringify(error, Object.getOwnPropertyNames(error))
        : null,
      hasData: !!data,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      dataKeys: data ? Object.keys(data) : "NONE",
    });

    if (error) {
      console.log("[TRACE:5a] signInWithPassword() returned ERROR — throwing");
      throw error;
    }

    const authUser = data?.user;

    if (!authUser) {
      console.log("[TRACE:5b] No user in data — throwing");
      throw new Error("No authenticated user returned");
    }

    console.log("[TRACE:5c] Auth user obtained — fetching profile...");
    const profile = await fetchProfile(authUser.id);

    if (!profile) {
      console.log("[TRACE:5d] No profile found — throwing");
      throw new Error("Profile not found in database");
    }

    console.log("[TRACE:5e] Setting user and roles...");
    setUser(authUser);
    setRoles(rolesFromProfile(profile));

    console.log("[TRACE:5f] login() RETURNING", {
      user: authUser.id,
      profile: profile.id,
    });
    return { user: authUser, profile };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRoles([]);
  }, []);

  const value = useMemo(
    () => ({ user, roles, loading, login, logout }),
    [user, roles, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
//SCRIPTA V1.240526 - FULL AUTH CENTRALIZATION REWRITE
//SCRIPTA V1.250526 - NAVBAR - DB SYNCHRONIZATION 
//scripta V1.050626.002 - AuthProvider diagnostics
//scripta v1.090626.003 - AuthProvider Stabilization Build
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { getSupabase } from "@/lib/supabaseClient";
import { resolveEffectiveTier } from "@/lib/resolveEffectiveTier";

const supabase = getSupabase();

type AuthContextType = {
  user: any;
  loading: boolean;

  profile: any;

  tier: string;
  effectiveTier: string;
  effectiveStatus: string;

  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,

  profile: null,

  tier: "free",
  effectiveTier: "free",
  effectiveStatus: "active",

  refreshAuth: async () => {},
  logout: async () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  /* =========================================
      AUTH STATE
  ========================================= */
  const [user, setUser] = useState<any>(null);

  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  /* =========================================
      CLEAR AUTH STATE
  ========================================= */
  const clearAuthState = useCallback(() => {
    setUser(null);
    setProfile(null);
  }, []);

  /* =========================================
      LOAD PROFILE
  ========================================= */
  const refreshProfile = useCallback(

    async (activeUser: any) => {

      if (!activeUser) return;

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          subscription_tier,
          subscription_status,
          grace_period_until
        `)
        .eq("user_id", activeUser.id)
        .maybeSingle();

      if (error) {

        console.error(
          "PROFILE LOAD ERROR:",
          error
        );

        return;
      }

      setProfile(data || null);

    },

    []

  );                                                                 //-----|🟡🟡PATCHED 250526

  /* =========================================
      AUTH REFRESH
  ========================================= */
  const refreshAuth = useCallback(

    async () => {

      try {
        setLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const activeUser =
          session?.user || null;

        if (!activeUser) {
          clearAuthState();
        } else {
          setUser(activeUser);
          await refreshProfile(
            activeUser
          );
        }

      } catch (error) {
        console.error(
          "AUTH REFRESH ERROR:",
          error
        );
        clearAuthState();
      } finally {
        setLoading(false);
      }
    },

    [
      clearAuthState,
      refreshProfile,
    ]
  );

  /* =========================================
      INITIAL SESSION RESTORE
  ========================================= */

  useEffect(() => {

    let mounted = true;

    async function initialize() {

      if (!mounted) return;

      await refreshAuth();
    }

    initialize();

    return () => {
      mounted = false;
    };

  }, [refreshAuth]);

  /* =========================================
      AUTH LISTENER
  ========================================= */

  useEffect(() => {

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(

      async (_event, session) => {

        const activeUser =
          session?.user || null;

        console.log(
          "AUTH EVENT:",
          _event
        );

        if (_event === "SIGNED_OUT") {

          clearAuthState();

          return;
        }

        if (
          _event === "SIGNED_IN" ||
          _event === "TOKEN_REFRESHED" ||
          _event === "USER_UPDATED"
        ) {

          if (activeUser) {

            setUser(activeUser);

            await refreshProfile(
              activeUser
            );
          }

          return;
        }

      }

    );

    return () => {
      subscription.unsubscribe();
    };

  }, [

    clearAuthState,
    refreshProfile,

  ]);

  /* =========================================
     LOGOUT
  ========================================= */

  async function logout() {

    try {

      setLoading(true);

      clearAuthState();

      await supabase.auth.signOut({
        scope: "local",
      });

      localStorage.removeItem("active_doc_key");

      window.location.href = "/";

    } catch (error) {

      console.error(
        "LOGOUT ERROR:",
        error
      );
      
      setLoading(false);
    }
  }

  /* =========================================
      DERIVED AUTH VALUES
  ========================================= */
  const resolved =
    resolveEffectiveTier({

      subscriptionTier:
        profile?.subscription_tier ||
        "free",

      subscriptionStatus:
        profile?.subscription_status ||
        "inactive",

      gracePeriodUntil:
        profile?.grace_period_until ||
        null,

      currentPeriodEnd: null,

    });

  const tier =
    profile?.subscription_tier ||
    "free";

  const effectiveTier =
    resolved.effectiveTier;

  const effectiveStatus =
    resolved.effectiveStatus;

  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        profile,
        tier,
        effectiveTier,
        effectiveStatus,
        refreshAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>

  );
}

export function useAuth() {
  return useContext(AuthContext);
}
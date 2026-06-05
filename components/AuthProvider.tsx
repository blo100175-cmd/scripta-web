//SCRIPTA V1.240526 - FULL AUTH CENTRALIZATION REWRITE
//SCRIPTA V1.250526 - NAVBAR - DB SYNCHRONIZATION 
//scripta V1.050626.002 - AuthProvider diagnostics
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
//initialized: boolean;                                              //🔴🔴R-OPT-OUT 250526

  profile: any;
//usage: any;                                                        //🔴🔴R-OPT-OUT 250526

  tier: string;
  effectiveTier: string;
  effectiveStatus: string;

  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
//initialized: false,                                                //🔴🔴R-OPT-OUT 250526

  profile: null,
//usage: null,                                                       //🔴🔴R-OPT-OUT 250526

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

  const [user, setUser] = useState<any>(null);

  const [profile, setProfile] = useState<any>(null);
//const [usage, setUsage] = useState<any>(null);                     //🔴🔴R-OPT-OUT 250526

  const [tier, setTier] = useState("free");

  const [effectiveTier, setEffectiveTier] =
    useState("free");

  const [effectiveStatus, setEffectiveStatus] =
    useState("active");

  const [loading, setLoading] = useState(true);
//const [initialized, setInitialized] = useState(false);             //🔴🔴R-OPT-OUT 250526

  /* =========================================
     CENTRALIZED HYDRATION
  ========================================= */

  const clearAuthState = useCallback(() => {

    setUser(null);

    setProfile(null);
  //setUsage(null);                                                  //🔴🔴R-OPT-OUT 250526

    setTier("free");

    setEffectiveTier("free");
    setEffectiveStatus("active");

  }, []);

  const refreshProfile = useCallback(                                //|-----🟡🟡PATCHED 250526
    async (activeUser: any) => {

      if (!activeUser) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select(`
          subscription_tier,
          subscription_status,
          grace_period_until
        `)
        .eq("user_id", activeUser.id)
        .maybeSingle();

      setProfile(profileData || null);

      console.log("PROFILE DATA:", profileData);                     //|-----🟡🟡PATCHED 050626
      console.log(
        "PROFILE TIER:",
        profileData?.subscription_tier
      );
      console.log(
        "PROFILE STATUS:",
        profileData?.subscription_status
      );                                                             //-----|🟡🟡PATCHED 050626

      const resolved = resolveEffectiveTier({

        subscriptionTier:
          profileData?.subscription_tier || "free",

        subscriptionStatus:
          profileData?.subscription_status || "inactive",

        gracePeriodUntil:
          profileData?.grace_period_until || null,

        currentPeriodEnd: null,
      });

      console.log("RESOLVED:", resolved);                             //🟡🟡PATCHED 050626

      setTier(
        profileData?.subscription_tier || "free"
      );

      setEffectiveTier(
        resolved.effectiveTier
      );

      console.log("SETTING EFFECTIVE TIER:",resolved.effectiveTier);  //🟡🟡PATCHED 050626

      setEffectiveStatus(
        resolved.effectiveStatus
      );

    },
    []
  );                                                                 //-----|🟡🟡PATCHED 250526

  const refreshAuth = useCallback(async () => {

    try {

      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const activeUser =                                             //|-----🟡🟡PATCHED 250526     
        session?.user || null;

      if (!activeUser) {
        clearAuthState();
      } else {
        setUser(activeUser);
        await refreshProfile(activeUser);
      }                                                              //-----|🟡🟡PATCHED 250526

    } catch (error) {

      console.error(
        "AUTH REFRESH ERROR:",
        error
      );

      clearAuthState();

    } finally {

      setLoading(false);
    }

    }, [clearAuthState, refreshProfile]);                            //🟡🟡PATCHED 250526

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

  //if (!initialized) return;                                         //🔴🔴R-OPT-OUT 250526

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(

      async (_event, session) => {                                    //|-----🟡🟡PATCHED 250526

        const activeUser = session?.user || null;

        console.log(
          "AUTH STATE CHANGE:",
          _event,
          activeUser?.id || "SIGNED_OUT"
        );                      
                                                                  
        if (_event === "SIGNED_OUT") {                                 

          clearAuthState();
          return;
        }

        if (_event === "SIGNED_IN") {
          setUser(activeUser);
          await refreshProfile(activeUser);
          return;
        }                                                             
      }                                                               //-----|🟡🟡PATCHED 250526
    );

    return () => {
      subscription.unsubscribe();
    };

//}, [initialized, hydrateAuthenticatedUser]);                        //🔴🔴R-OPT-OUT 250526
  }, [clearAuthState, refreshProfile]);                               //🟡🟡PATCHED 250526

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

  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
      //initialized,                                                 //🔴🔴R-OPT-OUT 250526

        profile,
      //usage,                                                       //🔴🔴R-OPT-OUT 250526

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
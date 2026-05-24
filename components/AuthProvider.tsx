//SCRIPTA V1.150526 - GLOBAL AUTH PROVIDER | FULL-STATE CENTRALIZATION
//SCRIPTA V1.240526 - DEBUGGING - DUPLICATED AUTH OWNERSHIP
"use client";
import {createContext,useContext,useEffect,useState,} from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { resolveEffectiveTier } from "@/lib/resolveEffectiveTier";  //🟡🟡PATCHED 150526

type AuthContextType = {                                //|-----🟡🟡PATCHED 150526
  user: any;
  loading: boolean;

  profile: any;
  setProfile: React.Dispatch<React.SetStateAction<any>>;

  tier: string;
  setTier: React.Dispatch<React.SetStateAction<string>>;

  effectiveTier: string;                                //🟡🟡PATCHED 150526
  effectiveStatus: string;                              //🟡🟡PATCHED 150526

  usage: any;
  setUsage: React.Dispatch<React.SetStateAction<any>>;
};                                                      //-----|🟡🟡PATCHED 150526

const supabase = getSupabase();

/*const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});*/

const AuthContext = createContext<AuthContextType>({    //|-----🟡🟡PATCHED 150526
  user: null,
  loading: true,

  profile: null,
  setProfile: () => {},

  tier: "free",
  setTier: () => {},

  effectiveTier: "free",
  effectiveStatus: "active",

  usage: null,
  setUsage: () => {},
});                                                     //-----|🟡🟡PATCHED 150526

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<any>(null);    //|-----🟡🟡PATCHED 150526
  const [tier, setTier] = useState("free");

  const [effectiveTier, setEffectiveTier] =             //🟡🟡PATCHED 150526
  useState("free");

  const [effectiveStatus, setEffectiveStatus] =         //🟡🟡PATCHED 150526
  useState("active");

  const [usage, setUsage] = useState<any>(null);        //-----|🟡🟡PATCHED 150526

  useEffect(() => {

    let mounted = true;

    async function initialize() {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(user ?? null);            //|-----🟡🟡PATCHED 150526
      
      setLoading(false);                                    //🟡🟡PATCHED
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {

        if (!mounted) return;

        setUser(session?.user ?? null);

        const activeUser = session?.user ?? null;           //|-----🟡🟡PATCHED 150526

        if (!activeUser) {

          setProfile(null);
          setTier("free");
          setUsage(null);

          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select(`
            subscription_tier,
            subscription_status,
            grace_period_until
          `)
          .eq("user_id", activeUser.id)
          .maybeSingle();

        setProfile(profileData);

        if (profileData?.subscription_tier) {
          setTier(profileData.subscription_tier);
        }

        const resolved = resolveEffectiveTier({
          subscriptionTier:
            profileData?.subscription_tier,

          subscriptionStatus:
            profileData?.subscription_status,

          gracePeriodUntil:
            profileData?.grace_period_until,

          currentPeriodEnd: null,
        });

        setEffectiveTier(
          resolved.effectiveTier
        );

        setEffectiveStatus(
          resolved.effectiveStatus
        );                                              

        const monthKey = new Date()
          .toISOString()
          .slice(0, 7);

        const { data: usageData } = await supabase
          .from("user_usage")
          .select(`
            total_pages,
            page_limit,
            tier
          `)
          .eq("user_id", activeUser.id)
          .eq("month_key", monthKey)
          .maybeSingle();

        setUsage(usageData);                            //-----|🟡🟡PATCHED 1550526

      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };

  }, []);

  return (
    <AuthContext.Provider           //|-----🟡🟡PATCHED 150526
      value={{
        user,
        loading,

        profile,
        setProfile,

        tier,
        setTier,

        effectiveTier,
        effectiveStatus,

        usage,
        setUsage,
      }}                            //-----|🟡🟡PATCHED 150526
    >
        
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
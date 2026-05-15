//SCRIPTA V1.150526 - GLOBAL AUTH PROVIDER
"use client";

import {createContext,useContext,useEffect,useState,} from "react";
import { getSupabase } from "@/lib/supabaseClient";

type AuthContextType = {
  user: any;
  loading: boolean;
};

const supabase = getSupabase();

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    let mounted = true;

    async function initialize() {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

    /*setUser(user);
      setLoading(false);*/

      setUser(user ?? null);            //|-----🟡🟡PATCHED 150526 - GLOBAL AUTH PROVIDER

      setTimeout(() => {
        setLoading(false);
      }, 150);                          //|-----🟡🟡PATCHED 150526
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {

        if (!mounted) return;

        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };

  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
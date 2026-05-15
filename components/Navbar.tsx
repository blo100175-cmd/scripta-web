//SCRIPTA V1.1.150526 - DB-UI SYNCHRONIZATION | GLOBAL AUTH PROVIDER
"use client";
import Link from "next/link";
/*import { useEffect, useState } from "react";*/
import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabaseClient";         //🟡🟡PATCHED 9/4/26
import { useAuth } from "@/components/AuthProvider";        //🟡🟡PATCHED 150526 - GLOBAL AUTH PROVIDER
/*import { createClient } from "@supabase/supabase-js";*/
import { useRouter } from "next/navigation";
import { resolveEffectiveTier } from "@/lib/resolveEffectiveTier";

export default function Navbar() {

  const supabase = getSupabase();                   //🟡🟡PATCHED 10/4/26
  const {user: authUser,loading,} = useAuth();      //🟡🟡PATCHED 150526 -  GLOBAL AUTH PROVIDER
  const router = useRouter();                       //🟡🟡 PATCHED 15/3/26

  const [user,setUser] = useState<any>(null);
  const [tier,setTier] = useState<string>("free");
  const [health,setHealth] = useState<string>("🟢");

/*useEffect(()=>{
    async function loadUser(){*/

  const loadUser = useCallback(async () => {        //🟡🟡PATCHED 150526 - DB-UI SYNCHRONIZATION

    /*const {data:{user}} = await supabase.auth.getUser();*/

      const user = authUser;                        //🟡🟡PATCHED 150526 - GLOBAL AUTH PROVIDER
      
      if (loading) return;                          //🟡🟡PATCHED 150526 - GLOBAL AUTH PROVIDER

      if(!user) return;

      setUser(user);

      const { data: profile } = await supabase      //|-----🟡🟡 PATCHED 120526
        .from("profiles")
        .select(`
          subscription_tier,
          subscription_status,
          grace_period_until
        `)
        .eq("user_id", user.id)
        .maybeSingle();                             //-----|🟡🟡 PATCHED 120526
      
      if (profile) {                                //|-----🟡🟡 PATCHED 120526

        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("current_period_end")
          .eq("user_id", user.id)
          .maybeSingle();

        const resolved = resolveEffectiveTier({
          subscriptionTier: profile.subscription_tier,
          subscriptionStatus: profile.subscription_status,
          currentPeriodEnd:
            subscription?.current_period_end || null,
          gracePeriodUntil:
            profile.grace_period_until || null,
        });

        setTier(resolved.effectiveTier);

        if (resolved.effectiveStatus === "expired") {
          setHealth("🔴");
        }
      }                                             //-----|🟡🟡 PATCHED 120526
      
      const monthKey = new Date().toISOString().slice(0,7);

      const {data:usage} = await supabase
        .from("user_usage")
        .select("total_pages,page_limit")
        .eq("user_id",user.id)
        .eq("month_key",monthKey)
        .maybeSingle();

      if (usage && usage.page_limit) {

        const ratio = usage.total_pages / usage.page_limit;

        if(ratio >= 1){
          setHealth("🔴");
        }
        else if(ratio >= 0.8){
          setHealth("🟡");
        }
        else{
          setHealth("🟢");
        }
      }

  }, [supabase, authUser, loading]);       //|-----🟡🟡PATCHED 150526 - DB-UI SYNCHRONIZATION

  useEffect(() => {
    loadUser();
  }, [loadUser]);                   //-----|🟡🟡PATCHED 150526

  /*-------------- LOGOUT FUNCTION ---------------*/
  async function logout() {                   //|-----🟡🟡 PATCHED 9/4/26
    await supabase.auth.signOut();
    window.location.href = "/";
  }                               //-----|🟡🟡 PATCHED 9/4/26                              

  return(

/* =========================
     PAGE UI (JSX)
========================= */    
    <nav className="navbar">

      {/* LEFT */}

      <div className="nav-left">
        <Link href="/" className="logo">
          <img src="/logo.png" alt="Scripta Logo" />
        </Link>
      </div>


      {/* RIGHT */}

      <div className="nav-right">

        {user ? (

          <>
            <span className="account-indicator">
              {health} {user.email} . {tier}
            </span>

            <a href="/affiliate">affiliate</a>
            <Link href="/app">app</Link>
            <a href="/#features">features</a>
            <a href="/#why-us">why scripta</a>
            <Link href="/pricing">pricing</Link>
            <a href="/#contact">contact</a>

            <button onClick={logout}>logout</button>
          </>

        ) : (

          <>
            <Link href="/login">login</Link>
            <a href="/affiliate">affiliate</a>
            <Link href="/app">app</Link>
            <a href="/#features">features</a>
            <a href="/#why-us">why scripta</a>
            <Link href="/pricing">pricing</Link>
            <a href="/#contact">contact</a>
          </>

        )}

      </div>

    </nav>

  );

}
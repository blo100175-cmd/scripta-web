//SCRIPTA - V1.030726.01-R
//SCRIPTA - V1.080726.019 - Navbar: bonus counter + Hero: affiliate CTA button

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
//import { createClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabaseClient";                          //🟡🟡 PATCHED - 030726                    
import { useRouter } from "next/navigation";

/*const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);*/
const supabase = getSupabase();                                              //🟡🟡 PATCHED - 030726         

export default function Navbar() {

  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState<string>("free");
  const [health, setHealth] = useState<string>("🟢");
  const [bonusPages, setBonusPages] = useState<number>(0);

  useEffect(() => {

    async function loadUser() {
      
    //const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();        //🟡🟡 PATCHED - 030726
      const user = session?.user ?? null;

      if (!user) return;

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_status")
        .eq("user_id", user.id)
        .maybeSingle();

      // === DIAGNOSTICS ==========================
      console.log("USER ID:", user.id);
      console.log("PROFILE:", JSON.stringify(profile));
      
      if (profile) {
        setTier(profile.subscription_tier);
      }

      const monthKey = new Date().toISOString().slice(0, 7);

      const { data: usage } = await supabase
        .from("user_usage")
        .select("total_pages, page_limit")
        .eq("user_id", user.id)
        .eq("month_key", monthKey)
        .maybeSingle();

      if (profile?.subscription_status === "expired") {
        setHealth("🔴");
      } else if (usage && usage.page_limit) {
        const pagesLeft = usage.page_limit - (usage.total_pages || 0);
        const ratio = pagesLeft / usage.page_limit;
        if (ratio <= 0.05) setHealth("🔴");
        else if (ratio <= 0.20) setHealth("🟡");
        else setHealth("🟢");
      }

      // BONUS PAGES CALCULATION                                             //🟡🟡PATCHED 080726
      if (usage && usage.page_limit) {
        const baseLimits: Record<string, number> = {
          free:    30,
          lite:    100,
          student: 200,
          pro:     500,
          anon:    30,
        };
        const baseLimit = baseLimits[profile?.subscription_tier || "free"];
        const bonus = (usage.page_limit || 0) - baseLimit;
        if (bonus > 0) setBonusPages(bonus);
      }
    }
    
    loadUser();

  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav className="navbar">

      <div className="nav-left">
        <Link href="/" className="logo">
          <img src="/logo.png" alt="Scripta Logo" />
        </Link>
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <span className="account-indicator">
              {health} {user.email} . {tier}
              {bonusPages > 0 && (
                <span className="bonus-counter">
                  🎁 Bonus: {bonusPages} pages
                </span>
              )}
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
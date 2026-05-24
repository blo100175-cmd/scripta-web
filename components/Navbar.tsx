//SCRIPTA V1.1.150526 - DB-UI SYNCHRONIZATION | GLOBAL AUTH PROVIDER
//SCRIPTA V1.1.160526 - CLEANUP - resolveEffectiveTier
//SCRIPTA V1.1.240526 - DEBUGGING - DUPLICATED AUTH OWNERSHIP
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";         //🟡🟡PATCHED 9/4/26
import { useAuth } from "@/components/AuthProvider";        //🟡🟡PATCHED 150526
import { useRouter } from "next/navigation";


export default function Navbar() {

  const supabase = getSupabase();                           //🟡🟡PATCHED 10/4/26

  const {user: authUser,loading,usage,effectiveTier,} = useAuth();    //🟡🟡PATCHED 240526

  const router = useRouter();                               //🟡🟡PATCHED 15/3/26

  const [health,setHealth] = useState<string>("🟢");

  useEffect(() => {

    if (!usage || !usage.page_limit) {
      setHealth("🟢");
      return;
    }

    const ratio =
      usage.total_pages / usage.page_limit;

    if (ratio >= 1) {
      setHealth("🔴");
    }
    else if (ratio >= 0.8) {
      setHealth("🟡");
    }
    else {
      setHealth("🟢");
    }

  }, [usage]);

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

        {authUser ? (

          <>
            <span className="account-indicator">
              {health} {authUser.email} . {effectiveTier}
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
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSupabase } from "@/lib/supabaseClient";         //🟡🟡PATCHED 9/4/26
/*import { createClient } from "@supabase/supabase-js";*/

import { useRouter } from "next/navigation";


/* ================= SUPABASE CLIENT ================= */
const supabase = getSupabase();             //🟡🟡PATCHED 9/4/26

/*const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);*/

export default function Navbar() {

  const router = useRouter();    //🟡🟡 PATCHED 15/3/26

  const [user,setUser] = useState<any>(null);
  const [tier,setTier] = useState<string>("free");
  const [health,setHealth] = useState<string>("🟢");

  useEffect(()=>{

    async function loadUser(){

      const {data:{user}} = await supabase.auth.getUser();

      if(!user) return;

      setUser(user);

      const {data:profile} = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_status")
        .eq("user_id",user.id)
        .maybeSingle();

      if(profile){
        setTier(profile.subscription_tier);
      }

      const monthKey = new Date().toISOString().slice(0,7);

      const {data:usage} = await supabase
        .from("user_usage")
        .select("total_pages,page_limit")
        .eq("user_id",user.id)
        .eq("month_key",monthKey)
        .maybeSingle();

      if(profile?.subscription_status === "expired"){
        setHealth("🔴");
      }
      else if(usage && usage.page_limit){

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
    }

    loadUser();

  },[]);

  /*-------------- LOGOUT FUNCTION ---------------*/
  async function logout() {                   //|-----🟡🟡 PATCHED 9/4/26
    await supabase.auth.signOut();
    window.location.href = "/";
  }                               //-----|🟡🟡 PATCHED 9/4/26

/*async function logout(){
    await supabase.auth.signOut();
    location.reload();
  }*/
  
/*async function logout(){         
    await supabase.auth.signOut();
    router.push("/");
  }*/                               

  return(

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
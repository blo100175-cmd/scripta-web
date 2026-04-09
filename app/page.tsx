//SCRIPTA V1.1.070426 - AFFILIATE BUILD-IN 
"use client";

import { useEffect } from "react";  // 🟡🟡 PATCHED 7/4/26 - AFFILIATE BUILD-IN FUNCTION
import { getSupabase } from "@/lib/supabaseClient";      //🟡🟡PATCHED 8/4/26

import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WhyScripta from "@/components/WhyScripta";
import ContactSection from "@/components/ContactSection";
import TaglineStrip from "@/components/TaglineStrip";
import HomeButton from "@/components/HomeButton"

export default function Home() {

  const supabase = getSupabase();          //🟡🟡PATCHED 10/4/26

  useEffect(() => {
    // 🛑 Ensure runs only in browser
    if (typeof window === "undefined") return;

    console.log("URL DEBUG:", window.location.href);

    // ========== AFFILIATE REF CAPTURE ==========
    const params = new URLSearchParams(window.location.search);     //|----- 🟡🟡 PATCHED 7/4/26 - AFFILIATE
    const ref = params.get("ref");

    if (ref && !localStorage.getItem("ref_code")) {
      console.log("✅ REF DETECTED:", ref);
      localStorage.setItem("ref_code", ref);
    }                                           //-----| 🟡🟡 7/4/26

    // ========== SESSION RECOVERY (STRIPE REDIRECT FIX) ==========  
  /*supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        console.log("✅ Session restored after redirect");

        // 🔥 FORCE UI SYNC (THIS IS THE MISSING PIECE)
        supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

      } else {
        console.log("⚠️ No session found");
      }
    });*/                                   

    // ========== AUTH STATE SYNC (CRITICAL FIX) ==========    //|----- 🟡🟡 PATCHED 8/4/26 - AUTH STATE SYNC
  /*supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 AUTH EVENT:", event);

      if (session) {
        console.log("✅ Session active");

        // Force UI awareness -------------------------------
        supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

      } else {
        console.log("⚠️ No session");
      }
    });*/

    // ========== SESSION RECOVERY (SAFE) ==========   //|----- 🟡🟡 PATCHED 8/4/26 - AUTH STATE SYNC
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        console.log("✅ Session exists");
      } else {
        console.log("⚠️ No session");
      }
    });                                          //-----| 🟡🟡 PATCHED 8/4/26

    // ALSO trigger initial check ----------------------------
  /*supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        console.log("✅ Initial session found");

        supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
    });*/                     

    // ========== SUPABASE EMAIL LOGIN HANDLER ==========
    const hash = window.location.hash;                      //|----- 🟡🟡 PATCHED 7/4/26 - LOGIN HANDLER

    if (hash && hash.includes("access_token")) {
      
    /*const params = new URLSearchParams(hash.replace("#", ""));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");*/

      const hashParams = new URLSearchParams(hash.replace("#", ""));     //|-----🟡🟡PATCHED 8/4/26
      
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");     //-----|🟡🟡PATCHED 8/4/26

      if (access_token && refresh_token) {
        console.log("🔐 AUTH TOKENS DETECTED");

        supabase.auth
          .setSession({
            access_token,
            refresh_token,
          })
          .then(({ error }: { error: any }) => {
            if (error) {
              console.error("❌ Session set failed:", error);
            } else {
              console.log("✅ User auto-logged in");

              window.history.replaceState({}, document.title, "/app");    //🟡🟡PATCHED 8/4/26
            }
          });
      }
    }

  }, []);                              //-----| 🟡🟡 7/4/26
  
  // ========== AFFILIATE REF CAPTURE ==========   
/*useEffect(() => {
    console.log("URL DEBUG:", window.location.href);

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref && !localStorage.getItem("ref_code")) {
      console.log("✅ REF DETECTED:", ref);
      localStorage.setItem("ref_code", ref);
    }
  }, []);                       

  // ========== SUPABASE EMAIL LOGIN HANDLER ==========    
  const hash = window.location.hash;

  if (hash && hash.includes("access_token")) {
    const params = new URLSearchParams(hash.replace("#", ""));

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      console.log("🔐 AUTH TOKENS DETECTED");

      supabase.auth
        .setSession({
          access_token,
          refresh_token,
        })
        .then(({ error }: { error: any }) => {
          if (error) {
            console.error("❌ Session set failed:", error);
          } else {
            console.log("✅ User auto-logged in");

            // Clean URL
            window.history.replaceState({}, document.title, "/");
          }
        });
    }
  }*/                              

  // ============= MAINPAGE LAYOUT ==============
  return (
    <div id="top">
    
      {/* HERO SECTION */}
      <Hero />

      {/* FEATURES */}
      <Features />

      {/* WHY SCRIPTA */}
      <WhyScripta />

      {/* CONTACT */}
      <ContactSection />

      <TaglineStrip />

      <HomeButton />

    </div>
  );
}
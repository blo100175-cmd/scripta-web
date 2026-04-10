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

  const supabase = getSupabase();         //🟡🟡PATCHED 10/4/26

  useEffect(() => {

    const init = async () => {

      if (typeof window === "undefined") return;

      console.log("URL DEBUG:", window.location.href);

      /* ================= AFFILIATE REF ================= */
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");

      if (ref && !localStorage.getItem("ref_code")) {
        console.log("✅ REF DETECTED:", ref);
        localStorage.setItem("ref_code", ref);
      }

      /* ================= AUTH HANDLER ================= */
      const hash = window.location.hash;

      if (hash && hash.includes("access_token")) {

        const hashParams = new URLSearchParams(hash.replace("#", ""));
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");

        if (access_token && refresh_token) {

          // 🔥 CRITICAL: check BEFORE setting session
          const { data } = await supabase.auth.getSession();

          if (!data.session) {
            console.log("🔐 AUTH TOKENS DETECTED");

            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              console.error("❌ Session set failed:", error);
            } else {
              console.log("✅ User auto-logged in");

              // clean URL + move to app
              window.history.replaceState({}, document.title, "/app");
            }
          } else {
            console.log("⚠️ Session already exists — skip setSession");
          }
        }
      }

      /* ================= SAFE SESSION CHECK ================= */
      setTimeout(async () => {
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          console.log("✅ Session exists");
        } else {
          console.log("⚠️ No session");
        }
      }, 500);

    };

    init();

  }, []);
  
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
//SCRIPTA V1.1.070426 - AFFILIATE BUILD-IN 
"use client";

import { useEffect } from "react";  // 🟡🟡 PATCHED 7/4/26 - AFFILIATE BUILD-IN FUNCTION
import { createClient } from "@supabase/supabase-js";  // 🟡🟡 PATCHED 7/4/26 - LOGIN HANDLER

import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WhyScripta from "@/components/WhyScripta";
import ContactSection from "@/components/ContactSection";
import TaglineStrip from "@/components/TaglineStrip";
/*import ScrollHomeButton from "@/components/ScrollHomeButton";*/
import HomeButton from "@/components/HomeButton"

export default function Home() {

/* ------------------ SUPABASE CLIENT ------------------ */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

  // ========== AFFILIATE REF CAPTURE ==========   //|----- 🟡🟡 PATCHED 7/4/26 - AFFILIATE
  useEffect(() => {
    console.log("URL DEBUG:", window.location.href);

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref && !localStorage.getItem("ref_code")) {
      console.log("✅ REF DETECTED:", ref);
      localStorage.setItem("ref_code", ref);
    }
  }, []);                       //-----| 🟡🟡 7/4/26

  // ========== SUPABASE EMAIL LOGIN HANDLER ==========    //|----- 🟡🟡 PATCHED 7/4/26 - LOGIN HANDLER
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
  }                              //-----| 🟡🟡 7/4/26

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
//SCRIPTA - V1.1.070426 - AFFILIATE BUILD-IN 
//SCRIPTA - V1.040726.002 - Affiliate: referral submission on registration
//SCRIPTA - V1.070726.014 - Affiliate: referral banner on homepage

"use client";

import { useEffect, useState } from "react";                            // 🟡🟡 PATCHED 7/4/26 - AFFILIATE BUILD-IN FUNCTION
import { getSupabase } from "@/lib/supabaseClient";                     //🟡🟡PATCHED 8/4/26

import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WhyScripta from "@/components/WhyScripta";
import ContactSection from "@/components/ContactSection";
import TaglineStrip from "@/components/TaglineStrip";
import HomeButton from "@/components/HomeButton"

export default function Home() {

  const supabase = getSupabase();                                       //🟡🟡PATCHED 10/4/26
  const [showRefBanner, setShowRefBanner] = useState(false);            //🟡🟡PATCHED 070726

  useEffect(() => {

    const init = async () => {

      if (typeof window === "undefined") return;

      console.log("URL DEBUG:", window.location.href);

      /* ================= AFFILIATE REF ================= */
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");

    /*if (ref && !localStorage.getItem("ref_code")) {
        console.log("✅ REF DETECTED:", ref);
        localStorage.setItem("ref_code", ref);
      }*/
      
      if (ref && !localStorage.getItem("ref_code")) {
        console.log("✅ REF DETECTED:", ref);
        localStorage.setItem("ref_code", ref);
        setShowRefBanner(true);                                         //🟡🟡PATCHED 070726
      }

      // Show banner if ref_code already in localStorage                //🟡🟡PATCHED 070726
      if (localStorage.getItem("ref_code")) {
        setShowRefBanner(true);
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
            } else {                                                    //|-----🟡🟡PATCHED 040726
              console.log("✅ User auto-logged in");

              // ===== AFFILIATE REFERRAL SUBMISSION =====
              const refCode = localStorage.getItem("ref_code");
              const { data: sessionData } = await supabase.auth.getSession();
              const userId = sessionData?.session?.user?.id;

              if (refCode && userId) {
                try {
                  await fetch("/api/affiliate/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      referral_code: refCode,
                      user_id: userId,
                    }),
                  });
                  localStorage.removeItem("ref_code");
                  console.log("✅ REFERRAL SUBMITTED");
                } catch (err) {
                  console.error("❌ REFERRAL SUBMISSION FAILED:", err);
                }
              }
              // ===== END AFFILIATE REFERRAL SUBMISSION =====

              // clean URL + move to app
              window.history.replaceState({}, document.title, "/app");
            }                                                           //-----|🟡🟡PATCHED 040726

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

  // ============= MAINPAGE LAYOUT ==============
  return (
    <div id="top">

      {/* REFERRAL BANNER */}
      {showRefBanner && (
        <div className="ref-banner">
          <span>🎁 You've been invited to Scripta!</span>
          <span>Subscribe to any paid plan and get <strong>bonus pages FREE</strong> — this month only.</span>
          <a href="/pricing" className="ref-banner-btn">See Plans</a>
          <button
            onClick={() => {
              localStorage.removeItem("ref_code");
              setShowRefBanner(false);
            }}
            className="ref-banner-close"
          >
            ✕
          </button>
        </div>
      )}

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
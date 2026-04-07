//SCRIPTA V1.1.070426 - AFFILIATE BUILD-IN 
"use client";

import { useEffect } from "react";  // 🟡🟡 PATCHED 7/4/26 - AFFILIATE BUILD-IN FUNCTION

import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WhyScripta from "@/components/WhyScripta";
import ContactSection from "@/components/ContactSection";
import TaglineStrip from "@/components/TaglineStrip";
/*import ScrollHomeButton from "@/components/ScrollHomeButton";*/
import HomeButton from "@/components/HomeButton"

export default function Home() {

  // ========== AFFILIATE REF CAPTURE ==========
  useEffect(() => {
    console.log("URL DEBUG:", window.location.href);

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref && !localStorage.getItem("ref_code")) {
      console.log("✅ REF DETECTED:", ref);
      localStorage.setItem("ref_code", ref);
    }
  }, []);

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
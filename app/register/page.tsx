//SCRIPTA V1.1.170526 - FULL-STATE CENTRALIZATION - CLEANUP + CONSISTENCY ENFORCEMENT
"use client";

import { useState } from "react";

import { getSupabase } from "@/lib/supabaseClient";           //🟡🟡PATCHED 9/4/26  
/*import { createClient } from "@supabase/supabase-js";*/

import Link from "next/link";
import TaglineStrip from "@/components/TaglineStrip";

/*const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);*/

export default function RegisterPage() {

  const supabase = getSupabase();           //🟡🟡PATCHED 10/4/26  

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);      //🟡🟡PATCHED 170526

  async function handleRegister() {
    if (submitting) return;                                 //🟡🟡PATCHED 170526
    setSubmitting(true);                                    //🟡🟡PATCHED 170526

    if (!email) {
      setStatus("Please enter your email.");
      setSubmitting(false);                                 //🟡🟡PATCHED 170526
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      /*emailRedirectTo: window.location.origin + "/app",*/
        emailRedirectTo: `${window.location.origin}/app`,   //🟡🟡 PATCHED     
      },
    });

    if (error) {
      setStatus(`❌ ${error.message}`);
    } else {
      setStatus("📧 Registration link sent. Please check your email.");
      setEmail("");
    }
    setSubmitting(false);                                   //🟡🟡PATCHED 170526

  }

  return (

    <>
    
      <main className="auth-page">

        <div className="auth-container">

          <h1 className="auth-title">
            Create Account
          </h1>

          <p className="auth-subtitle">
            Register to unlock higher document processing limits.
          </p>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="auth-input"
          />

          <button
            onClick={handleRegister}
            className="auth-button"
            disabled={submitting}                           //🟡🟡PATCHED 170526
          >
            {submitting                                     //🟡🟡PATCHED 170526
              ? "Creating..."
              : "Create Account"}
          </button>

          {status && (
            <p className="auth-status">
              {status}
            </p>
          )}

          <p className="auth-switch">
            Already have an account? <Link href="/login">Login</Link>
          </p>

        </div>

      </main>

      <TaglineStrip />

    </>
  );
}
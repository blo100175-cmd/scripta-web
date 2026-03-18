"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import TaglineStrip from "@/components/TaglineStrip";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function handleRegister() {

    if (!email) {
      setStatus("Please enter your email.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      /*emailRedirectTo: window.location.origin + "/app",*/
        emailRedirectTo: `${window.location.origin}/app`,      //🟡🟡 PATCHED     
      },
    });

    if (error) {
      setStatus(`❌ ${error.message}`);
    } else {
      setStatus("📧 Registration link sent. Please check your email.");
      setEmail("");
    }

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
          >
            Create Account
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
"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";           //🟡🟡PATCHED 9/4/26
/*import { createClient } from "@supabase/supabase-js";*/
import Link from "next/link";
import TaglineStrip from "@/components/TaglineStrip";

/* ------------------ SUPABASE CLIENT ------------------ */
const supabase = getSupabase();           //🟡🟡PATCHED 9/4/26 
/*const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);*/

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function handleLogin() {

    if (!email) {
      setStatus("Please enter your email.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin + "/app",
      },
    });

    if (error) {
      setStatus(`❌ ${error.message}`);
    } else {
      setStatus("🔐 Login link sent. Please check your email.");
      setEmail("");
    }

  }

  return (
    <>
      <main className="auth-page">
        <div className="auth-container">
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">
            Enter your email to receive a secure login link.
          </p>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="auth-input"
          />
          <button
            onClick={handleLogin}
            className="auth-button"
          >
            Send Login Link
          </button>
          {status && (
            <p className="auth-status">
              {status}
            </p>
          )}
          <p className="auth-switch">
            New user? <Link href="/register">Create an account</Link>
          </p>
        </div>

      </main>

      <TaglineStrip />
    </>
  );
}
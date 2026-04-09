"use client";

import { useState } from "react";
/*import { createClient } from "@supabase/supabase-js";*/
import { getSupabase } from "@/lib/supabaseClient"          //🟡🟡PATCHED 9/4/26

/* ================= SUPABASE CLIENT ================= */
const supabase = getSupabase();             //🟡🟡PATCHED 9/4/26

/*const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);*/

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleLogin = async () => {
    if (!email) return;

    setStatus("Sending magic link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
      /*emailRedirectTo: window.location.origin,*/
        emailRedirectTo: `${window.location.origin}/app`,       //🟡🟡PATCHED 9/4/26
      },
    });

    if (error) {
      setStatus("Login failed.");
    } else {
      setStatus("Check your email to continue.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button onClick={handleLogin}>Send Magic Link</button>
        <p>{status}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
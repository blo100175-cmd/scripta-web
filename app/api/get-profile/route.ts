import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/* =========================
   POST — Hybrid CSR Profile Fetch
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",   //|----- 🟡🟡 PATCHED 18/3/26
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""    //-----|🟡🟡 18/3/26
    ); 

    /* =========================
       1️⃣ Fetch profile
    ========================= */
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    /* =========================
       2️⃣ Fetch subscription
    ========================= */
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("current_period_end, cancel_at_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    return NextResponse.json({
      ...profile,
      current_period_end: subscription?.current_period_end ?? null,
      cancel_at_period_end:
        subscription?.cancel_at_period_end ?? false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
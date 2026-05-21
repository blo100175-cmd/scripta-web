//SCRIPTA V1.1.170526 - FULL-STATE CENTRALIZATION - CLEANUP + MILD HARDENING
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {                    //|-----🟡🟡PATCHED 20/3/26
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
/*const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;*/
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;    //🟡🟡 PATCHED 120526

  if (!url || !key) {
    throw new Error("Missing Supabase ENV");
  }

  return createClient(url, key);
}                         //-----|🟡🟡20/3/26


/* =========================
   POST — Hybrid CSR Profile Fetch
========================= */
export async function POST(req: Request) {

  const supabase = getSupabase(); // ✅ ONLY HERE    //🟡🟡 PATCHED 20/3/26

  try {
    const body = await req.json();
    const userId = body?.userId;

    if (typeof userId !== "string") {               //|-----🟡🟡PATCHED 170526
      return NextResponse.json(
        { error: "Invalid userId format" },
        { status: 400 }
      );
    }

    if (!userId.trim()) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    if (userId.length > 100) {
      return NextResponse.json(
        { error: "userId too long" },
        { status: 400 }
      );
    }                                               //-----|🟡🟡PATCHED 170526

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    /* =========================
       1️⃣ Fetch profile
    ========================= */
    const { data: profile, error: profileError } = await supabase
      .from("profiles")                             //|-----🟡🟡PATCHED 170526
      .select(`                                     
        user_id,
        subscription_tier,
        subscription_status,
        grace_period_until
      `)                                            //-----|🟡🟡PATCHED 170526
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
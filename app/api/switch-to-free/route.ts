//SCRIPTA V1.1.140526 - HARDENING
//SCRIPTA V1.1.180526 - VALIDATION CONSISTENCY
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {                //|-----🟡🟡PATCHED 20/3/26
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase ENV");
  }

  return createClient(url, key);
}                                       //-----|🟡🟡 20/3/26

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function POST(req: Request) {
  
  const supabase = getSupabase(); // ✅ ONLY HERE  🟡🟡PATCHED 20/3/26

  try {

    const body = await req.json();
    const userId = body.userId;

    if (typeof userId !== "string") {             //|-----🟡🟡PATCHED 180526
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
        { error: "Invalid userId length" },
        { status: 400 }
      );
    }                                             //-----|🟡🟡PATCHED 180526

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase      //|-----🟡PATCHED 140526 - HARDENING
      .from("profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 403 }
      );
    }                             //-----|🟡🟡PATCHED 140526

    const now = new Date().toISOString();

    /* ===============================
       1️⃣ Update profiles → FREE
    =============================== */

    await supabase
      .from("profiles")
      .update({
        subscription_tier: "free",
        subscription_status: "active",
        updated_at: now
      })
      .eq("user_id", userId);

    /* ===============================
       2️⃣ Update subscriptions table
    =============================== */

    await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        plan: "free",
        status: "active",
        cancel_at_period_end: false,
        updated_at: now
      }, {
        onConflict: "user_id"
      });

    /* ===============================
       3️⃣ Reset usage quota
    =============================== */

    await supabase
      .from("user_usage")
      .upsert({
        user_id: userId,
        month_key: getCurrentMonthKey(),
        tier: "free",
        page_limit: 30,
        updated_at: now
      }, {
        onConflict: "user_id,month_key"
      });

    return NextResponse.json({
      success: true
    });

  } catch (error: any) {

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
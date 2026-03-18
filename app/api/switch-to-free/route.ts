import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",        //🟡🟡 PATCHED 18/3/26
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""     //🟡🟡 PATCHED 18/3/26
);

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function POST(req: Request) {

  try {

    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

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
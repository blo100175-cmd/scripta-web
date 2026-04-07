import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/* =========================
   SUPABASE CLIENT (SERVER)
========================= */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // keep as-is (your current architecture)
);

/* =========================
   POST — REGISTER REFERRAL
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const referral_code = body?.referral_code;
    const user_id = body?.user_id;

    console.log("📥 INPUT:", { referral_code, user_id });

    /* ---------------- VALIDATION ---------------- */
    if (!referral_code || !user_id) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    /* ---------------- FIND AFFILIATE ---------------- */
    const { data: affiliate, error: affiliateError } = await supabase
      .from("affiliates")
      .select("user_id")
      .eq("referral_code", referral_code)
      .maybeSingle();

    console.log("🔍 AFFILIATE RESULT:", affiliate, affiliateError);

    if (affiliateError) {
      return NextResponse.json(
        { error: affiliateError.message },
        { status: 500 }
      );
    }

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    /* ---------------- SELF REFERRAL BLOCK ---------------- */
    if (affiliate.user_id === user_id) {
      return NextResponse.json(
        { error: "Self referral not allowed" },
        { status: 400 }
      );
    }

    /* ---------------- INSERT REFERRAL ---------------- */
    const { data: insertData, error: insertError } = await supabase
      .from("referrals")
      .insert({
        referrer_user_id: affiliate.user_id,
        referred_user_id: user_id,
      })
      .select();

    console.log("📦 INSERT RESULT:", insertData, insertError);

    /* ---------------- HANDLE INSERT ERROR ---------------- */
    if (insertError) {
      // Handle duplicate (UNIQUE constraint) gracefully
      if (insertError.code === "23505") {
        console.log("⚠️ Duplicate referral ignored");
        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    /* ---------------- SUCCESS ---------------- */
    console.log("✅ REFERRAL INSERTED SUCCESSFULLY");

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ UNEXPECTED ERROR:", err);

    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
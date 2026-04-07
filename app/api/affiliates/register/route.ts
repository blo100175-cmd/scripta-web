import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { referral_code, user_id } = await req.json();

    if (!referral_code || !user_id) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 🔹 Find affiliate
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("user_id")
      .eq("referral_code", referral_code)
      .single();

    if (!affiliate) {
      return NextResponse.json({ success: false });
    }

    // 🔹 Prevent self-referral
    if (affiliate.user_id === user_id) {
      return NextResponse.json({ success: false });
    }

    // 🔹 Insert referral (idempotent via UNIQUE constraint)
    await supabase.from("referrals").insert({
      referrer_user_id: affiliate.user_id,
      referred_user_id: user_id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    // ignore duplicate errors safely
    return NextResponse.json({ success: true });
  }
}
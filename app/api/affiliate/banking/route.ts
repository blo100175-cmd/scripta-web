//SCRIPTA V1.040726.004 - Affiliate: banking details API route

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* =========================
   GET — Fetch banking details
========================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user_id" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("affiliate_banking")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

/* =========================
   POST — Save/update banking details
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, full_name, bank_name, account_number, country, currency } = body;

    /* ---------- VALIDATION ---------- */
    if (!user_id || !full_name || !bank_name || !account_number || !country || !currency) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    if (
      typeof user_id !== "string" ||
      typeof full_name !== "string" ||
      typeof bank_name !== "string" ||
      typeof account_number !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    if (account_number.length > 30 || full_name.length > 100 || bank_name.length > 100) {
      return NextResponse.json(
        { error: "Input too long" },
        { status: 400 }
      );
    }

    /* ---------- VERIFY USER EXISTS ---------- */
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 403 }
      );
    }

    /* ---------- UPSERT BANKING DETAILS ---------- */
    const { error } = await supabase
      .from("affiliate_banking")
      .upsert({
        user_id,
        full_name:      full_name.trim(),
        bank_name:      bank_name.trim(),
        account_number: account_number.trim(),
        country:        country.trim(),
        currency:       currency.trim(),
        updated_at:     new Date().toISOString(),
      }, {
        onConflict: "user_id"
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
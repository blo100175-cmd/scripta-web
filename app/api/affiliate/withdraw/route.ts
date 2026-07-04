//SCRIPTA V1.040726.005 - Affiliate: withdrawal request API route

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MINIMUM_WITHDRAWAL = 10.00;
const MINIMUM_BALANCE    = 10.00;

export async function POST(req: Request) {
  try {

    const body = await req.json();
    const { user_id, amount } = body;

    /* ---------- VALIDATION ---------- */
    if (!user_id || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount < MINIMUM_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal is $${MINIMUM_WITHDRAWAL}` },
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

    /* ---------- VERIFY BANKING DETAILS EXIST ---------- */
    const { data: banking } = await supabase
      .from("affiliate_banking")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!banking) {
      return NextResponse.json(
        { error: "Banking details not set. Please add your bank details first." },
        { status: 400 }
      );
    }

    /* ---------- FETCH AFFILIATE BALANCE ---------- */
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("available_balance, pending_balance")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate account not found" },
        { status: 404 }
      );
    }

    /* ---------- BALANCE CHECKS ---------- */
    if (affiliate.available_balance < MINIMUM_BALANCE) {
      return NextResponse.json(
        { error: `Minimum balance of $${MINIMUM_BALANCE} required to withdraw` },
        { status: 400 }
      );
    }

    if (amount > affiliate.available_balance) {
      return NextResponse.json(
        { error: "Withdrawal amount exceeds available balance" },
        { status: 400 }
      );
    }

    /* ---------- CHECK NO PENDING WITHDRAWAL ---------- */
    const { data: pendingWithdrawal } = await supabase
      .from("withdrawals")
      .select("id")
      .eq("user_id", user_id)
      .eq("status", "pending")
      .maybeSingle();

    if (pendingWithdrawal) {
      return NextResponse.json(
        { error: "You have a pending withdrawal request. Please wait for it to be processed." },
        { status: 400 }
      );
    }

    /* ---------- CREATE WITHDRAWAL REQUEST ---------- */
    const requestedAt  = new Date();
    const processAfter = new Date(requestedAt);
    processAfter.setDate(processAfter.getDate() + 30);

    const { error: withdrawalError } = await supabase
      .from("withdrawals")
      .insert({
        user_id,
        amount:        parseFloat(amount.toFixed(2)),
        status:        "pending",
        requested_at:  requestedAt.toISOString(),
        process_after: processAfter.toISOString(),
      });

    if (withdrawalError) {
      return NextResponse.json(
        { error: withdrawalError.message },
        { status: 500 }
      );
    }

    /* ---------- DEDUCT FROM AVAILABLE BALANCE ---------- */
    const { error: balanceError } = await supabase
      .from("affiliates")
      .update({
        available_balance: parseFloat(
          (affiliate.available_balance - amount).toFixed(2)
        ),
        updated_at: requestedAt.toISOString(),
      })
      .eq("user_id", user_id);

    if (balanceError) {
      return NextResponse.json(
        { error: balanceError.message },
        { status: 500 }
      );
    }

    console.log("✅ WITHDRAWAL REQUEST CREATED:", { user_id, amount });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ WITHDRAWAL ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
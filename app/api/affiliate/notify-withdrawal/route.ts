//SCRIPTA V1.040726.006 - Affiliate: withdrawal notification route

import { NextResponse } from "next/server";

const NOTIFY_EMAIL    = process.env.NOTIFY_EMAIL!;
const RESEND_API_KEY  = process.env.RESEND_API_KEY!;
const WEBHOOK_SECRET  = process.env.WITHDRAWAL_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {

    /* ---------- VERIFY WEBHOOK SECRET ---------- */
    const secret = req.headers.get("x-webhook-secret");
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const record = body?.record;

    if (!record) {
      return NextResponse.json(
        { error: "No record" },
        { status: 400 }
      );
    }

    /* ---------- SEND EMAIL VIA RESEND ---------- */
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    "Scripta Affiliate <noreply@scripta.ai>",
        to:      [NOTIFY_EMAIL],
        subject: "💰 New Withdrawal Request",
        html: `
          <h2>New Withdrawal Request</h2>
          <p><strong>User ID:</strong> ${record.user_id}</p>
          <p><strong>Amount:</strong> $${record.amount}</p>
          <p><strong>Requested:</strong> ${record.requested_at}</p>
          <p><strong>Process After:</strong> ${record.process_after}</p>
          <p>Login to Supabase to review and mark as paid.</p>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("❌ EMAIL SEND FAILED:", err);
      return NextResponse.json(
        { error: "Email failed" },
        { status: 500 }
      );
    }

    console.log("✅ WITHDRAWAL NOTIFICATION SENT");
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("❌ NOTIFY ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
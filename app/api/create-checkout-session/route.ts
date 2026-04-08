import Stripe from "stripe";
import { NextResponse } from "next/server";

/*const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);*/

function getStripe() {                       //|-----🟡🟡 PATCHED 30/3/26
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing Stripe key");
  }
  return new Stripe(key);
}                                           //-----|🟡🟡 30/3/26

export async function POST(req: Request) {

  try {

    const { userId, plan } = await req.json();

    const stripe = getStripe();         //🟡🟡 PATCHED 30/3/26

    /* =========================
       VALIDATION
    ========================= */

    if (!plan) {

      return NextResponse.json(
        { error: "Missing plan" },
        { status: 400 }
      );

    }

    /* =========================
       PLAN → STRIPE PRICE MAP
    ========================= */

    const priceMap: Record<string, string> = {

      lite: process.env.STRIPE_LITE_PRICE_ID!,
      student: process.env.STRIPE_STUDENT_PRICE_ID!,
      pro: process.env.STRIPE_PRO_PRICE_ID!

    };

    const priceId = priceMap[plan];

    if (!priceId) {

      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );

    }

    /* =========================
       STRIPE CHECKOUT SESSION
    ========================= */

    const session = await stripe.checkout.sessions.create({

      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url:
        `${process.env.NEXT_PUBLIC_BASE_URL}/app?success=true`,      // 🟡🟡 PATCHED 8/4/26 - REDIRECT TO /APP

      cancel_url:
        `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,

      metadata: {
        userId: userId ?? "anon",
        plan
      },

      subscription_data: {
        metadata: {
          userId: userId ?? "anon",
          plan
        }
      }

    });

    return NextResponse.json({ url: session.url });

  }

  catch (error: any) {

    console.error("Stripe Error:", error);

    return NextResponse.json(
      { error: "Stripe session creation failed" },
      { status: 500 }
    );

  }

}
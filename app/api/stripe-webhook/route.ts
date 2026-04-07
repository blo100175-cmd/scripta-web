import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {                 //|-----🟡🟡 PATCHED 20/3/26
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase ENV");
  }

  return createClient(url, key);
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing Stripe key");
  }
  return new Stripe(key);
}                                   //-----|🟡🟡 20/3/26

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/* =========================
       page_limit QUOTA
    ========================= */
const quotaMap: Record<string, number> = {          //|----- 🟡🟡 PATCHED 15/3/26
  free: 30,
  lite: 100,
  student: 200,
  pro: 500
};                                          //-----|🟡🟡 15/3/26

export async function POST(req: Request) {

  const stripe = getStripe();      // ✅ lazy init  //🟡🟡 PATCHED 20/3/26
  const supabase = getSupabase();  // ✅ lazy init  //🟡🟡 PATCHED 20/3/26

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");
  
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("🔥 STRIPE EVENT:", event.type);  //WEBHOOK LOGGING 🟡🟡 PATCHED 6/4/26

  /* =========================================================
     CHECKOUT SESSION COMPLETED (Bootstrap)
  ========================================================== */
  if (event.type === "checkout.session.completed") {

    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.subscription) {
      return new Response("No subscription", { status: 200 });
    }

    if (!session.customer) {
      return new Response("No customer", { status: 200 });
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    ) as Stripe.Subscription;

    const userId = subscription.metadata?.userId;
    const plan = session.metadata?.plan;

    console.log("✅ CHECKOUT COMPLETED", { userId, plan });     //🟡🟡 PATCHED 6/4/26 - SUCCESS LOGGING

  /*if (!userId || !plan) {
      return new Response("Missing metadata", { status: 200 });
    }*/

    if (!userId || !plan) {                   //|-----FAILSAFE 🟡🟡 PATCHED 6/4/26
      console.error("❌ Missing metadata (checkout.session.completed)", {
        userId,
        plan,
        session
      });
      return new Response("Missing metadata", { status: 400 });
    }                   //-----|🟡🟡  6/4/26

    const now = new Date().toISOString();

    console.log("✅ CHECKOUT COMPLETED", { userId, plan });   //🟡🟡 PATCHED 6/4/26 - SUCCESS LOGGING

    /* =========================
       1️⃣ Upsert subscriptions
    ========================= */
    await supabase.from("subscriptions").upsert({
      user_id: userId,
      plan,
      status: subscription.status,
      updated_at: now,
    }, {
      onConflict: "user_id"
    });

    /* =========================
       2️⃣ Update profiles
       (STORE stripe_customer_id HERE)
    ========================= */
    await supabase.from("profiles")
      .update({
        subscription_tier: plan,
        subscription_status: subscription.status,
        stripe_customer_id: session.customer as string, // ✅ NEW
        updated_at: now,
      })
      .eq("user_id", userId);

    /* =========================
       3️⃣ Update user_usage tier
    ========================= */
  /*await supabase.from("user_usage")
      .update({
        tier: plan,
        updated_at: now,
      })
      .eq("user_id", userId)
      .eq("month_key", getCurrentMonthKey());
  }*/

  /*const quotaMap: Record<string, number> = {   
      free: 30,
      lite: 100,
      student: 200,
      pro: 500
    };*/

    await supabase.from("user_usage")       //|-----🟡🟡 PATCHED 15/3/26
      .upsert({
        user_id: userId,
        month_key: getCurrentMonthKey(),
        tier: plan,
      /*page_limit: quotaMap[plan],*/
        page_limit: quotaMap[plan as keyof typeof quotaMap],     //🟡🟡 PATCHED 15/3/26
        updated_at: now
      }, {
        onConflict: "user_id,month_key"
      });                                     //-----|🟡🟡 15/3/26
  }    

  /* =========================================================
   SUBSCRIPTION UPDATED (Cancel at Period End / Status Change)
  ========================================================== */
  if (event.type === "customer.subscription.updated") {

    const subscription = event.data.object as Stripe.Subscription;

    const userId = subscription.metadata?.userId;
    if (!userId) {
      return new Response("No metadata", { status: 200 });
    }

    const now = new Date().toISOString();

    await supabase.from("subscriptions")
      .update({
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
        updated_at: now,
      })
      .eq("user_id", userId);

    await supabase.from("profiles")
      .update({
        subscription_status: subscription.status,
        updated_at: now,
      })
      .eq("user_id", userId);

    console.log("🟡 Subscription updated (cancel_at_period_end synced)");
  }

  /* =========================================================
   INVOICE PAID (Authoritative Renewal)
  ========================================================== */
  if (event.type === "invoice.paid") {

    console.log("🔥 INVOICE PAID TRIGGERED");

    const invoice = event.data.object as Stripe.Invoice;

    // 🔎 Extract subscription ID safely (v20 structure)
    const parent = invoice.parent as any;
    const subscriptionId =
      parent?.subscription_details?.subscription ||
      parent?.subscription ||
      null;
    
    if (!subscriptionId) {
      console.log("❌ No subscription ID found in invoice");
      return new Response("No subscription on invoice", { status: 200 });
    }

    // 🔎 Extract real billing boundary from line item period
    const firstLine = invoice.lines?.data?.[0] as any;
    const billingPeriodEnd = firstLine?.period?.end;

    if (!billingPeriodEnd) {
      console.log("❌ No billing period end found in invoice line");
      return new Response("Missing billing period", { status: 200 });
    }

    console.log("✅ Billing period end:", billingPeriodEnd);

    // 🔎 Retrieve subscription for metadata
    const subscription = await stripe.subscriptions.retrieve(
      subscriptionId
    ) as Stripe.Subscription;

    const userId = subscription.metadata?.userId;
    const plan = subscription.metadata?.plan;

    console.log("✅ INVOICE PAID", { userId, plan });  //🟡🟡 PATCHED 6/4/26 - SUCCESS LOGGING
  
    /*if (!userId || !plan) {
      console.log("❌ Missing metadata on subscription");
      return new Response("Missing metadata", { status: 200 });
    }*/

    if (!userId || !plan) {                 //|----- 🟡🟡 PATCHED 6/4/26 -FAILSAFE
      console.error("❌ Missing metadata (invoice.paid)", {
        userId,
        plan,
        subscription
      });
      return new Response("Missing metadata", { status: 400 });
    }                   //-----| 🟡🟡 PATCHED 6/4/26

    // ✅ Update subscriptions table
  /*await supabase.from("subscriptions")
      .update({
        status: subscription.status,
        current_period_end: new Date(
          billingPeriodEnd * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);*/

      // ✅ Upsert subscriptions table (ONE ROW PER USER)
      await supabase.from("subscriptions")          //|-----🟡🟡 PATCHED
        .upsert({
          user_id: userId,
          plan: plan,
          status: subscription.status,
          current_period_end: new Date(
            billingPeriodEnd * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        });                                       //-----|🟡🟡

    // ✅ Sync profiles table
    await supabase.from("profiles")
      .update({
        subscription_status: subscription.status,
        subscription_tier: plan,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    // ✅ Sync usage tier alignment
  /*await supabase.from("user_usage")
      .update({
        tier: plan,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("month_key", getCurrentMonthKey());*/
    
  /*const quotaMap: Record<string, number> = {      
      free: 30,
      lite: 100,
      student: 200,
      pro: 500
    };*/

    await supabase.from("user_usage")           //|-----🟡🟡 PATCHED 15/3/26
      .upsert({
        user_id: userId,
        month_key: getCurrentMonthKey(),
        tier: plan,
      /*page_limit: quotaMap[plan],*/
        page_limit: quotaMap[plan as keyof typeof quotaMap],   //🟡🟡 PATCHED 15/3/26
        updated_at: new Date().toISOString()
      }, {
        onConflict: "user_id,month_key"
      });                                       //-----|🟡🟡 15/3/26

    console.log("🎯 Subscription renewal synced successfully");
    
    // ========== AFFILIATE COMMISSION ENGINE ==========   //|-----🟡🟡 PATCHED 6/4/26 - AFFILIATE COMMISSION

    // 🔎 Get amount (Stripe sends in cents)---------------------
    const amount = (invoice.amount_paid || 0) / 100;

    // 🔎 Determine type ----------------------------------------
    const isInitial = invoice.billing_reason === "subscription_create";

    // 🔎 Get referral ------------------------------------------
    const { data: referral } = await supabase
      .from("referrals")
      .select("*")
      .eq("referred_user_id", userId)
      .maybeSingle();

    if (referral) {
      const rate = isInitial ? 0.15 : 0.10;
      const commission = amount * rate;

      // 🔁 Update referral--------------------------------------
    /*await supabase
        .from("referrals")
        .update({
          total_paid: (referral.total_paid || 0) + amount,
          total_commission:
            (referral.total_commission || 0) + commission,
          updated_at: new Date().toISOString(),
        })
        .eq("referred_user_id", userId);*/

      await supabase                                  //|-----🟡🟡 PATCHED 7/4/26 - REFERRALS UPDATE
        .from("referrals")
        .update({
          total_paid: (referral.total_paid || 0) + amount,
          total_commission:
            (referral.total_commission || 0) + commission,
          stripe_subscription_id: subscriptionId,
          plan: plan,
          updated_at: new Date().toISOString(),
        })
        .eq("referred_user_id", userId);              //-----|🟡🟡 PATCHED 7/4/26

      // 🔁 Get current affiliate value --------------------------
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("total_earned, total_referrals")
        .eq("user_id", referral.referrer_user_id)
        .single();

      // 🔁 Update affiliate -------------------------------------

    /*await supabase
        .from("affiliates")
        .update({
          total_earned: (referral.total_commission || 0) + commission,
        })
        .eq("user_id", referral.referrer_user_id);*/

      await supabase                                  //|-----🟡🟡 PATCHED 7/4/26 - UPDATE AFFILIATES
        .from("affiliates")
        .update({
          total_earned: (affiliate?.total_earned || 0) + commission,
        })
        .eq("user_id", referral.referrer_user_id);    //-----|🟡🟡 PATCHED 7/4/26

      // 🔁 increment referral count ONLY on first payment -------
      if (isInitial) {
        await supabase
          .from("affiliates")
          .update({
            total_referrals: (affiliate?.total_referrals || 0) + 1,
          })
          .eq("user_id", referral.referrer_user_id);
      }

      console.log("💰 Affiliate commission recorded", {
        userId,
        amount,
        commission,
        type: isInitial ? "initial" : "recurring",
      });
    }                       //-----|🟡🟡 PATCHED 6/4/26
  }

  /* =========================================================
     SUBSCRIPTION DELETED / EXPIRED
  ========================================================== */
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    const userId = subscription.metadata?.userId;
    if (!userId) {
      return new Response("No metadata", { status: 200 });
    }

    await supabase.from("subscriptions")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await supabase.from("profiles")
      .update({
        subscription_status: "expired",
        subscription_tier: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

  /*await supabase.from("user_usage")
      .update({
        tier: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("month_key", getCurrentMonthKey());*/
    
    await supabase.from("user_usage")           //|-----🟡🟡 PATCHED 15/3/26
      .upsert({
        user_id: userId,
        month_key: getCurrentMonthKey(),
        tier: "free",
      /*page_limit: 30,*/
        page_limit: quotaMap["free"],       //🟡🟡 PATCHED 15/3/26
        updated_at: new Date().toISOString()
      }, {
        onConflict: "user_id,month_key"
      });                                       //-----|🟡🟡 15/3/26
  }

  return new Response("OK", { status: 200 });
}
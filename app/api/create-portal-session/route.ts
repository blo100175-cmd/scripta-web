//SCRIPTA V1.1.140526 - SECURITY PATCH
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";     //🟡🟡PATCHED 140526 - SECURITY PATCH

/*const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);*/

function getStripe() {                         //|-----🟡🟡 PATCHED 30/3/26
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing Stripe key");
  }
  return new Stripe(key);

}                                             //-----|🟡🟡 30/3/26

function getSupabase() {            //|-----🟡🟡PATCHED 140526 - SECURITY PATCH
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase ENV");
  }

  return createClient(url, key);
}                                  //-----|🟡🟡PATCHED 140526


export async function POST(req: Request) {

  const { customerId } = await req.json();

  const stripe = getStripe();  //🟡🟡 PATCHED 30/3/26

  const supabase = getSupabase();   //🟡🟡PATCHED 140526 - SECURITY PATCH

  const { data: profile } = await supabase    //|-----🟡🟡PATCHED 140526 - SECURITY PATCH
    .from("profiles")
    .select("stripe_customer_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) {
    return new Response(
      "Invalid customer",
      { status: 403 }
    );
  }                                   //-----|🟡🟡PATCHED 140526

  if (!customerId) {
    return new Response("Missing customerId", { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: process.env.NEXT_PUBLIC_BASE_URL,
  });

  return Response.json({ url: session.url });
}
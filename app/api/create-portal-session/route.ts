import Stripe from "stripe";

/*const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);*/

function getStripe() {                         //|-----🟡🟡 PATCHED 30/3/26
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing Stripe key");
  }
  return new Stripe(key);
}                                             //-----|🟡🟡 30/3/26

export async function POST(req: Request) {

  const { customerId } = await req.json();

  const stripe = getStripe();  //🟡🟡 PATCHED 30/3/26

  if (!customerId) {
    return new Response("Missing customerId", { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: process.env.NEXT_PUBLIC_BASE_URL,
  });

  return Response.json({ url: session.url });
}
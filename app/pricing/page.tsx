"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import TaglineStrip from "@/components/TaglineStrip";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PricingProfile = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  subscription_tier: string;
  subscription_status: string;
  stripe_customer_id?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
};

export default function PricingPage() {

  const [profile, setProfile] = useState<PricingProfile | null>(null);
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     LOAD PROFILE (OPTIONAL)
  ========================= */

  useEffect(() => {

    async function loadProfile() {

      try {

        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          setLoading(false);
          return;
        }

        const res = await fetch("/api/get-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });

        if (!res.ok) throw new Error("Failed to load profile");

        const data = await res.json();
        setProfile(data);

      } catch (err: any) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    }

    loadProfile();

  }, []);


  /* =========================
     STRIPE PLAN UPGRADE
  ========================= */
/*async function upgrade(plan: string) {
    try {
      setProcessing(true);

      // Get current logged-in user
      const { data: { user } } = await supabase.auth.getUser();

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user?.id ?? null,
          plan
        })
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await res.json();
      window.location.href = data.url;
    }
    catch (err: any) {
      alert(err.message);
      setProcessing(false);
    }
  }*/

  async function upgrade(plan: string) {          //|-----🟡🟡 PATCHED

    if (!user) {
      alert("Please register or login before subscribing.");
      window.location.href = "/register";
      return;
    }

    try {
      setProcessing(true);
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          userId: user.id,
          plan
        })
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }
      const data = await res.json();
      window.location.href = data.url;
    }

    catch (err: any) {
      alert(err.message);
      setProcessing(false);
    }
  }                                 //-----|🟡🟡 

  /* =================================
     SWITCH-TO-FREE (for expired user)
  ================================== */
  async function switchToFree() {

    if (!user) {
      alert("Please login first.");
      window.location.href = "/login";
      return;
    }

    try {

      setProcessing(true);

      const res = await fetch("/api/switch-to-free", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      if (!res.ok) {
        throw new Error("Failed to switch to free plan");
      }

      window.location.reload();

    } catch (err: any) {

      alert(err.message);
      setProcessing(false);

    }
  }

  /* =========================
     BILLING PORTAL
  ========================= */

  async function manageBilling() {

    if (!profile?.stripe_customer_id) {
      alert("Stripe customer ID missing.");
      return;
    }

    try {

      setProcessing(true);

      const res = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: profile.stripe_customer_id,
        }),
      });

      if (!res.ok) throw new Error("Failed to open billing portal");

      const data = await res.json();

      window.location.href = data.url;

    } catch (err: any) {

      alert(err.message);
      setProcessing(false);

    }

  }

  /* =========================
     LOADING / ERROR
  ========================= */

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: 40 }}>Error: {error}</div>;
  }


  /* =========================
     PROFILE STATE
  ========================= */

  const renewalDate = profile?.current_period_end
    ? new Date(profile.current_period_end).toLocaleDateString()
    : "N/A";

  const isActive =
    profile?.subscription_status === "active" &&
    (!profile?.current_period_end ||
      new Date(profile.current_period_end) > new Date());

  const displayStatus =
    profile?.cancel_at_period_end && isActive
      ? "Active (Cancels at period end)"
      : profile?.subscription_status; 

  const isExpired = profile?.subscription_status === "expired";   //🟡🟡 PATCHED 15/3/26


  /* =========================
     PAGE UI (JSX)
  ========================= */

  return (
    <>
      <main className="pricing-page">

        {/* PAGE HEADER */}
        <section className="pricing-header">
          <h1 className="pricing-title">
            Pricing Plans
          </h1>
          <p className="pricing-subtitle">
            Choose the plan that fits your document workflow
          </p>
        </section>


        {/* CURRENT PLAN STATUS */}
        {profile && (
          <section className="plan-status">
            <h2>Your Current Plan</h2>
            <p>
              <strong>Tier:</strong> {profile.subscription_tier}
            </p>
            <p>
              <strong>Status:</strong> {displayStatus}
            </p>
            <p>
              <strong>Renewal Date:</strong> {renewalDate}
            </p>
            {profile.cancel_at_period_end && profile.current_period_end && (
              <p className="cancel-warning">
                ⚠ Subscription will cancel on {renewalDate}
              </p>
            )}
          </section>

        )}


        {/* PRICING GRID */}
        <section className="pricing-grid">

          {/* FREE */}
          <div className="pricing-card">
            <h2>FREE</h2>
            <p className="price">$0</p>
            <ul>
              <li>30 pages per month</li>
              <li>Watermarked output</li>
              <li>Basic AI processing</li>
            </ul>
            <button
              onClick={() => {

                if (!user) {
                  window.location.href = "/register";
                  return;
                }

                /* expired paid user → switch to free */
                if (isExpired && profile?.subscription_tier !== "free") {
                  switchToFree();
                  return;
                }

                /* already active free */
                if (profile?.subscription_tier === "free" && !isExpired) {
                  return;
                }

                /* fallback */
                window.location.href = "/app";

              }}
              disabled={processing || (profile?.subscription_tier === "free" && !isExpired)}
            >
              {!user
                ? "Register Free"
                : profile?.subscription_tier === "free" && !isExpired
                  ? "Current Plan"
                  : isExpired
                    ? "Switch to Free"
                    : "Free Plan"}
            </button>
          </div>

          {/* LITE */}
          <div className="pricing-card">
            <h2>LITE</h2>
            <p className="price">$3.99 / month</p>
            <ul>
              <li>100 pages per month</li>
              <li>No watermark</li>
              <li>Standard processing</li>
            </ul>
            <button
              onClick={() => upgrade("lite")}
              disabled={processing || (profile?.subscription_tier === "lite" && !isExpired)}
            >
              {profile?.subscription_tier === "lite" && !isExpired
                ? "Current Plan"
                : processing
                  ? "Redirecting..."
                  : "Subscribe"}
            </button>
          </div>

          {/* STUDENT (FEATURED PLAN) */}
          <div className="pricing-card featured">
            <h2>STUDENT</h2>
            <p className="price">$7.99 / month</p>
            <ul>
              <li>200 pages per month</li>
              <li>No watermark</li>
              <li>Priority AI processing</li>
            </ul>
            <button
              onClick={() => upgrade("student")}
              disabled={processing || (profile?.subscription_tier === "student" && !isExpired)}
            >
              {profile?.subscription_tier === "student" && !isExpired
                ? "Current Plan"
                : processing
                  ? "Redirecting..."
                  : "Subscribe"}
            </button>
          </div>

          {/* PRO */}
          <div className="pricing-card">
            <h2>PRO</h2>
            <p className="price">$19.99 / month</p>
            <ul>
              <li>500 pages per month</li>
              <li>No watermark</li>
              <li>Fast AI processing</li>
            </ul>
            <button
              onClick={() => upgrade("pro")}
              disabled={processing || (profile?.subscription_tier === "pro" && !isExpired)}
            >
              {profile?.subscription_tier === "pro" && !isExpired
                ? "Current Plan"
                : processing
                  ? "Redirecting..."
                  : "Subscribe"}
            </button>
          </div>

          {/* ENTERPRISE */}
          <div className="pricing-card">
            <h2>ENTERPRISE</h2>
            <p className="price">Negotiable</p>
            <ul>
              <li>Dedicated quotas</li>
              <li>Priority support</li>
              <li>Custom deployment</li>
            </ul>
            <button
              onClick={() => window.location.href="/#contact"}
            >
              Contact Us
            </button>
          </div>
        </section>


        {/* BILLING MANAGEMENT */}

        {isActive && (
          <section className="billing-manage">
            <button
              onClick={manageBilling}
              disabled={processing}
              className="billing-button"
            >
              {processing ? "Opening..." : "Manage Billing"}
            </button>
          </section>
        )}

      </main>

      {/* TAGLINE STRIP */}

      <TaglineStrip />

    </>
  );

}
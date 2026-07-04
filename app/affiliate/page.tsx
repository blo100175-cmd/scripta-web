//SCRIPTA - V1.030726.01-R

"use client";

import { useEffect, useState } from "react";
//import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { getSupabase } from "@/lib/supabaseClient";                     //🟡🟡PATCHED 040726

/*const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);*/
const supabase = getSupabase();                                         //🟡🟡PATCHED 040726

function generateSAA() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "SAA-";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

type Affiliate = {
  id: string;
  referral_code: string;
  total_earned: number;
  total_referrals: number;
};

type Referral = {
  referred_user_id: string;
  total_paid: number;
  total_commission: number;
  created_at: string;
};

export default function AffiliatePage() {

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState<string>("free");
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {

    async function loadData() {

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      // GET TIER
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        const isExpired = profile.subscription_status === "expired";
        setTier(isExpired ? "expired" : profile.subscription_tier);
      }

      // GET AFFILIATE INFO
      const { data: affiliateData } = await supabase
        .from("affiliates")
        .select("id, referral_code, total_earned, total_referrals")
        .eq("user_id", user.id)
        .maybeSingle();

      if (affiliateData) setAffiliate(affiliateData);

      // GET REFERRALS
      const { data: referralsData } = await supabase
        .from("referrals")
        .select("referred_user_id, total_paid, total_commission, created_at")
        .eq("referrer_user_id", user.id)
        .order("created_at", { ascending: false });

      if (referralsData) setReferrals(referralsData);

      setLoading(false);
    }

    loadData();

  }, []);

/*async function activateAffiliate() {

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("affiliates")
      .insert({
        user_id: user.id,
        referral_code: generateSAA(),
      });

    if (error) { console.error(error); return; }
    window.location.reload();
  }*/
  async function activateAffiliate() {                                  //|-----🟡🟡PATCHED 040726

    const supabase = getSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const referralCode = generateSAA();

    const { error } = await supabase
      .from("affiliates")
      .insert({
        user_id:           user.id,
        referral_code:     referralCode,
        terms_accepted_at: new Date().toISOString(),                     
      });

    if (error) {
      console.error(error);
      return;
    }

    window.location.reload();
  }                                                                     //-----|🟡🟡PATCHED 040726

  if (loading) return <div className="p-6">Loading...</div>;

  // NOT LOGGED IN
  if (!user) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Affiliate Program</h1>
        <p className="mb-4 text-gray-600">Please login to access the affiliate program.</p>
        <Link href="/login" className="inline-block px-4 py-2 bg-black text-white rounded">
          Login
        </Link>
      </div>
    );
  }

  // TIER GATE
  if (!affiliate && (tier === "free" || tier === "lite" || tier === "expired")) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Upgrade Required</h1>
        <p className="mb-4 text-gray-600">
          Affiliate access is available for Student and Pro members only.
        </p>
        <Link href="/pricing" className="inline-block px-4 py-2 bg-black text-white rounded">
          View Plans
        </Link>
      </div>
    );
  }

  // ACTIVATION
/*if (!affiliate && (tier === "student" || tier === "pro")) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Become a Scripta Affiliate</h1>
        <p className="mb-6 text-gray-600">
          Earn 15% one-time commission and 10% recurring commission
          for every active paid user you refer.
        </p>
        <button onClick={activateAffiliate} className="px-4 py-2 bg-black text-white rounded">
          Activate Affiliate
        </button>
      </div>
    );
  }*/

  // ACTIVATION
  if (!affiliate && (tier === "student" || tier === "pro")) {
    return (
      <div className="p-6 max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold mb-4">
          Become a Scripta Affiliate
        </h1>

        <p className="mb-4 text-gray-600">
          Earn 15% one-time commission and 10% recurring commission
          for every active paid user you refer.
        </p>

        <p className="mb-6 text-gray-600">
          By clicking Activate Affiliate, you confirm that you have read and agree to the{" "}
          <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline">Terms of Service</a>
          {" "}and the{" "}
          <a href="/affiliate-guide" target="_blank" rel="noopener noreferrer" className="underline">Affiliate Program Guide</a>.
        </p>

        <button
          onClick={activateAffiliate}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Activate Affiliate
        </button>

      </div>
    );
  }

  if (!affiliate) return <div className="p-6">You are not an affiliate yet.</div>;

  const referralLink = `${window.location.origin}/?ref=${affiliate.referral_code}`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Affiliate Dashboard</h1>

      <div className="mb-6">
        <p className="font-medium">Your Referral Link:</p>
        <div className="mt-2 p-3 bg-gray-100 rounded break-all">{referralLink}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm text-gray-500">Total Earnings</p>
          <p className="text-xl font-semibold">${Number(affiliate.total_earned).toFixed(2)}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm text-gray-500">Total Referrals</p>
          <p className="text-xl font-semibold">{affiliate.total_referrals}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Referrals</h2>
        {referrals.length === 0 ? (
          <p className="text-gray-500">No referrals yet.</p>
        ) : (
          <div className="space-y-3">
            {referrals.map((ref, idx) => (
              <div key={idx} className="p-4 border rounded bg-white">
                <p className="text-sm text-gray-500">User ID: {ref.referred_user_id}</p>
                <p>Total Paid: ${Number(ref.total_paid).toFixed(2)}</p>
                <p>Commission: ${Number(ref.total_commission).toFixed(2)}</p>
                <p className="text-xs text-gray-400">{new Date(ref.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
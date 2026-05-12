"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import Link from "next/link";

/*type Affiliate = {
  referral_code: string;
  total_earned: number;
  total_referrals: number;
};*/

type Affiliate = {                  //|-----🟡🟡PATCHED AFFILIATE 110526
  id: string;
  referral_code: string;
  total_earned: number;
  total_referrals: number;
};                                  //-----|🟡🟡PATCHED 110526

type Referral = {
  referred_user_id: string;
  total_paid: number;
  total_commission: number;
  created_at: string;
};

//SAA GENERATOR ======================================             //|-----🟡🟡PATCHED AFFILIATE 120526
function generateSAA() {            
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let result = "SAA-";

  for (let i = 0; i < 16; i++) {
    result += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return result;
}                                   //-----|🟡🟡PATCHED 120526

export default function AffiliatePage() {
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [tier, setTier] = useState<string>("free");               //|-----🟡🟡PATCHED AFFILIATE 120526
  const [status, setStatus] = useState<string>("inactive");       //|-----🟡🟡PATCHED AFFILIATE 120526
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    async function loadData() {
      const supabase = getSupabase();

      // 🔐 Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // LOADD PROFILE DATA ===========================                       //|-----🟡🟡PATCHED AFFILIATE 120526
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_status")
        .eq("user_id", user.id)
        .maybeSingle();                           //🟡🟡PATCHED AFFILIATE 120526

      if (profile) {
        setTier(profile.subscription_tier || "free");
        setStatus(profile.subscription_status || "inactive");
      }                                           //-----|🟡🟡PATCHED 120526

      // 📊 Get affiliate info =======================
      const { data: affiliateData } = await supabase
        .from("affiliates")
      /*.select("referral_code, total_earned, total_referrals")*/
        .select("id, referral_code, total_earned, total_referrals")
        .eq("user_id", user.id)
        .maybeSingle();;                           //🟡🟡PATCHED AFFILIATE 120526

      if (affiliateData) {
        setAffiliate(affiliateData);
      }

      // 📊 Get referrals list =======================
      const { data: referralsData } = await supabase
        .from("referrals")
        .select(
          "referred_user_id, total_paid, total_commission, created_at"
        )
        .eq("referrer_user_id", user.id)
        .order("created_at", { ascending: false });

      if (referralsData) {
        setReferrals(referralsData);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  // AFFILIATE ACTIVATION FUNCTION ===================          //|-----🟡🟡PATCHED AFFILIATE 120526
  async function activateAffiliate() {          

    const supabase = getSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const referralCode = generateSAA();

    const { error } = await supabase
      .from("affiliates")
      .insert({
        user_id: user.id,
        referral_code: referralCode,
      });

    if (error) {
      console.error(error);
      return;
    }

    window.location.reload();
  }                                          //-----|🟡🟡PATCHED 120526

  if (loading) {
    return <div className="p-6">Loading affiliate dashboard...</div>;
  }

  //=========== CSS ==================================
  //GUEST GATE =======================================            //|-----🟡🟡PATCHED AFFILIATE 120526
  if (!affiliate && tier === "free") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Affiliate Program
        </h1>

        <p className="mb-4 text-gray-600">
          Affiliate access is available for
          Student and Pro members only.
        </p>

        <Link
          href="/pricing"
          className="inline-block px-4 py-2 bg-black text-white rounded"
        >
          View Plans
        </Link>
      </div>
    );
  }                                         //-----|🟡🟡PATCHED 120526

  //FREE/LITE UPGRADE GATE ===============  //|-----🟡🟡PATCHED AFFILIATE 120526
  if (
    !affiliate &&
    (tier === "lite" || status !== "active")
  ) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Upgrade Required
        </h1>

        <p className="mb-4 text-gray-600">
          Upgrade to Student or Pro plan
          to access the affiliate program.
        </p>

        <Link
          href="/pricing"
          className="inline-block px-4 py-2 bg-black text-white rounded"
        >
          Upgrade Plan
        </Link>
      </div>
    );
  }                                         //-----|🟡🟡PATCHED 120526

  //ACTIVATION PAGE ======================  //|-----🟡🟡PATCHED AFFILIATE
  if (
    !affiliate &&
    (tier === "student" || tier === "pro") &&
    status === "active"
  ) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Become a Scripta Affiliate
        </h1>

        <p className="mb-6 text-gray-600">
          Earn 15% one-time commission and
          10% recurring commission for every
          active paid user you refer.
        </p>

        <button
          onClick={activateAffiliate}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Activate Affiliate
        </button>
      </div>
    );
  }                                         //-----|🟡🟡PATCHED 120526

  if (!affiliate) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Affiliate Dashboard</h1>
        <p className="mt-2 text-gray-500">
          You are not an affiliate yet.
        </p>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/?ref=${affiliate.referral_code}`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Affiliate Dashboard</h1>

      {/* Referral Link */}
      <div className="mb-6">
        <p className="font-medium">Your Referral Link:</p>
        <div className="mt-2 p-3 bg-gray-100 rounded break-all">
          {referralLink}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm text-gray-500">Total Earnings</p>
          <p className="text-xl font-semibold">
            ${Number(affiliate.total_earned).toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm text-gray-500">Total Referrals</p>
          <p className="text-xl font-semibold">
            {affiliate.total_referrals}
          </p>
        </div>
      </div>

      {/* Referrals List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Referrals</h2>

        {referrals.length === 0 ? (
          <p className="text-gray-500">No referrals yet.</p>
        ) : (
          <div className="space-y-3">
            {referrals.map((ref, idx) => (
              <div
                key={idx}
                className="p-4 border rounded bg-white"
              >
                <p className="text-sm text-gray-500">
                  User ID: {ref.referred_user_id}
                </p>
                <p>Total Paid: ${Number(ref.total_paid).toFixed(2)}</p>
                <p>
                  Commission: $
                  {Number(ref.total_commission).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(ref.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
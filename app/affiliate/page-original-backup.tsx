"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type Affiliate = {
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
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
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

      // 📊 Get affiliate info
      const { data: affiliateData } = await supabase
        .from("affiliates")
        .select("referral_code, total_earned, total_referrals")
        .eq("user_id", user.id)
        .single();

      if (affiliateData) {
        setAffiliate(affiliateData);
      }

      // 📊 Get referrals list
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

  if (loading) {
    return <div className="p-6">Loading affiliate dashboard...</div>;
  }

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
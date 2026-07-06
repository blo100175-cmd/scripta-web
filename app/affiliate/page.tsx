//SCRIPTA - V1.030726.001 - Affiliate - Commission payment flow update
//SCRIPTA - V1.030726.008 - Affiliate - Activation & Dashboard UI

"use client";

import { useEffect, useState } from "react";
//import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { getSupabase } from "@/lib/supabaseClient";                     //🟡🟡PATCHED 040726

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
  pending_balance: number;                                              //🟡🟡PATCHED 050726
  available_balance: number;                                            //🟡🟡PATCHED 050726
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

  const [banking, setBanking] = useState<any>(null);                    //🟡🟡PATCHED 050726
  const [withdrawals, setWithdrawals] = useState<any[]>([]);            //🟡🟡PATCHED 050726
  const [bankForm, setBankForm] = useState({                            //🟡🟡PATCHED 050726
    full_name: "",
    bank_name: "",
    account_number: "",
    country: "Malaysia",
    currency: "MYR",
  });
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");     //🟡🟡PATCHED 050726
  const [submitting, setSubmitting] = useState(false);                  //🟡🟡PATCHED 050726
  const [dashMsg, setDashMsg] = useState<string>("");                   //🟡🟡PATCHED 050726

  const [agreedToS, setAgreedToS] = useState(false);                    //🟡🟡PATCHED 060726
  const [agreedGuide, setAgreedGuide] = useState(false);                //🟡🟡PATCHED 060726

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
        .select("id, referral_code, total_earned, total_referrals, pending_balance, available_balance")  //🟡🟡PATCHED 050726
        .eq("user_id", user.id)
        .maybeSingle();

      if (affiliateData) setAffiliate(affiliateData);                   //|-----🟡🟡PATCHED 060726

      // GET REFERRALS
      const { data: referralsData } = await supabase
        .from("referrals")
        .select("referred_user_id, total_paid, total_commission, created_at")
        .eq("referrer_user_id", user.id)
        .order("created_at", { ascending: false });

      if (referralsData) setReferrals(referralsData);

      // GET BANKING DETAILS
      if (user) {
        const { data: bankingData } = await supabase
          .from("affiliate_banking")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (bankingData) {
          setBanking(bankingData);
          setBankForm({
            full_name:      bankingData.full_name,
            bank_name:      bankingData.bank_name,
            account_number: bankingData.account_number,
            country:        bankingData.country,
            currency:       bankingData.currency,
          });
        }

        // GET WITHDRAWAL HISTORY
        const { data: withdrawalData } = await supabase
          .from("withdrawals")
          .select("*")
          .eq("user_id", user.id)
          .order("requested_at", { ascending: false });
        if (withdrawalData) setWithdrawals(withdrawalData);
      }

      setLoading(false);                                                //-----|🟡🟡PATCHED 060726
    }

    loadData();

  }, []);

  async function activateAffiliate() {                                  //|-----🟡🟡PATCHED 040726

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

  /* -------- SAVE BANKING DETAILS -------- */
  async function saveBanking() {                                        //🟡🟡PATCHED 050726
    if (submitting) return;
    setSubmitting(true);
    setDashMsg("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const res = await fetch("/api/affiliate/banking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, ...bankForm }),
    });

    const result = await res.json();

    if (!res.ok) {
      setDashMsg(`❌ ${result.error || "Failed to save banking details."}`);
    } else {
      setDashMsg("✅ Banking details saved.");
      setBanking(bankForm);
    }

    setSubmitting(false);
  }

  /* -------- SUBMIT WITHDRAWAL -------- */
  async function submitWithdrawal() {                                   //🟡🟡PATCHED 050726
    if (submitting) return;
    setSubmitting(true);
    setDashMsg("");

    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount < 10) {
      setDashMsg("❌ Minimum withdrawal amount is $10.00.");
      setSubmitting(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const res = await fetch("/api/affiliate/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, amount }),
    });

    const result = await res.json();

    if (!res.ok) {
      setDashMsg(`❌ ${result.error || "Withdrawal failed."}`);
    } else {
      setDashMsg("✅ Withdrawal request submitted.");
      setWithdrawAmount("");
      window.location.reload();
    }

    setSubmitting(false);
  }

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
  if (!affiliate && (tier === "student" || tier === "pro")) {
    return (
      <div className="p-6 max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold mb-4">
          Become a Scripta Affiliate
        </h1>

        <p className="mb-6 text-gray-600">
          Earn 15% one-time commission and 10% recurring commission
          for every active paid user you refer.
        </p>

        <div className="mb-4 flex items-start gap-3">
          <input
            type="checkbox"
            id="agreeToS"
            checked={agreedToS}
            onChange={e => setAgreedToS(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agreeToS" className="text-gray-600 text-sm">
            I have read and agree to the{" "}
            <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline">
              Terms of Service
            </a>.
          </label>
        </div>

        <div className="mb-6 flex items-start gap-3">
          <input
            type="checkbox"
            id="agreeGuide"
            checked={agreedGuide}
            onChange={e => setAgreedGuide(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agreeGuide" className="text-gray-600 text-sm">
            I have read and agree to the{" "}
            <a href="/affiliate-guide" target="_blank" rel="noopener noreferrer" className="underline">
              Affiliate Program Guide
            </a>.
          </label>
        </div>

        <button
          onClick={activateAffiliate}
          disabled={!agreedToS || !agreedGuide}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* REFERRAL LINK */}
      <div className="mb-6">
        <p className="font-medium">Your Referral Link:</p>
        <div className="mt-2 p-3 bg-gray-100 rounded break-all">{referralLink}</div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm text-gray-500">Total Earned</p>
          <p className="text-xl font-semibold">
            ${Number(affiliate.total_earned).toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm text-gray-500">Total Referrals</p>
          <p className="text-xl font-semibold">{affiliate.total_referrals}</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm text-gray-500">Pending Balance</p>
          <p className="text-xl font-semibold text-yellow-600">
            ${Number(affiliate.pending_balance).toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-xl font-semibold text-green-600">
            ${Number(affiliate.available_balance).toFixed(2)}
          </p>
        </div>

      </div>

      {/* BANKING DETAILS */}
      <div className="mb-8 p-4 border rounded bg-white">
        <h2 className="text-lg font-semibold mb-4">Banking Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm text-gray-600 mb-1">Full Name (as per bank)</label>
            <input
              type="text"
              value={bankForm.full_name}
              onChange={e => setBankForm({ ...bankForm, full_name: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Bank Name</label>
            <input
              type="text"
              value={bankForm.bank_name}
              onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="e.g. Maybank"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Account Number</label>
            <input
              type="text"
              value={bankForm.account_number}
              onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="Account number"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Country</label>
            <input
              type="text"
              value={bankForm.country}
              onChange={e => setBankForm({ ...bankForm, country: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Currency</label>
            <input
              type="text"
              value={bankForm.currency}
              onChange={e => setBankForm({ ...bankForm, currency: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="e.g. MYR"
            />
          </div>

        </div>

        <button
          onClick={saveBanking}
          disabled={submitting}
          className="mt-4 px-4 py-2 bg-black text-white rounded"
        >
          {submitting ? "Saving..." : "Save Banking Details"}
        </button>

      </div>

      {/* WITHDRAWAL */}
      <div className="mb-8 p-4 border rounded bg-white">
        <h2 className="text-lg font-semibold mb-2">Request Withdrawal</h2>
        <p className="text-sm text-gray-500 mb-4">
          Minimum $10.00. Available balance: ${Number(affiliate.available_balance).toFixed(2)}
        </p>

        <div className="flex gap-3 items-center">
          <input
            type="number"
            min="10"
            step="0.01"
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(e.target.value)}
            className="border p-2 rounded w-40"
            placeholder="Amount (USD)"
          />
          <button
            onClick={submitWithdrawal}
            disabled={submitting || !banking}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Withdraw"}
          </button>
        </div>

        {!banking && (
          <p className="text-sm text-red-500 mt-2">
            Please save your banking details before requesting a withdrawal.
          </p>
        )}

      </div>

      {/* STATUS MESSAGE */}
      {dashMsg && (
        <p className="mb-6 text-sm font-medium">{dashMsg}</p>
      )}

      {/* WITHDRAWAL HISTORY */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <p className="text-gray-500">No withdrawal requests yet.</p>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w, idx) => (
              <div key={idx} className="p-4 border rounded bg-white">
                <p>Amount: <strong>${Number(w.amount).toFixed(2)}</strong></p>
                <p>Status: <span className="capitalize">{w.status}</span></p>
                <p className="text-xs text-gray-400">
                  Requested: {new Date(w.requested_at).toLocaleString()}
                </p>
                {w.paid_at && (
                  <p className="text-xs text-gray-400">
                    Paid: {new Date(w.paid_at).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REFERRALS LIST */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Referrals</h2>
        {referrals.length === 0 ? (
          <p className="text-gray-500">No referrals yet.</p>
        ) : (
          <div className="space-y-3">
            {referrals.map((ref, idx) => (
              <div key={idx} className="p-4 border rounded bg-white">
                <p className="text-sm text-gray-500">
                  User ID: {ref.referred_user_id}
                </p>
                <p>Total Paid: ${Number(ref.total_paid).toFixed(2)}</p>
                <p>Commission: ${Number(ref.total_commission).toFixed(2)}</p>
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
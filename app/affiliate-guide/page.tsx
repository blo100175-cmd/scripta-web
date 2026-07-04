"use client";

import HomeButton from "@/components/HomeButton";
import Link from "next/link";

export default function AffiliateGuide() {
  return (
    <>
      <main className="policy-page">

        <h1 className="policy-title">Affiliate Program Guide</h1>
        <p className="policy-updated">Effective: July 2026</p>

        {/* OVERVIEW */}
        <section className="policy-section">
          <h2>What is the Scripta Affiliate Program?</h2>
          <p>
            The Scripta Affiliate Program allows eligible subscribers to earn commissions by
            referring new paying users to the platform. As an Affiliate Agent (AA), you receive
            a unique referral link that tracks registrations and subscriptions attributed to
            your referrals — earning you commissions on every qualifying payment they make,
            for as long as they remain subscribed.
          </p>
        </section>

        {/* ELIGIBILITY */}
        <section className="policy-section">
          <h2>Who Can Join?</h2>
          <p>
            The Affiliate Program is open exclusively to Scripta subscribers on the{" "}
            <strong>Student</strong> or <strong>Pro</strong> plan with an active subscription.
            Free and Lite plan subscribers are not eligible to participate.
          </p>
          <p>
            If your subscription falls below the Student tier, your affiliate account will be
            paused. You will not accumulate new referral credits until your subscription is
            restored to an eligible tier. Any available balance at the time of suspension
            remains eligible for withdrawal.
          </p>
          <p>
            If you are currently on a Free or Lite plan and wish to join,{" "}
            <Link href="/pricing">upgrade your plan</Link> to get started.
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section className="policy-section">
          <h2>How It Works</h2>

          <h3>Step 1 — Activate Your Affiliate Account</h3>
          <p>
            Log in to Scripta and navigate to the Affiliate page via the navigation menu. If
            you meet the eligibility requirements, review and accept the Affiliate Program
            Terms, then click "Activate Affiliate" to generate your unique referral code and
            link.
          </p>

          <h3>Step 2 — Share Your Referral Link</h3>
          <p>
            Your unique referral link is available on your Affiliate Dashboard. Share it
            through your preferred channels — social media, blogs, email newsletters, academic
            communities, or professional networks.
          </p>

          <h3>Step 3 — Earn Commissions</h3>
          <p>
            When someone registers on Scripta using your referral link within 30 days of
            clicking it, and subsequently subscribes to a paid plan, you earn a commission.
            Commissions are tracked automatically and credited to your account.
          </p>
        </section>

        {/* COMMISSION */}
        <section className="policy-section">
          <h2>Commission Structure</h2>

          <table className="policy-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Commission</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>First payment by referred user</td>
                <td>15%</td>
                <td>One-time</td>
              </tr>
              <tr>
                <td>Each subsequent renewal payment</td>
                <td>10%</td>
                <td>Recurring</td>
              </tr>
            </tbody>
          </table>

          <p>
            Commissions are calculated on the net payment amount received by Scripta after
            deducting payment gateway fees and applicable taxes.
          </p>

          <h3>Example</h3>
          <p>
            A student subscribes to the Student Plan ($7.99/month) through your referral link.
          </p>
          <ul>
            <li>First month: you earn 15% → <strong>$1.20</strong></li>
            <li>Every subsequent month they remain subscribed: you earn 10% → <strong>$0.80/month</strong></li>
          </ul>
          <p>
            There is no cap on the number of referrals or total commissions you can earn.
          </p>
        </section>

        {/* HOLD PERIOD */}
        <section className="policy-section">
          <h2>30-Day Commission Hold</h2>
          <p>
            All earned commissions are held for <strong>30 days</strong> from the date the
            qualifying payment is received. This holding period protects against payment
            reversals, chargebacks, and disputes. After 30 days, your commission is
            automatically moved to your available balance and becomes eligible for withdrawal.
          </p>
          <p>
            If a referred user files a chargeback or payment dispute at any time, Scripta
            reserves the right to claw back the corresponding commission from your available
            or future balances.
          </p>
        </section>

        {/* WITHDRAWAL */}
        <section className="policy-section">
          <h2>Withdrawals & Payment</h2>

          <h3>Eligibility to Withdraw</h3>
          <ul>
            <li>Minimum available balance: <strong>USD 10.00</strong></li>
            <li>Minimum withdrawal amount: <strong>USD 10.00</strong></li>
            <li>Banking details must be submitted before your first withdrawal request</li>
            <li>Only one active withdrawal request is permitted at a time</li>
          </ul>

          <h3>Payment Schedule</h3>
          <p>Withdrawals are processed twice monthly:</p>
          <ul>
            <li><strong>15th of each month</strong> — for requests submitted between the 1st and 14th</li>
            <li><strong>30th of each month</strong> — for requests submitted between the 15th and 29th</li>
            <li>Requests submitted after the 30th are processed on the 15th of the following month</li>
          </ul>

          <h3>Payment Method & Fees</h3>
          <p>
            Commissions are paid via direct bank transfer. Any intermediary bank wire fees or
            currency conversion charges are borne by the AA and will be deducted from the
            payout amount. Ensure your banking details are accurate and up to date in your
            Affiliate Dashboard to avoid payment delays.
          </p>
        </section>

        {/* BANKING DETAILS */}
        <section className="policy-section">
          <h2>Setting Up Your Banking Details</h2>
          <p>
            Before submitting your first withdrawal request, add your banking details through
            the Affiliate Dashboard. You will need to provide:
          </p>
          <ul>
            <li>Full name (as registered with your bank)</li>
            <li>Bank name</li>
            <li>Bank account number</li>
            <li>Country</li>
            <li>Preferred currency</li>
          </ul>
          <p>
            Banking details can be updated at any time from your dashboard. Scripta is not
            responsible for failed or delayed payments resulting from incorrect banking
            information.
          </p>
        </section>

        {/* REFERRAL TRACKING */}
        <section className="policy-section">
          <h2>Referral Tracking</h2>
          <p>
            When someone visits Scripta through your referral link, the referral code is
            temporarily stored in their browser. This code is automatically submitted when
            they complete registration. The referral remains valid for <strong>30 days</strong>{" "}
            from the initial visit — if a visitor returns within that window and registers,
            your referral will still be attributed to you.
          </p>
        </section>

        {/* RULES */}
        <section className="policy-section">
          <h2>Program Rules & Integrity</h2>
          <p>
            To maintain the integrity of the Affiliate Program, the following are strictly
            prohibited:
          </p>
          <ul>
            <li>
              <strong>Self-referrals</strong> — using your own referral link to create
              secondary accounts or generate artificial commissions.
            </li>
            <li>
              <strong>Misleading promotion</strong> — misrepresenting Scripta's features,
              pricing, or capabilities in referral campaigns, paid advertisements, or
              published content.
            </li>
            <li>
              <strong>Referral manipulation</strong> — any attempt to artificially inflate
              referral counts or commission earnings through fraudulent means, including
              collusion between accounts.
            </li>
            <li>
              <strong>Spam</strong> — using bulk messaging, comment spam, or unsolicited
              link distribution to promote your referral link.
            </li>
          </ul>
          <p>
            Violations will result in immediate termination of affiliate status, forfeiture
            of all pending and available commissions, and potential permanent account suspension.
          </p>
        </section>

        {/* FAQ */}
        <section className="policy-section">
          <h2>Frequently Asked Questions</h2>

          <h3>Can I participate if I am on the Lite plan?</h3>
          <p>No. Affiliate Program participation requires an active Student or Pro subscription.</p>

          <h3>What happens to my commissions if I downgrade my plan?</h3>
          <p>
            Your affiliate account will be paused if your subscription falls below the Student
            tier. Any available balance remains eligible for withdrawal. Commissions in the
            30-day hold period will be released to your available balance upon completion of
            the hold, but no new commissions will accrue until your subscription is restored.
          </p>

          <h3>What happens if a referred user cancels their subscription?</h3>
          <p>
            Recurring commissions are tied to active subscription payments. If a referred user
            cancels, you will no longer receive recurring commissions from that user. Any
            commissions already earned and past the 30-day hold remain in your available balance.
          </p>

          <h3>Is there a limit to how many people I can refer?</h3>
          <p>There is no cap on the number of referrals or total commissions you can earn.</p>

          <h3>How do I track my referrals and earnings?</h3>
          <p>
            Your Affiliate Dashboard provides a real-time view of your referral link, total
            referrals, pending balance, available balance, and withdrawal history.
          </p>

          <h3>What if my banking details change?</h3>
          <p>
            Update your banking details through the Affiliate Dashboard at any time. Changes
            take effect on the next payment cycle.
          </p>

          <h3>Who do I contact if I have questions about my commissions?</h3>
          <p>
            Please use the contact form on the Scripta website. Include your registered email
            address and a description of your query.
          </p>
        </section>

        {/* LEGAL NOTE */}
        <section className="policy-section">
          <p className="policy-note">
            This Affiliate Program Guide is subject to the full{" "}
            <Link href="/terms-of-service">Scripta Terms of Service</Link>. In the event of
            any conflict between this Guide and the Terms of Service, the Terms of Service
            shall prevail.
          </p>
        </section>

      </main>

      <HomeButton />
    </>
  );
}

"use client";

import HomeButton from "@/components/HomeButton";

export default function PrivacyPolicy() {
  return (
    <>
      <main className="policy-page">

        <h1 className="policy-title">Privacy Policy</h1>
        <p className="policy-updated">Last Updated: July 2026</p>

        {/* SECTION 1 */}
        <section className="policy-section">
          <h2>1. Introduction</h2>
          <p>
            Scripta.ai ("Scripta," "we," "our," or "us"), operated by Living Circuits
            Technologies, is committed to protecting the privacy and personal data of our
            users. This Privacy Policy describes what information we collect, how we use it,
            how we protect it, and your rights in relation to it — including your rights under
            the Malaysian Personal Data Protection Act (PDPA) and applicable international
            data protection standards.
          </p>
          <p>
            By using the Scripta platform, you agree to the collection and use of information
            as described in this Privacy Policy.
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="policy-section">
          <h2>2. Information We Collect</h2>
          <p>
            Scripta adheres to data minimization principles. We collect only what is necessary
            to operate and improve the platform.
          </p>

          <h3>2.1 Account Information</h3>
          <p>
            When you register for a Scripta account, we collect your email address. No
            additional personal information is required for account creation or core platform
            functionality.
          </p>

          <h3>2.2 Payment & Billing Metadata</h3>
          <p>
            All payment processing is handled by our PCI-DSS compliant partner, Stripe.
            Scripta does not collect, store, or process your credit card numbers, CVVs, or
            expiration dates. We retain only the metadata supplied by Stripe that is necessary
            to manage your subscription — specifically your Stripe customer identifier and
            subscription status.
          </p>

          <h3>2.3 Document Processing Data</h3>
          <p>
            Documents uploaded to Scripta are stored in secure temporary environments and
            processed automatically via our AI pipeline. Upon delivery of the generated output,
            the original source documents and all processing fragments are permanently and
            systematically deleted from our servers. Scripta does not retain, archive, or
            index user documents beyond the active processing session. No human review of
            uploaded content is performed.
          </p>

          <h3>2.4 Usage Analytics</h3>
          <p>
            We collect anonymized usage data to monitor platform performance and stability,
            including processing volumes, error rates, and feature usage patterns. This data
            is aggregated and cannot be mapped back to individual users.
          </p>

          <h3>2.5 Technical Data</h3>
          <p>
            For security and operational monitoring purposes, our servers automatically capture
            standard technical parameters including masked IP addresses, browser type, operating
            system, and access timestamps. This data is used solely for platform security and
            is routinely purged.
          </p>
        </section>

        {/* SECTION 3 */}
        <section className="policy-section">
          <h2>3. Affiliate & Banking Data</h2>
          <p>
            Users who participate in the Scripta Affiliate Program provide additional
            information necessary for commission payout processing.
          </p>

          <h3>3.1 Data Collected</h3>
          <ul>
            <li>Full name (as registered with the banking institution)</li>
            <li>Bank name</li>
            <li>Bank account number</li>
            <li>Country</li>
            <li>Preferred payout currency</li>
          </ul>

          <h3>3.2 Purpose</h3>
          <p>
            Banking details are collected exclusively for the purpose of processing affiliate
            commission payments and satisfying applicable financial reporting requirements.
            This data is not used for any other purpose.
          </p>

          <h3>3.3 Storage & Security</h3>
          <p>
            Affiliate banking details are encrypted at rest within our secure database
            infrastructure. Access is restricted to essential financial operations and
            automated payout processing systems. This data is never shared with third parties
            beyond the financial institutions executing the payout transfer.
          </p>

          <h3>3.4 Retention</h3>
          <p>
            Banking details are retained for the duration of an active affiliate account.
            Upon termination of affiliate status or account deletion, banking details are
            permanently removed from our systems within 30 days, except where financial or
            tax regulations require longer retention.
          </p>
        </section>

        {/* SECTION 4 */}
        <section className="policy-section">
          <h2>4. Referral Tracking</h2>
          <p>
            When a visitor arrives at Scripta through an affiliate referral link, the referral
            code is stored locally in the visitor's browser using localStorage. This code is
            submitted to our systems upon successful account registration to attribute the
            referral to the appropriate Affiliate Agent.
          </p>
          <p>
            Referral codes stored in localStorage expire after 30 days. Scripta does not use
            advertising cookies or third-party tracking cookies for referral attribution or
            any other purpose.
          </p>
        </section>

        {/* SECTION 5 */}
        <section className="policy-section">
          <h2>5. How We Use Your Information</h2>
          <p>Information collected by Scripta is used solely for the following purposes:</p>
          <ul>
            <li>Operating, maintaining, and improving the Scripta platform.</li>
            <li>Processing documents and delivering AI-generated outputs.</li>
            <li>Managing user accounts and subscription status.</li>
            <li>Processing affiliate commission payments.</li>
            <li>Monitoring platform security and preventing fraudulent activity.</li>
            <li>Communicating with users regarding their accounts, subscriptions, or support requests.</li>
            <li>Complying with applicable legal obligations.</li>
          </ul>
          <p>
            Scripta does not sell, rent, or trade user data to third parties for marketing
            or advertising purposes under any circumstances.
          </p>
        </section>

        {/* SECTION 6 */}
        <section className="policy-section">
          <h2>6. Third-Party Service Providers</h2>
          <p>
            Scripta relies on the following trusted third-party providers. Data transmission
            to these partners is governed by Data Processing Agreements (DPAs):
          </p>
          <ul>
            <li>
              <strong>Application Hosting & Database:</strong> Vercel and Supabase — for
              platform hosting, encrypted storage, and database management.
            </li>
            <li>
              <strong>Payment Processing:</strong> Stripe — for subscription billing and
              payment management. Scripta is completely isolated from PCI-DSS scope through
              Stripe's hosted payment infrastructure.
            </li>
            <li>
              <strong>AI Processing:</strong> OpenAI — for document summarization. Documents
              are transmitted to OpenAI via API under zero-data-retention (ZDR) terms. OpenAI
              does not store or use data sent through our API to train public AI models. This
              protection is particularly relevant for legal, medical, and academic documents
              processed on our platform.
            </li>
            <li>
              <strong>Email Communications:</strong> Resend — for transactional email delivery
              including account verification and billing notifications.
            </li>
          </ul>
        </section>

        {/* SECTION 7 */}
        <section className="policy-section">
          <h2>7. Data Security</h2>
          <p>
            Scripta implements industry-standard technical and organizational safeguards to
            protect user data against unauthorized access, disclosure, alteration, or
            destruction. All network communication is enforced via TLS encryption. Database
            access is controlled through strict access policies and regularly reviewed.
          </p>
          <p>
            While we maintain high standards of data protection, no cloud system can guarantee
            absolute security. In the event of a data breach that materially affects your
            personal information, we will notify affected users within the timelines required
            by applicable law.
          </p>
        </section>

        {/* SECTION 8 */}
        <section className="policy-section">
          <h2>8. Cookies & Local Storage</h2>
          <p>Scripta uses minimal client-side storage:</p>
          <ul>
            <li>
              <strong>localStorage:</strong> Used for session management, anonymous user
              identification, and temporary referral code storage. No personally identifiable
              information is stored beyond what is necessary for platform functionality.
            </li>
            <li>
              <strong>Cookies:</strong> Scripta does not use advertising cookies, cross-site
              tracking cookies, or third-party analytics cookies.
            </li>
          </ul>
        </section>

        {/* SECTION 9 */}
        <section className="policy-section">
          <h2>9. Data Retention</h2>
          <ul>
            <li>
              <strong>Account data</strong> is retained for the duration of your active account
              and for a reasonable period thereafter as required by applicable law.
            </li>
            <li>
              <strong>Document data</strong> — uploaded documents and generated summaries are
              permanently deleted upon completion of processing.
            </li>
            <li>
              <strong>Subscription data</strong> is retained for the period required to comply
              with financial and legal obligations.
            </li>
            <li>
              <strong>Affiliate banking data</strong> is retained for the duration of active
              affiliate status and deleted within 30 days of account termination, subject to
              applicable tax retention requirements.
            </li>
          </ul>
        </section>

        {/* SECTION 10 */}
        <section className="policy-section">
          <h2>10. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have the following rights regarding your
            personal data:
          </p>
          <ul>
            <li>The right to access the personal data we hold about you.</li>
            <li>The right to request correction of inaccurate data.</li>
            <li>The right to request deletion of your personal data, subject to legal retention requirements.</li>
            <li>The right to data portability — you may request an export of your account metadata or affiliate statement.</li>
            <li>The right to withdraw consent where processing is based on consent.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us through the contact form on
            the Scripta website.
          </p>
        </section>

        {/* SECTION 11 */}
        <section className="policy-section">
          <h2>11. Children's Privacy</h2>
          <p>
            Scripta is not directed at individuals under the age of 18. We do not knowingly
            collect personal data from minors. If we become aware that a minor has registered
            without verifiable parental consent, we will take steps to delete the account and
            associated data promptly.
          </p>
        </section>

        {/* SECTION 12 */}
        <section className="policy-section">
          <h2>12. Amendments</h2>
          <p>
            Scripta reserves the right to update this Privacy Policy from time to time.
            Material changes will be communicated via email or prominent notice on the platform
            with a minimum of 14 days' advance notice. Your continued use of Scripta following
            the effective date of any update constitutes acceptance of the revised Privacy
            Policy.
          </p>
        </section>

        {/* SECTION 13 */}
        <section className="policy-section">
          <h2>13. Contact</h2>
          <p>
            For privacy-related inquiries, data requests, or concerns regarding this Privacy
            Policy, please contact us through the contact form available on the Scripta website.
          </p>
        </section>

      </main>

      <HomeButton />
    </>
  );
}

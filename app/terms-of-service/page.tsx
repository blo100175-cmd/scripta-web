"use client";

import HomeButton from "@/components/HomeButton";

export default function TermsOfService() {
  return (
    <>
      <main className="policy-page">

        <h1 className="policy-title">Terms of Service</h1>
        <p className="policy-updated">Last Updated: July 2026</p>

        {/* SECTION 1 */}
        <section className="policy-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing, registering for, or using the Scripta.ai platform ("Scripta," "we,"
            "our," or "us"), you ("User," "you") agree to be legally bound by these Terms of
            Service ("Terms") and our incorporated Privacy Policy. These Terms constitute a
            binding legal agreement between you and Scripta.ai, operated by Living Circuits
            Technologies.
          </p>
          <p>
            If you do not agree to these Terms in their entirety, you must immediately
            discontinue use of the platform. Continued use of Scripta following any amendment
            to these Terms constitutes acceptance of the revised Terms.
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="policy-section">
          <h2>2. Description of Service</h2>
          <p>
            Scripta.ai is an AI-powered document summarization platform that processes
            user-uploaded documents to generate structured, context-preserving summaries and
            analytical outputs. The platform is designed to assist students, legal professionals,
            researchers, and knowledge workers in efficiently extracting and understanding
            complex information from lengthy documents.
          </p>
          <p>
            <strong>AI Output Disclaimer:</strong> Scripta uses artificial intelligence and
            third-party large language models to generate outputs. AI-generated content may
            occasionally contain inaccuracies, omissions, or misleading statements. Scripta
            does not guarantee the factual accuracy, legal validity, or completeness of any
            generated output. You are solely responsible for verifying all outputs against
            original source materials before relying on them professionally or academically.
          </p>
          <p>
            Service features, processing limits, and output formats vary by subscription tier.
            Scripta reserves the right to modify, update, or discontinue any feature at any
            time with reasonable notice.
          </p>
        </section>

        {/* SECTION 3 */}
        <section className="policy-section">
          <h2>3. Eligibility & Account Registration</h2>
          <p>
            To access the full functionality of Scripta, you must register for an account
            using a valid email address. By registering, you represent that:
          </p>
          <ul>
            <li>You are at least 18 years of age, or have obtained verifiable parental or guardian consent.</li>
            <li>The information you provide during registration is accurate, current, and complete.</li>
            <li>You will maintain the accuracy of your account information and update it as necessary.</li>
            <li>
              You are solely responsible for maintaining the confidentiality of your account
              credentials and for all activities that occur under your account. You must notify
              Scripta immediately of any unauthorized use or security breach.
            </li>
          </ul>
          <p>
            Scripta reserves the right to refuse registration, or to suspend or terminate
            accounts found to be in violation of these Terms or applicable law.
          </p>
        </section>

        {/* SECTION 4 */}
        <section className="policy-section">
          <h2>4. Subscription Plans & Billing</h2>
          <p>
            Scripta offers both free and paid subscription tiers. Paid subscriptions are billed
            on a recurring monthly basis through our payment processor, Stripe.
          </p>

          <h3>4.1 Plan Tiers</h3>
          <p>
            Current subscription tiers include Free, Lite, Student, and Pro plans. Each tier
            carries defined document processing limits, output quality levels, and feature
            access as described on the Scripta Pricing page.
          </p>

          <h3>4.2 Billing & Renewal</h3>
          <p>
            Paid subscriptions renew automatically at the end of each billing cycle unless
            cancelled prior to the renewal date. By subscribing, you authorize Scripta to
            charge your payment method on a recurring basis, including any applicable taxes.
          </p>

          <h3>4.3 Cancellation</h3>
          <p>
            You may cancel your subscription at any time through the billing management portal
            accessible from your account. Cancellation takes effect at the end of the current
            billing period. You will retain access to paid features until that date.
          </p>

          <h3>4.4 Refund Policy</h3>
          <p>
            All subscription fees are non-refundable. Scripta does not offer prorated refunds
            for unused portions of a subscription period. This policy is consistent with
            industry standards for digital subscription services. In exceptional circumstances
            involving verified, prolonged platform failures attributable solely to Scripta,
            refund requests may be considered at Scripta's sole discretion. Fraudulent
            chargebacks or payment disputes may result in immediate account termination and
            recovery of associated processing fees.
          </p>

          <h3>4.5 Plan Downgrade on Expiry</h3>
          <p>
            Upon expiration or cancellation of a paid subscription, your account will
            automatically revert to the Free tier. Processing limits and feature access will
            adjust accordingly.
          </p>

          <h3>4.6 Price Changes</h3>
          <p>
            Scripta reserves the right to modify subscription pricing with a minimum of 30
            days' notice to active subscribers. Continued use of the service after a price
            change constitutes acceptance of the new pricing.
          </p>
        </section>

        {/* SECTION 5 */}
        <section className="policy-section">
          <h2>5. Document Processing & Data Handling</h2>

          <h3>5.1 Document Uploads</h3>
          <p>
            Users may upload documents in supported formats for AI-powered summarization. You
            represent and warrant that you have the legal right to upload and process any
            document submitted to Scripta.
          </p>

          <h3>5.2 Processing & Deletion</h3>
          <p>
            Documents uploaded to Scripta are processed automatically upon submission. Upon
            completion of processing and delivery of the generated output, uploaded documents
            and generated summaries are permanently deleted from our servers. Scripta does not
            retain user documents beyond the active processing session. No human review of
            uploaded documents is performed.
          </p>

          <h3>5.3 Content Responsibility</h3>
          <p>
            You are solely responsible for the content of documents you upload. Scripta does
            not review, validate, or endorse user-uploaded content. You agree not to upload
            documents containing unlawful, defamatory, obscene, confidential, or otherwise
            harmful content. Scripta disclaims all liability arising from your uploaded
            materials.
          </p>
        </section>

        {/* SECTION 6 */}
        <section className="policy-section">
          <h2>6. Intellectual Property</h2>

          <h3>6.1 Platform Ownership</h3>
          <p>
            All technology, branding, interface design, algorithms, and proprietary systems
            associated with Scripta.ai remain the exclusive intellectual property of Living
            Circuits Technologies. Nothing in these Terms transfers any ownership rights to you.
          </p>

          <h3>6.2 User Content</h3>
          <p>
            You retain full ownership of documents you upload to Scripta. By uploading content,
            you grant Scripta a limited, non-exclusive, royalty-free license to process your
            content solely for the purpose of delivering the requested service. This license
            terminates upon deletion of your content from our systems.
          </p>

          <h3>6.3 Generated Outputs</h3>
          <p>
            Scripta does not claim ownership of AI-generated outputs derived from your uploaded
            content. You are granted an unrestricted right to use, modify, and distribute
            generated outputs for personal or professional purposes.
          </p>
        </section>

        {/* SECTION 7 */}
        <section className="policy-section">
          <h2>7. Prohibited Conduct</h2>
          <p>Users agree not to engage in any of the following:</p>
          <ul>
            <li>Uploading documents containing unlawful, harmful, or infringing content.</li>
            <li>
              Reverse-engineering, decompiling, or extracting proprietary algorithms or systems
              from the Scripta platform.
            </li>
            <li>
              Using automated scripts, bots, or scrapers to access or extract data from the
              platform without prior written consent.
            </li>
            <li>
              Sharing account credentials with third parties or using a single account for
              multiple users in violation of the applicable subscription terms.
            </li>
            <li>
              Circumventing processing limits through the creation of multiple accounts.
            </li>
            <li>
              Using Scripta's platform, inputs, or generated outputs to train, fine-tune, or
              validate competing machine learning models or artificial intelligence systems.
            </li>
            <li>
              Using the platform for any purpose that violates applicable local, national, or
              international law.
            </li>
          </ul>
          <p>
            Violations may result in immediate account suspension or termination without notice
            or refund.
          </p>
        </section>

        {/* SECTION 8 */}
        <section className="policy-section">
          <h2>8. Affiliate Program</h2>

          <h3>8.1 Eligibility</h3>
          <p>
            Participation in the Scripta Affiliate Program is open to registered users holding
            an active Student or Pro subscription. Free and Lite plan subscribers are not
            eligible to participate.
          </p>

          <h3>8.2 Referral Mechanism</h3>
          <p>
            Upon activation, each Affiliate Agent ("AA") is assigned a unique referral code.
            A referral is successfully attributed when a new user registers through the AA's
            referral link within 30 days and subsequently subscribes to a paid plan.
          </p>

          <h3>8.3 Commission Structure</h3>
          <ul>
            <li><strong>One-Time Commission:</strong> 15% of the first payment made by a referred user upon initial subscription.</li>
            <li><strong>Recurring Commission:</strong> 10% of each subsequent renewal payment made by the same referred user for the duration of their active subscription.</li>
          </ul>
          <p>
            Commissions are calculated based on net payments received by Scripta after
            deducting payment gateway fees and applicable taxes.
          </p>

          <h3>8.4 Commission Hold Period</h3>
          <p>
            All earned commissions are subject to a 30-day holding period from the date the
            qualifying payment is received. This period exists to account for potential payment
            disputes, chargebacks, or refund requests. If a referred user files a chargeback
            or dispute at any time, Scripta reserves the right to claw back the corresponding
            commission from the AA's available or future balances.
          </p>

          <h3>8.5 Withdrawal Terms</h3>
          <ul>
            <li>Minimum available balance required to withdraw: USD 10.00.</li>
            <li>Minimum withdrawal amount: USD 10.00.</li>
            <li>Withdrawal requests are processed on the 15th and 30th of each calendar month.</li>
            <li>Requests submitted between the 1st and 14th are paid on the 15th.</li>
            <li>Requests submitted between the 15th and 29th are paid on the 30th.</li>
            <li>Only one pending withdrawal request may exist at a time.</li>
          </ul>

          <h3>8.6 Payment Method & Fees</h3>
          <p>
            Affiliate commissions are paid via direct bank transfer. AAs are required to
            provide accurate banking details through the Affiliate Dashboard prior to
            submitting a withdrawal request. Any intermediary bank wire fees or currency
            conversion charges are borne by the AA and will be deducted from the payout
            amount. Scripta is not liable for failed or delayed payments resulting from
            incorrect banking information provided by the AA.
          </p>

          <h3>8.7 Self-Referral Prohibition</h3>
          <p>
            Self-referrals are strictly prohibited. Any attempt to generate commissions through
            self-referral, fictitious accounts, or any form of referral manipulation will result
            in immediate termination of affiliate status, forfeiture of all pending and available
            commissions, and potential permanent account suspension.
          </p>

          <h3>8.8 Program Modifications & Termination</h3>
          <p>
            Scripta reserves the right to modify commission rates, payment terms, or eligibility
            criteria with 30 days' written notice to active AAs. Scripta further reserves the
            right to discontinue the Affiliate Program at any time with 30 days' notice. Upon
            termination, all verified available balances will be paid out within 60 days.
          </p>
        </section>

        {/* SECTION 9 */}
        <section className="policy-section">
          <h2>9. Warranty Disclaimer</h2>
          <p>
            THE PLATFORM AND ALL GENERATED OUTPUTS ARE PROVIDED ON AN "AS IS" AND "AS
            AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO
            THE MAXIMUM EXTENT PERMITTED BY LAW, LIVING CIRCUITS TECHNOLOGIES DISCLAIMS ALL
            WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM
            WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR MALWARE.
          </p>
        </section>

        {/* SECTION 10 */}
        <section className="policy-section">
          <h2>10. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SCRIPTA.AI,
            LIVING CIRCUITS TECHNOLOGIES, OR ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE
            FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING
            OUT OF OR RELATING TO YOUR USE OF OR INABILITY TO USE THE PLATFORM.
          </p>
          <p>
            THE TOTAL AGGREGATE LIABILITY OF LIVING CIRCUITS TECHNOLOGIES FOR ALL CLAIMS
            ARISING UNDER THESE TERMS SHALL BE LIMITED TO THE ACTUAL FEES PAID BY YOU TO
            SCRIPTA.AI DURING THE THREE (3) MONTH PERIOD IMMEDIATELY PRECEDING THE INCIDENT
            GIVING RISE TO LIABILITY.
          </p>
        </section>

        {/* SECTION 11 */}
        <section className="policy-section">
          <h2>11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of
            Malaysia. Any disputes arising under these Terms shall be subject to the exclusive
            jurisdiction of the courts of Malaysia.
          </p>
        </section>

        {/* SECTION 12 */}
        <section className="policy-section">
          <h2>12. Amendments</h2>
          <p>
            Scripta reserves the right to amend these Terms at any time. Material changes will
            be communicated via email or prominent notice on the platform with a minimum of 14
            days' advance notice. Your continued use of the platform following the effective
            date of any amendment constitutes acceptance of the revised Terms.
          </p>
        </section>

        {/* SECTION 13 */}
        <section className="policy-section">
          <h2>13. Contact</h2>
          <p>
            For questions, concerns, or notices regarding these Terms of Service, please
            contact us through the contact form available on the Scripta website.
          </p>
        </section>

      </main>

      <HomeButton />
    </>
  );
}

"use client";

import HomeButton from "@/components/HomeButton"

export default function TermsOfService() {
  return (
    <>
      <main className="policy-page">

        {/* PAGE TITLE */}
        <h1 className="policy-title">
          Terms of Service
        </h1>

        <p className="policy-updated">
          Last Updated: March 2026
        </p>

        {/* SECTION 1 */}
        <section className="policy-section">

          <h2>1. Acceptance of Terms</h2>

          <p>
            By accessing or using the Scripta platform, you agree to comply with
            and be bound by these Terms of Service. If you do not agree with any
            part of these terms, you should discontinue use of the service.
          </p>

        </section>

        {/* SECTION 2 */}
        <section className="policy-section">

          <h2>2. Use of the Service</h2>

          <p>
            Scripta provides AI-powered document analysis and summarization
            tools. Users agree to use the platform responsibly and only for
            lawful purposes. Misuse of the service, including attempts to
            disrupt or exploit the platform, is strictly prohibited.
          </p>

        </section>

        {/* SECTION 3 */}
        <section className="policy-section">

          <h2>3. User Responsibilities</h2>

          <p>
            Users are responsible for ensuring that any documents uploaded to
            Scripta comply with applicable laws and do not contain unlawful or
            harmful content. Users must also maintain the confidentiality of
            their account access.
          </p>

        </section>

        {/* SECTION 4 */}
        <section className="policy-section">

          <h2>4. Intellectual Property</h2>

          <p>
            All platform content, branding, and technology associated with
            Scripta remain the intellectual property of Scripta.ai unless
            otherwise stated. Users retain ownership of the documents they
            upload.
          </p>

        </section>

        {/* SECTION 5 */}
        <section className="policy-section">

          <h2>5. Service Availability</h2>

          <p>
            While we strive to maintain reliable service, Scripta does not
            guarantee uninterrupted availability. Features may change, be
            updated, or discontinued as the platform evolves.
          </p>

        </section>

        {/* SECTION 6 */}
        <section className="policy-section">

          <h2>6. Limitation of Liability</h2>

          <p>
            Scripta is provided on an "as-is" basis. We are not liable for any
            indirect, incidental, or consequential damages resulting from the
            use of the platform.
          </p>

        </section>

        {/* SECTION 7 */}
        <section className="policy-section">

          <h2>7. Contact</h2>

          <p>
            If you have questions regarding these Terms of Service, please
            contact us through the contact form available on the Scripta
            website.
          </p>

        </section>

      </main>

      {/* FLOATING HOME BUTTON */}
      <HomeButton />

    </>
  );
}
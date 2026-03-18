"use client";

import HomeButton from "@/components/HomeButton"

export default function PrivacyPolicy() {
  return (
    <>
      <main className="policy-page">

        {/* PAGE TITLE */}
        <h1 className="policy-title">
          Privacy Policy
        </h1>

        <p className="policy-updated">
          Last Updated: March 2026
        </p>

        {/* SECTION 1 */}
        <section className="policy-section">

          <h2>1. Information We Collect</h2>

          <p>
            Scripta collects limited information necessary to provide and improve
            our document analysis services. This may include account information
            such as email addresses, usage data related to document processing,
            and technical information required for system performance and
            security.
          </p>

        </section>

        {/* SECTION 2 */}
        <section className="policy-section">

          <h2>2. How We Use Your Information</h2>

          <p>
            Information collected is used solely for operating, maintaining,
            and improving the Scripta platform. This includes enabling document
            processing, managing user accounts, monitoring system performance,
            and enhancing the accuracy of AI-generated outputs.
          </p>

        </section>

        {/* SECTION 3 */}
        <section className="policy-section">

          <h2>3. Document Processing</h2>

          <p>
            Documents uploaded to Scripta are processed automatically by our AI
            systems to generate structured summaries and insights. Uploaded
            documents are handled securely and are not used for purposes outside
            of providing the requested service.
          </p>

        </section>

        {/* SECTION 4 */}
        <section className="policy-section">

          <h2>4. Data Security</h2>

          <p>
            We implement industry-standard safeguards designed to protect
            user information and uploaded content. While no system can guarantee
            absolute security, we continuously work to maintain high standards
            of data protection.
          </p>

        </section>

        {/* SECTION 5 */}
        <section className="policy-section">

          <h2>5. Third-Party Services</h2>

          <p>
            Scripta may rely on trusted third-party services to provide
            infrastructure, payment processing, and AI capabilities.
            These providers operate under their own privacy and security
            standards.
          </p>

        </section>

        {/* SECTION 6 */}
        <section className="policy-section">

          <h2>6. Contact</h2>

          <p>
            If you have questions regarding this Privacy Policy, please contact
            us through the contact form available on the Scripta website.
          </p>

        </section>

      </main>

      {/* FLOATING HOME BUTTON */} 
      <HomeButton />

    </>
  );
}
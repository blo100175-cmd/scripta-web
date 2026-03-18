"use client";

import HomeButton from "@/components/HomeButton"

export default function Documentation() {
  return (
    <>
      <main className="policy-page">

        {/* PAGE TITLE */}
        <h1 className="policy-title">
          Documentation
        </h1>

        <p className="policy-updated">
          Platform Overview and Usage Guide
        </p>


        {/* SECTION 1 */}
        <section className="policy-section">

          <h2>1. Introduction</h2>

          <p>
            Scripta is an AI-powered document analysis platform designed
            to transform complex documents into clear, structured insights.
            The platform enables users to upload documents, process them
            through an AI pipeline, and generate professional outputs
            including summaries and structured analytical reports.
          </p>

        </section>


        {/* SECTION 2 */}
        <section className="policy-section">

          <h2>2. How Scripta Works</h2>

          <p>
            When a document is uploaded, it enters the Scripta processing
            pipeline where it is registered, analyzed, and transformed into
            structured output. The platform uses AI models and processing
            logic to extract meaning, organize information, and generate
            readable insights.
          </p>

        </section>


        {/* SECTION 3 */}
        <section className="policy-section">

          <h2>3. Document Processing Workflow</h2>

          <p>
            The Scripta system processes documents through multiple stages
            including registration, policy validation, text extraction,
            AI analysis, structured synthesis, and artifact generation.
            These stages ensure documents are processed securely and
            consistently.
          </p>

        </section>


        {/* SECTION 4 */}
        <section className="policy-section">

          <h2>4. Output and Artifacts</h2>

          <p>
            After processing, Scripta generates structured output artifacts
            that present the extracted insights in a clear format. These
            artifacts can be downloaded as professionally formatted files
            suitable for sharing, reporting, and analysis.
          </p>

        </section>


        {/* SECTION 5 */}
        <section className="policy-section">

          <h2>5. Future Documentation</h2>

          <p>
            This documentation page currently provides a high-level overview.
            A full technical documentation set will be published in the
            future covering architecture, processing pipelines, usage
            instructions, and developer-level explanations of the Scripta
            platform.
          </p>

        </section>

      </main>

      {/* FLOATING HOME BUTTON */}
      <HomeButton />

    </>
  );
}
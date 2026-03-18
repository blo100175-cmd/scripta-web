"use client";

export default function Features() {
  return (
    <section id="features" className="features-section">

      {/* SECTION TITLE */}
      <h2 className="features-title">
        FEATURES
      </h2>

      {/* FEATURE GRID */}
      <div className="features-grid">

        {/* FEATURE 1 */}
        <div className="feature-card">

          <div className="feature-icon">
            <img src="/icons/file.png" alt="file"/>
          </div>

          <h3>AI Summarization</h3>

          <p>
            Instantly transform lengthy documents into clear,
            structured summaries powered by AI.
          </p>

        </div>

        {/* FEATURE 2 */}
        <div className="feature-card">

          <div className="feature-icon">
            <img src="/icons/diagram.png" alt="diagram"/>
          </div>

          <h3>Structured Insights</h3>

          <p>
            Convert complex information into hierarchical
            visual structures for easy understanding.
          </p>

        </div>

        {/* FEATURE 3 */}
        <div className="feature-card">

          <div className="feature-icon">
            <img src="/icons/fast-process.png" alt="fast process"/>
          </div>

          <h3>Fast Processing</h3>

          <p>
            Upload documents and receive AI-generated
            insights in seconds.
          </p>

        </div>

      </div>

    </section>
  );
}
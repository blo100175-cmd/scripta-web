"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <>
      {/* =========================================
          HERO SECTION
      ========================================== */}
      <section className="hero">

        {/* DARK OVERLAY */}
        <div className="hero-overlay"></div>

        {/* HERO CONTENT */}
        <div className="hero-content">

          {/* LEFT SIDE TEXT */}
          <div className="hero-left">

            {/* TRANSPARENT TEXT BOX */}
            <div className="hero-text-box">

              <h1 className="hero-title">
                TRANSFORM COMPLEXITY INTO CLARITY
              </h1>

              <p className="hero-desc">
                Ai-Powered Document Summarizer
              </p>

            </div>

          </div>

          {/* RIGHT SIDE CTA */}
          <div className="hero-right">

            <Link href="/app">
              <button className="cta-btn">
                TRY FOR FREE
              </button>
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================
          HERO BOTTOM DIVIDER
      ========================================== */}
      <div className="hero-divider"></div>
    </>
  );
}
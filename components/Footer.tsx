"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">

      {/* FOOTER LINKS */}
      <div className="footer-links">

        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>

        <span>|</span>

        <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">
          Terms of Service
        </a>

        <span>|</span>

        <a href="/documentation" target="_blank" rel="noopener noreferrer">
          Documentation
        </a>

      </div>

      {/* COPYRIGHT */}
      <p className="footer-text">
        © {new Date().getFullYear()} Scripta.ai.2026. All rights reserved.
      </p>

    </footer>
  );
}
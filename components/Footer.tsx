"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">

      {/* FOOTER LINKS */}
      <div className="footer-links">

        <Link href="/privacy-policy">Privacy Policy</Link>

        <span>|</span>

        <Link href="/terms-of-service">Terms of Service</Link>

        <span>|</span>

        <Link href="/documentation">Documentation</Link>

      </div>

      {/* COPYRIGHT */}
      <p className="footer-text">
        © {new Date().getFullYear()} Scripta.ai. All rights reserved.
      </p>

    </footer>
  );
}
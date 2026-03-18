import type { Metadata } from "next";
import { Fraunces, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-fraunces",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-bodoni",
});

export const metadata: Metadata = {
  title: "Scripta.ai",
  description: "AI-Powered Document Summarizer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${bodoni.variable}`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
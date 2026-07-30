//SCRIPTA-DEV
//SCRIPTA - V1.300726.100 - In-app HTML output viewer (Fact Tree / future HTML formats)

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

const supabase = getSupabase();

export default function ViewOutputPage() {
  const params = useParams();
  const docKey = params?.docKey as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!docKey) {
        setError("Missing document reference.");
        setLoading(false);
        return;
      }

      try {
        const { data, error: dbError } = await supabase
          .from("documents")
          .select("pdf_url, file_type, file_name")
          .eq("doc_key", docKey)
          .maybeSingle();

        if (dbError || !data || !data.pdf_url) {
          setError("Document not found or not ready yet.");
          setLoading(false);
          return;
        }

        setPdfUrl(data.pdf_url);
        setFileType(data.file_type);

        if (data.file_type === "html") {
          // Fetch the raw HTML via JS (NOT browser navigation) so
          // Supabase's forced-download/plain-text response header for
          // direct navigation never applies - we read it as text and
          // inject it ourselves into a sandboxed iframe.
          const res = await fetch(data.pdf_url);
          const text = await res.text();
          setHtmlContent(text);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load document.");
        setLoading(false);
      }
    }

    load();
  }, [docKey]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Loading your document...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#b91c1c" }}>
        {error}
      </div>
    );
  }

  // Non-HTML formats (PDF family) - just link out, existing behavior
  if (fileType !== "html") {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p>This document is a PDF.</p>
        <a
          href={pdfUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 16,
            background: "#2c5cff",
            color: "white",
            padding: "12px 24px",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", top: 70, left: 0, right: 0, bottom: 0, background: "#f5f7fa" }}>
      {htmlContent && (
        <iframe
          title="Document preview"
          srcDoc={htmlContent}
          sandbox="allow-scripts allow-same-origin allow-downloads"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      )}
    </div>
  );
}

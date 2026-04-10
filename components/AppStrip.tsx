"use client";

/* ================= SUPABASE + PDF ================= */
import { useState, useEffect } from "react";

import { getSupabase } from "@/lib/supabaseClient";      //🟡🟡PATCHED 9/4/26
/*import { createClient } from "@supabase/supabase-js";*/
import { extractText, getDocumentProxy } from "unpdf";

/*const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);*/

/* ================= PDF → TEXT ================= */
async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim();
}

/* ================= RPC SAVE TEXT ================= */
/*async function saveExtractedText(docKey: string, text: string) {
  const { error } = await supabase.rpc("save_extracted_text", {
    p_doc_key: docKey,
    p_text: text,
  });

  if (error) throw error;
}*/

  async function saveExtractedText(           //|-----🟡🟡PATCHED 10/4/26
  supabase: any,
  docKey: string,
  text: string
) {
  const { error } = await supabase.rpc("save_extracted_text", {
    p_doc_key: docKey,
    p_text: text,
  });

  if (error) throw error;
}                                           //-----|🟡🟡PATCHED 10/4/26

/* ================= COMPONENT ================= */
export default function AppStrip() {

  const supabase = getSupabase();         //🟡🟡PATCHED 10/4/26

  /* ===== AUTH SESSION (same as working file) ===== */
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

    return () => subscription.unsubscribe();
  }, []);

  /* ===== PIPELINE STATE ===== */
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [extractedText, setExtractedText] = useState("");

  const [docStatus, setDocStatus] = useState<
    "PROCESSING" | "FINALIZING" | "COMPLETED" | null
  >(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  /* ===== FILE SELECT ===== */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;

    setFile(e.target.files[0]);
    setExtractedText("");
    setDocStatus(null);
    setPdfUrl(null);
  }

  /* ================= UPLOAD FLOW ================= */
  async function uploadFile() {

    if (!file || isUploading) return;

    setIsUploading(true);

    try {

      /* --- STORAGE UPLOAD --- */
      setStatus("Uploading file...");
      const filePath = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("incoming")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      /* --- INSERT incoming_files (unchanged logic) --- */
      setStatus("Registering file...");

      const { data: inserted, error: insertError } = await supabase
        .from("incoming_files")
        .insert({
          user_id: user ? String(user.id) : "anon",
          file_name: file.name,
          bucket: "incoming",
          storage_path: filePath,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      const incomingId = inserted.id;

      /* --- WAIT FOR doc_key --- */
      setStatus("Waiting for registration...");

      let resolvedDocKey: string | null = null;

      for (let i = 0; i < 40; i++) {

        const { data } = await supabase
          .from("incoming_files")
          .select("doc_key, status")
          .eq("id", incomingId)
          .maybeSingle();

        if (data?.status === "registered" && data?.doc_key) {
          resolvedDocKey = data.doc_key;
          break;
        }

        await new Promise((r) => setTimeout(r, 500));
      }

      if (!resolvedDocKey)
        throw new Error("doc_key not ready (timeout)");

      setDocStatus("PROCESSING");

      /* --- EXTRACT TEXT --- */
      if (file.type === "application/pdf") {

        setStatus("Extracting text...");
        const text = await extractPdfText(file);

        setExtractedText(text);

        setStatus("Saving extracted text...");
      /*await saveExtractedText(resolvedDocKey, text);*/

        await saveExtractedText(supabase, resolvedDocKey, text);      //🟡🟡PATCHED 10/4/26
      }

      /* --- PIPELINE CONTINUES --- */
      setStatus("Processing document...");
      await pollDocumentStatus(resolvedDocKey);

      setFile(null);

    } catch (err: any) {

      console.error(err);
      setStatus(`❌ ${err.message}`);

    } finally {

      setIsUploading(false);

    }
  }

  /* ================= DOCUMENT POLLING ================= */
  async function pollDocumentStatus(docKey: string) {

    for (let i = 0; i < 60; i++) {

      /* --- POLICY CHECK --- */
      const { data: policyRow } = await supabase
        .from("processed_files")
        .select("policy_decision, tier")
        .eq("doc_key", docKey)
        .maybeSingle();

      if (policyRow?.policy_decision === "blocked") {
        setStatus("Usage limit exceeded.");
        setDocStatus(null);
        setIsUploading(false);
        return;
      }

      /* --- DOCUMENT STATUS --- */
      const { data: row } = await supabase
        .from("documents")
        .select("status, artifact_ready, pdf_url")
        .eq("doc_key", docKey)
        .maybeSingle();

      if (!row) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      if (row.status === "COMPLETED") {
        setDocStatus("COMPLETED");
        setPdfUrl(row.pdf_url);
        setIsUploading(false);
        return;
      }

      setDocStatus(row.artifact_ready ? "FINALIZING" : "PROCESSING");

      await new Promise((r) => setTimeout(r, 1000));
    }

    setIsUploading(false);
    throw new Error("Processing timeout");
  }

  /* ================= UI ================= */
  return (
    <section id="app-strip" style={{ padding: 60, background: "#f2f2f2" }}>

      <div style={{ display: "flex", gap: 40 }}>

        {/* ===== LEFT: UPLOAD PANEL ===== */}
        <div style={{ flex: 1 }}>

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
          />

          <button
            onClick={
              docStatus === "COMPLETED"
                ? () => pdfUrl && window.open(pdfUrl, "_blank")
                : uploadFile
            }
            disabled={(docStatus !== "COMPLETED" && !file) || isUploading}
          >
            {docStatus === "COMPLETED" ? "DOWNLOAD" : "UPLOAD"}
          </button>

          {status && <p>{status}</p>}

        </div>

        {/* ===== RIGHT: PREVIEW PANEL ===== */}
        <div
          style={{
            flex: 1,
            border: "1px solid #ccc",
            minHeight: 300,
            position: "relative",
            padding: 20,
            background: "#fff",
          }}
        >

          <textarea
            readOnly
            value={extractedText}
            placeholder="Document preview will appear here..."
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              resize: "none",
              outline: "none",
            }}
          />

          <span
            style={{
              position: "absolute",
              bottom: 8,
              right: 12,
              fontSize: 9,
              opacity: 0.6,
            }}
          >
            {extractedText.length} characters
          </span>

        </div>

      </div>

    </section>
  );
}
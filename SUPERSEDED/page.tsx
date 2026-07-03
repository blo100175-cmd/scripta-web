//scripta V1.050626.001 - Recovery Foundation Build
//scripta V1.100626.003 - Auth Stabilization

"use client";

import { useState, useEffect } from "react";
import { extractText, getDocumentProxy } from "unpdf";
import TaglineStrip from "@/components/TaglineStrip";                           //🟡🟡PATCHED 16/3/26
import { createClient } from "@supabase/supabase-js";                           //🟡🟡PATCHED 100626
import { useAuth } from "@/components/AuthProvider";                            //🟡🟡PATCHED 100626


/* ------------------ SUPABASE CLIENT ------------------ */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ------------------ PDF EXTRACTION ------------------ */
async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim();
}

/* ------------------ RPC SAVE TEXT ------------------ */
async function saveExtractedText(supabase: any, docKey: string, text: string) {         //🟡🟡PATCHED 050626
  const { error } = await supabase.rpc("save_extracted_text", {
    p_doc_key: docKey,
    p_text: text,
  });
  if (error) throw error;
}

/* ================== MAIN PAGE ================== */
export default function Home() {

  /* ---------------- AUTH ---------------- */
  const [user, setUser] = useState<any>(null);
  const [anonId, setAnonId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { user: authUser } = useAuth();                                         //🟡🟡PATCHED 100626

  /* -------------- PIPELINE STATE -------------- */
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [extractedText, setExtractedText] = useState("");

  const [docStatus, setDocStatus] = useState<
    "PROCESSING" | "FINALIZING" | "COMPLETED" | null
  >(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeDocKey, setActiveDocKey] = useState<string | null>(null);                //🟡🟡PATCHED 050626

  const [isUploading, setIsUploading] = useState(false);

  /* ---------------- AUTH SESSION ---------------- */
  useEffect(() => {

    /* ===== ANON USER ID ===== */
    let storedAnon = localStorage.getItem("anon_user_id");

    if (!storedAnon) {
      storedAnon = "anon_" + crypto.randomUUID();
      localStorage.setItem("anon_user_id", storedAnon);
    }

    setAnonId(storedAnon);

    /* ===== AUTH SESSION ===== */
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {

      setUser(session?.user ?? null);

      // reset pipeline state on auth change
      setFile(null);
      setDocStatus(null);
      setPdfUrl(null);
      setStatus("");

    });

    return () => subscription.unsubscribe();

  }, []);

  /* ---------------- FILE HANDLERS ---------------- */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {

    if (!e.target.files?.length) return;

    setFile(e.target.files[0]);
    setExtractedText("");
    setDocStatus(null);
    setPdfUrl(null);

  }

  /* ---------------- UPLOAD FLOW ---------------- */
  async function uploadFile() {

    if (!file || isUploading) return;
  //setIsUploading(true);
    const { data: { session } } = await supabase.auth.getSession();             //|-----🟡🟡PATCHED 100626
    const effectiveUser = session?.user || authUser || null;
    setIsUploading(true);                                                       //-----|🟡🟡PATCHED 100626

    try {

      setStatus("Uploading file...");

    //const filePath = `${Date.now()}-${file.name}`;                                    //OPT-OUT 050626
      const sanitizedFileName = file.name.replace(/\s+/g, "-");                         //🟡🟡PATCHED 050626

      const filePath = `${crypto.randomUUID()}-${Date.now()}-${sanitizedFileName}`;     //🟡🟡PATCHED 050626

    /*const { error: uploadError } = await supabase.storage
        .from("incoming")
        .upload(filePath, file);

      if (uploadError) throw uploadError;*/

      if (session?.access_token) {                                              //|-----🟡🟡PATCHED 100626

        // REGISTERED USER → API route (bypasses clock skew)
        const formData = new FormData();
        formData.append("file", file);
        formData.append("filePath", filePath);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }

      } else {

        // ANON USER → direct upload (no JWT, no clock skew)
        const { error: uploadError } = await supabase.storage
          .from("incoming")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

      }                                                                         //-----|🟡🟡PATCHED 100626

      setStatus("Registering file...");

      const { data: inserted, error: insertError } = await supabase
        .from("incoming_files")
        .insert({
        //user_id: user ? String(user.id) : anonId,
          user_id: effectiveUser ? String(effectiveUser.id) : anonId,           //🟡🟡PATCHED 100626
          file_name: file.name,
          bucket: "incoming",
          storage_path: filePath,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      const incomingId = inserted.id;

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
          localStorage.setItem("active_doc_key", resolvedDocKey as string);             //🟡🟡PATCHED 050626      
          break;
        }

        await new Promise((r) => setTimeout(r, 500));

      }

      if (!resolvedDocKey) throw new Error("doc_key not ready (timeout)");

      setDocStatus("PROCESSING");

      if (file.type === "application/pdf") {

        setStatus("Extracting text...");

        const text = await extractPdfText(file);
        setExtractedText(text);

        setStatus("Saving extracted text...");

        await saveExtractedText(supabase, resolvedDocKey, text);                        //🟡🟡PATCHED 050626                 

      }

      setStatus("Processing document...");

      await pollDocumentStatus(resolvedDocKey);

      setFile(null);

    } catch (err: any) {

      console.error(err);

      localStorage.removeItem("active_doc_key");                                        //🟡🟡PATCHED 050626
      setActiveDocKey(null);                                                            //🟡🟡PATCHED 050626

      setStatus(`❌ ${err.message || "Unexpected error"}`);

    } finally {

      setIsUploading(false);

    }

  }

  /* ---------------- POLLING PROCESS ---------------- */
  async function pollDocumentStatus(docKey: string) {

    for (let i = 0; i < 60; i++) {

      const { data: policyRow } = await supabase
        .from("processed_files")
        .select("policy_decision, blocked_reason, tier")
        .eq("doc_key", docKey)
        .maybeSingle();

      if (policyRow?.policy_decision === "blocked") {

        let message = "Usage limit exceeded.";

        if (policyRow.tier === "expired") {
          message = "🔒 YOUR SUBSCRIPTION HAS EXPIRED. RENEW TO CONTINUE.";
        }
        else if (policyRow.tier === "anon") {
          message = "FREE LIMIT EXCEEDED. REGISTER TO UNLOCK MORE PAGES.";
        }
        else if (policyRow.tier === "free") {
          message = "MONTHLY LIMIT EXCEEDED. UPGRADE YOUR PLAN.";
        }
        else {
          message = "MONTHLY LIMIT EXCEEDED. UPGRADE YOUR PLAN OR BUY EXTRA PAGES.";
        }

        setStatus(message);
        setDocStatus(null);
        setIsUploading(false);

        return;
      }

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
        localStorage.removeItem("active_doc_key");                                      //🟡🟡PATCHED 050626
        setIsUploading(false);
        return;
      }

      if (row.artifact_ready) {
        setDocStatus("FINALIZING");
      } else {
        setDocStatus("PROCESSING");
      }

      await new Promise((r) => setTimeout(r, 1000));

    }

    setIsUploading(false);
    throw new Error("Processing timeout");

  }

  /* ================== UI (JSX) ================== */
  return (
    <>
      <main className="min-h-screen bg-gray-100 p-6">

        <div className="max-w-3xl mx-auto mt-20 bg-white rounded-lg shadow p-6">

          <h1 className="text-2xl font-bold text-center mb-4">
            Scripta.ai
          </h1>

          {/* FILE UPLOAD */}
          <label className="block mb-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="border-2 border-dashed p-6 text-center cursor-pointer">
              {file ? `📄 ${file.name}` : "Tap to upload PDF"}
            </div>
          </label>

          <button
            onClick={uploadFile}
            disabled={!file || isUploading}
            className="w-full bg-black text-white py-3 rounded"
          >
            Upload
          </button>

          {status && (
            <div className="mb-4 text-center font-semibold text-blue-700">
              {status}
            </div>
          )}

          {docStatus === "FINALIZING" && (
            <p className="text-center mt-4">Finalizing document…</p>
          )}

          {docStatus === "COMPLETED" && pdfUrl && (
            <div className="text-center mt-6">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-3 rounded"
              >
                ⬇️ Download PDF
              </a>
            </div>
          )}

          {extractedText && (
            <textarea
              readOnly
              value={extractedText}
              className="w-full h-64 mt-6 border p-3 font-mono text-sm"
            />
          )}

        </div>

      </main>

      <TaglineStrip />

    </>
  );
}
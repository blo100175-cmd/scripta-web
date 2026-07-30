//SCRIPTA-DEV 
//SCRIPTA - V1.030726.01-R
//SCRIPTA - V1.070726.016 - Affiliate: move referral submission to /app page
//SCRIPTA - V1.080726.017 - Affiliate: fix referral submission timing on magic link auth
//SCRIPTA - V1.300726.100 - In-App HTML preview
"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabaseClient";                          //🟡🟡PATCHED - 030726 
import { extractText, getDocumentProxy } from "unpdf";
import TaglineStrip from "@/components/TaglineStrip";                        //🟡🟡PATCHED 16/3/26
import OutputFormatModal from "@/components/OutputFormatModal";              //🟡🟡PATCHED 280726

/* ------------------ SUPABASE CLIENT ------------------ */
const supabase = getSupabase();                                              //🟡🟡PATCHED - 030726

/* ------------------ PDF EXTRACTION ------------------ */
async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim();
}

/* ------------------ RPC SAVE TEXT ------------------ */
async function saveExtractedText(docKey: string, text: string) {
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

  /* -------------- PIPELINE STATE -------------- */
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [extractedText, setExtractedText] = useState("");

  const [docStatus, setDocStatus] = useState<
    "PROCESSING" | "FINALIZING" | "COMPLETED" | null
  >(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [completedDocKey, setCompletedDocKey] = useState<string | null>(null);   //🟠🟠PATCHED 300726

  /* ---------------- RENDERER OPTION ----------------- */
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>("bullet");
  const [tier, setTier] = useState<string>("free");

  /* ---------------- AUTH SESSION ---------------- */
  useEffect(() => {

    /* ===== ANON USER ID ===== */
    let storedAnon = localStorage.getItem("anon_user_id");

    if (!storedAnon) {
      storedAnon = "anon_" + crypto.randomUUID();
      localStorage.setItem("anon_user_id", storedAnon);
    }

    setAnonId(storedAnon);

    /* ===== REFERRAL SUBMISSION ===== */                               //|-----🟡🟡PATCHED 080726
    const refCode = localStorage.getItem("ref_code");

    if (refCode) {

      // Try immediately — may have session already
      supabase.auth.getSession().then(async ({ data }) => {
        const userId = data.session?.user?.id;
        if (userId) {
          try {
            await fetch("/api/affiliate/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                referral_code: refCode,
                user_id: userId,
              }),
            });
            localStorage.removeItem("ref_code");
            console.log("✅ REFERRAL SUBMITTED IMMEDIATELY");
          } catch (err) {
            console.error("❌ REFERRAL SUBMISSION ERROR:", err);
          }
        }
      });

      // Also listen for SIGNED_IN — catches magic link auth
      const { data: { subscription: refSub } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (_event === "SIGNED_IN" && session?.user?.id) {
            const stillHasRef = localStorage.getItem("ref_code");
            if (stillHasRef) {
              try {
                await fetch("/api/affiliate/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    referral_code: stillHasRef,
                    user_id: session.user.id,
                  }),
                });
                localStorage.removeItem("ref_code");
                console.log("✅ REFERRAL SUBMITTED ON SIGNED_IN");
              } catch (err) {
                console.error("❌ REFERRAL SUBMISSION ERROR:", err);
              }
              refSub.unsubscribe();
            }
          }
        }
      );
    }
    /* ===== END REFERRAL SUBMISSION ===== */                           //-----|🟡🟡PATCHED 080726

    /* ===== AUTH SESSION ===== */
  /*supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });*/

    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {                                                     //🟡🟡PATCHED 280726
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("user_id", sessionUser.id)
          .maybeSingle();
        setTier(profileRow?.subscription_tier || "free");
      } else {
        setTier("free");
      }                                                                      //🟡🟡PATCHED 280726

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
/*function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setFile(e.target.files[0]);
    setExtractedText("");
    setDocStatus(null);
    setPdfUrl(null);
  }*/

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {

    if (!e.target.files?.length) return;

    setFile(e.target.files[0]);
    setExtractedText("");
    setDocStatus(null);
    setPdfUrl(null);

  /*if (tier !== "free") {                                                   //🟡🟡PATCHED 280726
      setShowFormatModal(true);
    } else {
      setSelectedFormat("bullet");
    }*/                                                                      //🟡🟡PATCHED 280726
    
    if (tier === "lite" || tier === "student" || tier === "pro") {           //🟡🟡PATCHED 280726 v2
      setShowFormatModal(true);
    } else {
      setSelectedFormat("bullet");
    } 
  }    


  /* ================ UPLOAD FLOW ================= */
  async function uploadFile() {

    if (!file || isUploading) return;
    setIsUploading(true);

    try {

      setStatus("Uploading file...");

    //const filePath = `${Date.now()}-${file.name}`;
      const sanitizedFileName = file.name.replace(/\s+/g, "-");
      const filePath = `${crypto.randomUUID()}-${Date.now()}-${sanitizedFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("incoming")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setStatus("Registering file...");

    /*const { data: inserted, error: insertError } = await supabase
        .from("incoming_files")
        .insert({
          user_id: user ? String(user.id) : anonId,
          file_name: file.name,
          bucket: "incoming",
          storage_path: filePath,
          status: "pending",
        })
        .select("id")
        .single();*/
      
      const { data: inserted, error: insertError } = await supabase
        .from("incoming_files")
        .insert({
          user_id: user ? String(user.id) : anonId,
          file_name: file.name,
          bucket: "incoming",
          storage_path: filePath,
          status: "pending",
          requested_format: selectedFormat,                                   //🟡🟡PATCHED 280726
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

        await saveExtractedText(resolvedDocKey, text);

      }

      setStatus("Processing document...");

      await pollDocumentStatus(resolvedDocKey);

      setFile(null);

    } catch (err: any) {

      console.error(err);
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

    /*if (row.status === "COMPLETED") {
        setDocStatus("COMPLETED");
        setPdfUrl(row.pdf_url);
        setIsUploading(false);
        return;
      }*/
      
      if (row.status === "COMPLETED") {
        setDocStatus("COMPLETED");
        setPdfUrl(row.pdf_url);
        setCompletedDocKey(docKey);                                           //🟠🟠PATCHED 300726
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

          {showFormatModal && (                                             //🟡🟡PATCHED 280726
            <OutputFormatModal
              tier={tier as "free" | "lite" | "student" | "pro"}
              onConfirm={(format) => {
                setSelectedFormat(format);
                setShowFormatModal(false);
              }}
              onClose={() => setShowFormatModal(false)}
            />
          )}

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
                href={
                  selectedFormat === "bubble"
                    ? `/view/${completedDocKey}`
                    : pdfUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-3 rounded"
              >
                {selectedFormat === "bubble" ? "🌳 View Diagram" : "⬇️ Download PDF"}
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
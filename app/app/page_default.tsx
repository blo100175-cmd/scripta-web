//SCRIPTA V1.1.060426 - AFFILIATE BUILD-IN 
//SCRIPTA V1.1.140526 - BUG FIXING - DOWNLOAD LINK BUTTON | PREVENT DUPLICATION
//SCRIPTA V1.1.140526 - BUG FIXING - REMOVE STALE RECOVERY STATE AFTER MANUAL RESET
//SCRIPTA V1.1.180526 - FULL-STATE CENTRALIZATION IMPLEMENTATION + CLEANUP
"use client";

import { useState, useEffect } from "react";
import { extractText, getDocumentProxy } from "unpdf";
import TaglineStrip from "@/components/TaglineStrip";  //🟡🟡PATCHED 16/3/26
import { getSupabase } from "@/lib/supabaseClient";    //🟡🟡PATCHED 8/4/26 - SUPABASE CLIENT SIGN IN
import { useAuth } from "@/components/AuthProvider";   //🟡🟡PATCHED 180526

/* ------------------ PDF EXTRACTION ------------------ */
async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim();
}

/* ------------------ RPC SAVE TEXT ------------------ */
/*async function saveExtractedText(docKey: string, text: string) {
  const { error } = await (supabase as any).rpc("save_extracted_text", {       //🟡🟡PATCHED 8/4/26
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
}                           //-----|🟡🟡PATCHED 10/4/26

/* ================== MAIN PAGE ================== */
export default function Home() {

  const supabase = getSupabase();        //🟡🟡PATCHED 8/4/26 - SUPABASE CLIENT SIGN IN

  /* ---------------- AUTH ---------------- */
  const {user: authUser, loading: authProviderLoading, profile, tier, usage, 
    effectiveTier, effectiveStatus,} = useAuth();                         //🟡🟡PATCHED 180526
/*const [user, setUser] = useState<any>(null);*/
  const user = authUser;                                                  //🟡🟡PATCHED 190526
  const [anonId, setAnonId] = useState<string | null>(null);
/*const [authLoading, setAuthLoading] = useState(true);*/

  /* -------------- PIPELINE STATE -------------- */
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [extractedText, setExtractedText] = useState("");

  const [docStatus, setDocStatus] = useState<
    "PROCESSING" | "FINALIZING" | "COMPLETED" | null
  >(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeDocKey, setActiveDocKey] = useState<string | null>(null);   //🟡🟡PATCHED 140526 - BUG FIXING - DOWNLOAD LINK BUTTON
  const [isRecovering, setIsRecovering] = useState(false);          //🟡🟡PATCHED 140526 - PREVENT DUPLICATION
  const [isUploading, setIsUploading] = useState(false);

  /* ---------------- AUTH SESSION ---------------- */
  useEffect(() => {

    console.log("URL DEBUG:", window.location.href);    //🟡🟡 PATCHED 7/4/26

    // ========== AFFILIATE REF CAPTURE ==========               //|-----🟡🟡 PATCHED 6/4/26 - AFFILIATE SYSTEM

    const url = window.location.href;                   //|-----🟡🟡 PATCHED 7/4/26
    const refMatch = url.match(/[?&]ref=([^&]+)/);
    const ref = refMatch ? refMatch[1] : null;          //-----|🟡🟡 PATCHED 7/4/26

    if (ref && !localStorage.getItem("ref_code")) {    //🟡🟡 PATCHED 7/4/26
      console.log("✅ REF DETECTED:", ref);           //🟡🟡 PATCHED 7/4/26
      localStorage.setItem("ref_code", ref);
    }                                                 //-----|🟡🟡 6/4/26

    /* ===== ANON USER ID ===== */
    let storedAnon = localStorage.getItem("anon_user_id");

    if (!storedAnon) {
      storedAnon = "anon_" + crypto.randomUUID();
      localStorage.setItem("anon_user_id", storedAnon);
    }

    setAnonId(storedAnon);
    const savedDocKey =                       //|-----🟡🟡PATCHED 140526 - DOWNLOAD LINK BUTTON
      localStorage.getItem("active_doc_key");

  /*if (savedDocKey) {

      setActiveDocKey(savedDocKey);

      setStatus("Recovering active document...");

      pollDocumentStatus(savedDocKey)
        .catch(console.error);

    }*/                                         
  /*if (savedDocKey) {*/
    if (savedDocKey && !isRecovering) {
      setIsRecovering(true);
      setActiveDocKey(savedDocKey);
      setStatus("Recovering active document...");

      supabase
        .from("documents")
        .select("status, pdf_url")
        .eq("doc_key", savedDocKey)
        .maybeSingle()
        .then(({ data }) => {

          if (
            data?.status === "COMPLETED" &&
            data?.pdf_url
          ) {

            setDocStatus("COMPLETED");

            setPdfUrl(data.pdf_url);

            localStorage.removeItem("active_doc_key");
            setIsRecovering(false);           //🟡🟡PATCHED 140526 - PREVENT DUPLICATION
            return;
          }

        /*pollDocumentStatus(savedDocKey)
            .catch(console.error);*/
          pollDocumentStatus(savedDocKey)   
            .catch(console.error)
            .finally(() => {                                          //🟡🟡PATCHED 140526 - PREVENT DUPLICATION
              setIsRecovering(false);                                 //🟡🟡PATCHED 140526 - PREVENT DUPLICATION
            });  
        });
    }                                                                 //-----|🟡🟡PATCHED 140526

    /* ===== AUTH SESSION ===== */
    supabase.auth.getSession().then(async ({ data }) => {             //|----- 🟡🟡 PATCHED 6/4/26 - AFFILIATE REGISTER
    //const currentUser = data.session?.user ?? null;
    //const currentUser = authUser;                                   //🟡🟡PATCHED 190526

    //setUser(currentUser);
    /*setAuthLoading(false);*/

      // ========== AFFILIATE REGISTER ==========
    //if (currentUser) {
      if (authUser) {                                                 //🟡🟡PATCHED 190526
        const refCode = localStorage.getItem("ref_code");

        if (refCode) {
          try {
            await fetch("/api/affiliate/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                referral_code: refCode,
              //user_id: currentUser.id,
                user_id: authUser.id,                                 //🟡🟡PATCHED 190526
              }),
            });

            localStorage.removeItem("ref_code");
          } catch (e) {
            console.error("Affiliate register failed", e);
          }
        }
      }
  });                   //-----| 🟡🟡 PATCHED 6/4/26

    const {
      data: { subscription },
  //} = supabase.auth.onAuthStateChange((_event, session) => {
    } = supabase.auth.onAuthStateChange((_event) => {               //🟡🟡PATCHED 190526



    //setUser(session?.user ?? null);

      // reset pipeline state on auth change
      setFile(null);
      setDocStatus(null);
      setPdfUrl(null);
      setStatus("");
      setActiveDocKey(null);                                        //🟡🟡PATCHED 140526 - REMOVE STALE RECOVERY STATE

      localStorage.removeItem("active_doc_key");                    //🟡🟡PATCHED 140526 - REMOVE STALE RECOVERY STATE
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
    setIsUploading(true);

    try {

      setStatus("Uploading file...");

      const filePath = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("incoming")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setStatus("Registering file...");

      const { data: inserted, error: insertError } = await (supabase as any)   //🟡🟡PATCHED 8/4/26
        .from("incoming_files")
        .insert({
          user_id: authUser ? String(user.id) : anonId,
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
          setActiveDocKey(resolvedDocKey);          //|-----🟡🟡PATCHED 140526 - BUG FIXING - DOWNLOAD LINK BUTTON
          localStorage.setItem(
            "active_doc_key",
            resolvedDocKey as string
          );                                        //-----|🟡🟡PATCHED 140526
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

      /*await saveExtractedText(resolvedDocKey, text);*/
        await saveExtractedText(supabase, resolvedDocKey, text);   //🟡🟡PTCHED 10/4/26

      }

      setStatus("Processing document...");

      await pollDocumentStatus(resolvedDocKey);

      setFile(null);

    } catch (err: any) {

    /*console.error(err);
      setStatus(`❌ ${err.message || "Unexpected error"}`);*/

      console.error(err);                       //|-----🟡🟡PATCHED 140526 - DOWNLOAD LINK BUTTON
      localStorage.removeItem("active_doc_key");
      setActiveDocKey(null);
      setStatus(`❌ ${err.message || "Unexpected error"}`);       //-----|🟡🟡PATCHED 140526

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

        localStorage.removeItem("active_doc_key");          //🟡🟡PATCHED 140526 - DOWNLOAD LINK BUTTON
        
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
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDocument } from "@/components/document-context";
import { Card, PrimaryButton, SecondaryButton, Spinner } from "@/components/ui/primitives";
import { SAMPLE_ACADEMIC_TEXT, SAMPLE_HINDI_TEXT, SAMPLE_MARATHI_TEXT } from "@/lib/nlp/sampleData";
import { UploadCloud, FileText } from "lucide-react";

export function UploadPanel() {
  const { analyzeText, analyzeFile, loading, error } = useDocument();
  const [text, setText] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleAnalyzeText() {
    setLocalError(null);
    if (!text.trim()) {
      setLocalError("Please paste some text before analyzing.");
      return;
    }
    try {
      await analyzeText(text, "Pasted Text");
      router.push("/dashboard");
    } catch {
      // error surfaced via context
    }
  }

  async function handleFile(file: File) {
    setLocalError(null);
    const ext = file.name.toLowerCase().split(".").pop();
    if (ext !== "txt" && ext !== "pdf") {
      setLocalError("Only .txt and .pdf files are supported.");
      return;
    }
    try {
      await analyzeFile(file);
      router.push("/dashboard");
    } catch {
      // error surfaced via context
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">Paste academic text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Paste a paragraph, abstract, or academic article here in English, Hindi, or Marathi..."
            className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm leading-relaxed text-slate-800 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-slate-500">Quick Samples:</span>
              <button onClick={() => setText(SAMPLE_ACADEMIC_TEXT)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                English (AI & ML)
              </button>
              <span className="text-slate-300">·</span>
              <button onClick={() => setText(SAMPLE_HINDI_TEXT)} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                Hindi (हिन्दी)
              </button>
              <span className="text-slate-300">·</span>
              <button onClick={() => setText(SAMPLE_MARATHI_TEXT)} className="text-xs font-semibold text-amber-600 hover:text-amber-700">
                Marathi (मराठी)
              </button>
            </div>
            <span className="text-xs text-slate-400">{text.length.toLocaleString()} characters</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PrimaryButton onClick={handleAnalyzeText} disabled={loading}>
            {loading && <Spinner />}
            Analyze Document
          </PrimaryButton>

          <SecondaryButton onClick={() => fileInputRef.current?.click()} disabled={loading}>
            <UploadCloud size={16} /> Upload .txt / .pdf
          </SecondaryButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <FileText size={13} /> Max 5 MB
          </span>
        </div>

        {(localError || error) && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-rose-100">
            {localError || error}
          </p>
        )}
      </div>
    </Card>
  );
}

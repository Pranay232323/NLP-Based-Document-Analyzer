"use client";

import { useState, useEffect } from "react";
import { useDocument } from "@/components/document-context";
import { Card, PrimaryButton, SecondaryButton, Spinner } from "@/components/ui/primitives";
import { SAMPLE_ACADEMIC_TEXT, SAMPLE_HINDI_TEXT, SAMPLE_MARATHI_TEXT } from "@/lib/nlp/sampleData";
import { Sparkles, Play, RotateCcw, ChevronDown, ChevronUp, FileText } from "lucide-react";

interface ExperimentPlaygroundProps {
  moduleTitle: string;
  placeholder?: string;
  defaultExpanded?: boolean;
  onAnalyzeComplete?: () => void;
}

export function ExperimentPlayground({
  moduleTitle,
  placeholder = "Type or paste any text in English, Hindi, or Marathi to analyze in real-time...",
  defaultExpanded = false,
  onAnalyzeComplete,
}: ExperimentPlaygroundProps) {
  const { analysis, rawText, docName, analyzeText, loadSample, loading } = useDocument();
  const [inputText, setInputText] = useState("");
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [localLoading, setLocalLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Auto-initialize with sample text if no document is loaded yet
  useEffect(() => {
    if (!analysis && !loading) {
      loadSample().catch(() => {});
    }
  }, [analysis, loading, loadSample]);

  // Sync input text with active document rawText
  useEffect(() => {
    if (rawText && !inputText) {
      setInputText(rawText);
    }
  }, [rawText, inputText]);

  async function handleRun(customText?: string, name?: string) {
    const textToAnalyze = (customText ?? inputText).trim();
    if (!textToAnalyze) {
      setFeedback("Please enter text or select a sample below.");
      return;
    }
    setFeedback(null);
    setLocalLoading(true);
    try {
      await analyzeText(textToAnalyze, name ?? "Custom Input");
      setFeedback("Analysis updated successfully!");
      if (onAnalyzeComplete) onAnalyzeComplete();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLocalLoading(false);
    }
  }

  function handlePreset(sample: string, name: string) {
    setInputText(sample);
    setIsExpanded(true);
    handleRun(sample, name);
  }

  const isBusy = loading || localLoading;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <Card className="border-indigo-100/80 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Live NLP Sandbox · {moduleTitle}
              </h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200/60">
                Multilingual Ready
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Active: <span className="font-medium text-slate-700">{docName || "Demo Academic Text"}</span> ({rawText ? rawText.length.toLocaleString() : 0} chars)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SecondaryButton
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {isExpanded ? "Hide Input" : "Analyze Custom Text"}
          </SecondaryButton>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 pt-3 border-t border-slate-200/60">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleRun();
                }
              }}
              rows={4}
              placeholder={placeholder}
              className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-inner outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <div className="mt-1.5 flex flex-wrap items-center justify-between text-xs text-slate-400">
              <span>Press <kbd className="rounded border bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">Ctrl+Enter</kbd> to analyze</span>
              <span>{inputText.length.toLocaleString()} chars · {wordCount.toLocaleString()} words</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Quick Samples:</span>
              <button
                type="button"
                onClick={() => handlePreset(SAMPLE_ACADEMIC_TEXT, "English Academic Sample")}
                disabled={isBusy}
                className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
              >
                🇬🇧 English (AI & ML)
              </button>
              <button
                type="button"
                onClick={() => handlePreset(SAMPLE_HINDI_TEXT, "Hindi Sample")}
                disabled={isBusy}
                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
              >
                🇮🇳 Hindi (हिन्दी)
              </button>
              <button
                type="button"
                onClick={() => handlePreset(SAMPLE_MARATHI_TEXT, "Marathi Sample")}
                disabled={isBusy}
                className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
              >
                🇮🇳 Marathi (मराठी)
              </button>
              {rawText && inputText !== rawText && (
                <button
                  type="button"
                  onClick={() => setInputText(rawText)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  <FileText className="h-3 w-3" /> Restore Active Doc
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SecondaryButton
                onClick={() => setInputText("")}
                disabled={isBusy || !inputText}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3" /> Clear
              </SecondaryButton>
              <PrimaryButton
                onClick={() => handleRun()}
                disabled={isBusy || !inputText.trim()}
                className="text-xs"
              >
                {isBusy ? <Spinner /> : <Play className="h-3 w-3 fill-current" />} Analyze Now
              </PrimaryButton>
            </div>
          </div>

          {feedback && (
            <p
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                feedback.includes("success")
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
              }`}
            >
              {feedback}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

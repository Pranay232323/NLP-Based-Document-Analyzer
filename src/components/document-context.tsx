"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AnalysisResult } from "@/lib/nlp/types";
import { SAMPLE_ACADEMIC_TEXT, SAMPLE_DOCUMENT_NAME } from "@/lib/nlp/sampleData";

interface DocumentContextValue {
  docName: string;
  rawText: string;
  analysis: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  analyzeText: (text: string, docName: string) => Promise<void>;
  analyzeFile: (file: File) => Promise<void>;
  loadSample: () => Promise<void>;
  reset: () => void;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);
const STORAGE_KEY = "nlp-platform-analysis-v1";

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [docName, setDocName] = useState("");
  const [rawText, setRawText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { docName: string; rawText: string; analysis: AnalysisResult };
        setDocName(parsed.docName);
        setRawText(parsed.rawText);
        setAnalysis(parsed.analysis);
      }
    } catch {
      // ignore corrupted cache
    }
  }, []);

  const persist = useCallback((name: string, text: string, result: AnalysisResult) => {
    setDocName(name);
    setRawText(text);
    setAnalysis(result);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ docName: name, rawText: text, analysis: result }));
    } catch {
      // storage quota exceeded - ignore, in-memory state still works
    }
  }, []);

  const analyzeText = useCallback(
    async (text: string, name: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, docName: name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Analysis failed.");
        persist(name, text, data.result as AnalysisResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const analyzeFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/analyze", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Analysis failed.");
        const result = data.result as AnalysisResult;
        persist(file.name, result.rawText, result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const loadSample = useCallback(async () => {
    await analyzeText(SAMPLE_ACADEMIC_TEXT, SAMPLE_DOCUMENT_NAME);
  }, [analyzeText]);

  const reset = useCallback(() => {
    setDocName("");
    setRawText("");
    setAnalysis(null);
    setError(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({ docName, rawText, analysis, loading, error, analyzeText, analyzeFile, loadSample, reset }),
    [docName, rawText, analysis, loading, error, analyzeText, analyzeFile, loadSample, reset],
  );

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
}

export function useDocument() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocument must be used within a DocumentProvider");
  return ctx;
}

"use client";

import { useState } from "react";
import { useDocument } from "@/components/document-context";
import { Card, CardBody, CardHeader, SectionHeading, Badge, PrimaryButton, SecondaryButton, Spinner } from "@/components/ui/primitives";
import { ExperimentPlayground } from "@/components/experiment-playground";
import type { MorphologyBreakdown, WordGeneration } from "@/lib/nlp/types";
import { Search, Sparkles, Layers, Info } from "lucide-react";

const PRESET_WORDS = [
  { word: "unhappily", lang: "English" },
  { word: "redevelopment", lang: "English" },
  { word: "disagreeable", lang: "English" },
  { word: "पुस्तकातील", lang: "Marathi" },
  { word: "नियमपूर्वक", lang: "Marathi/Hindi" },
  { word: "सुविचार", lang: "Marathi/Hindi" },
  { word: "अंतर्राष्ट्रीय", lang: "Hindi" },
  { word: "अवैज्ञानिक", lang: "Hindi" },
];

export default function MorphologyPage() {
  const { analysis, loading: docLoading } = useDocument();
  const [word, setWord] = useState("unhappily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ breakdown: MorphologyBreakdown; generation: WordGeneration } | null>(null);
  const [docSearch, setDocSearch] = useState("");

  async function handleAnalyze(targetWord?: string) {
    const wordToAnalyze = (targetWord ?? word).trim();
    if (!wordToAnalyze) return;
    setWord(wordToAnalyze);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/morphology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: wordToAnalyze }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze word.");
    } finally {
      setLoading(false);
    }
  }

  const docMorphology = analysis?.morphology ?? [];
  const filteredDocMorph = docMorphology.filter((m) => {
    if (!docSearch.trim()) return true;
    const q = docSearch.toLowerCase().trim();
    return (
      m.word.toLowerCase().includes(q) ||
      m.root.toLowerCase().includes(q) ||
      (m.prefix && m.prefix.toLowerCase().includes(q)) ||
      (m.suffix && m.suffix.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Practical 4 · Core NLP"
        title="Morphological Analysis & Word Generation"
        description="Deconstruct words into morphemes (Prefix + Root + Suffix) and generate inflectional morphological variants across English, Hindi, and Marathi."
      />

      <ExperimentPlayground moduleTitle="Morphology Analyzer" />

      {docLoading && !analysis && (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
          <span className="ml-2 text-sm text-slate-500">Extracting morphological features...</span>
        </div>
      )}

      {/* Interactive Single-Word Sandbox */}
      <Card>
        <CardHeader
          title="Interactive Word Morphology Sandbox"
          subtitle="Analyze any individual English, Hindi, or Marathi word"
        />
        <CardBody className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Preset Words:</span>
              {PRESET_WORDS.map((p) => (
                <button
                  key={p.word}
                  type="button"
                  onClick={() => handleAnalyze(p.word)}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {p.word} <span className="text-[10px] opacity-60">({p.lang})</span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="w-full sm:w-72 rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Enter word (e.g. unhappily, पुस्तकातील)..."
              />
              <PrimaryButton onClick={() => handleAnalyze()} disabled={loading || !word.trim()}>
                {loading ? <Spinner /> : <Sparkles className="h-3.5 w-3.5 inline mr-1" />} Analyze Word
              </PrimaryButton>
            </div>
          </div>

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-rose-100">{error}</p>}

          {result && (
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Morphemic Decomposition ({result.breakdown.word})
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="rounded-lg bg-violet-100 text-violet-900 border border-violet-200 px-2.5 py-1 text-xs font-semibold">
                    Prefix: {result.breakdown.prefix ?? "None"}
                  </span>
                  <span className="rounded-lg bg-indigo-600 text-white px-3 py-1 text-xs font-bold shadow-xs">
                    Root: {result.breakdown.root}
                  </span>
                  <span className="rounded-lg bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 text-xs font-semibold">
                    Suffix: {result.breakdown.suffix ?? "None"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 pt-1 leading-relaxed">{result.breakdown.notes}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Inflectional Variants for Root &quot;{result.generation.base}&quot;
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.generation.variants.map((v) => (
                    <Badge key={v} tone="emerald">
                      {v}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-400 pt-1">
                  Generated via grammatical inflectional suffixes (pluralization, progressive, past, agentive forms).
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Document-Wide Vocabulary Morphology */}
      {analysis && (
        <Card>
          <CardHeader
            title="Corpus Vocabulary Morphology"
            subtitle={`Analyzed morphemic breakdown for ${filteredDocMorph.length} content words in active document`}
          />
          <CardBody className="space-y-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Search corpus words, roots, affixes..."
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
              />
            </div>

            <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <tr className="border-b border-slate-200">
                    <th className="py-2.5 px-4">Corpus Word</th>
                    <th className="py-2.5 px-4">Prefix</th>
                    <th className="py-2.5 px-4">Identified Root</th>
                    <th className="py-2.5 px-4">Suffix</th>
                    <th className="py-2.5 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredDocMorph.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                        No vocabulary words match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredDocMorph.map((m, idx) => (
                      <tr key={`${m.word}-${idx}`} className="hover:bg-slate-50 transition">
                        <td className="py-2 px-4 font-semibold text-slate-900">{m.word}</td>
                        <td className="py-2 px-4">
                          {m.prefix ? <Badge tone="violet">{m.prefix}</Badge> : <span className="text-slate-400 text-xs">none</span>}
                        </td>
                        <td className="py-2 px-4 font-semibold text-indigo-700">{m.root}</td>
                        <td className="py-2 px-4">
                          {m.suffix ? <Badge tone="amber">{m.suffix}</Badge> : <span className="text-slate-400 text-xs">none</span>}
                        </td>
                        <td className="py-2 px-4">
                          <button
                            type="button"
                            onClick={() => handleAnalyze(m.word)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                          >
                            Explore Form →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

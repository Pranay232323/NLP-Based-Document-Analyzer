"use client";

import { useState, useEffect, useMemo } from "react";
import { useDocument } from "@/components/document-context";
import {
  Card,
  CardBody,
  CardHeader,
  SectionHeading,
  Badge,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  Spinner,
} from "@/components/ui/primitives";
import { ExperimentPlayground } from "@/components/experiment-playground";
import {
  identifyLanguage,
  SAMPLE_LANGUAGE_SNIPPETS,
  type LanguageIdentificationResult,
} from "@/lib/nlp/languageId";
import { AlertCircle, Globe, BookOpen, Download, Search } from "lucide-react";

export default function LanguageIdPage() {
  const { analysis, rawText, docName } = useDocument();
  const [inputText, setInputText] = useState(
    () => rawText || SAMPLE_LANGUAGE_SNIPPETS[0].text
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markerSearch, setMarkerSearch] = useState("");

  const [result, setResult] = useState<LanguageIdentificationResult>(() => {
    if (analysis?.rawText) {
      return identifyLanguage(analysis.rawText);
    }
    return identifyLanguage(SAMPLE_LANGUAGE_SNIPPETS[0].text);
  });

  useEffect(() => {
    if (rawText) {
      setInputText(rawText);
      setResult(identifyLanguage(rawText));
      setError(null);
    }
  }, [rawText]);

  function handleIdentify(textToUse?: string) {
    const text = (textToUse ?? inputText).trim() || rawText || SAMPLE_LANGUAGE_SNIPPETS[0].text;
    if (!text.trim()) {
      setError("Please provide text for language identification.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResult(identifyLanguage(text));
    } catch {
      setError("Language identification failed.");
    } finally {
      setLoading(false);
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `language-id-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const headers = ["Marker", "Language", "Significance"];
    const rows = result.markersDetected.map((m) => [
      `"${m.word}"`,
      m.language,
      `"${m.significance}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `language-markers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredMarkers = useMemo(() => {
    if (!markerSearch.trim()) return result.markersDetected;
    const q = markerSearch.toLowerCase();
    return result.markersDetected.filter(
      (m) =>
        m.word.toLowerCase().includes(q) ||
        m.language.toLowerCase().includes(q) ||
        m.significance.toLowerCase().includes(q)
    );
  }, [result.markersDetected, markerSearch]);

  const tone =
    result.detectedLanguage === "English"
      ? "indigo"
      : result.detectedLanguage === "Hindi"
      ? "amber"
      : result.detectedLanguage === "Marathi"
      ? "rose"
      : "slate";

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Advanced NLP Lab · Exp 15"
        title="Language Identification & Script Analysis"
        description="Identifies language (English, Hindi, Marathi) using Unicode script analysis, character n-grams, and grammatical markers. Explains why script detection alone cannot differentiate Devanagari languages."
      />

      {/* GLOBAL INTERACTIVE PLAYGROUND */}
      <ExperimentPlayground
        moduleTitle="Exp 15 · Language Identification"
        placeholder="Type or paste any text in English, Hindi, Marathi, or mixed scripts to analyze script and language..."
        onAnalyzeComplete={() => {
          if (rawText) {
            setInputText(rawText);
            setResult(identifyLanguage(rawText));
          }
        }}
      />

      {/* INPUT AREA */}
      <Card>
        <CardHeader
          title="Multilingual Text Input"
          subtitle="Paste English or Indic text in Latin or Devanagari script"
          action={
            <div className="flex items-center gap-2">
              <SecondaryButton onClick={exportJSON} className="text-xs">
                <Download size={13} className="mr-1" />
                JSON
              </SecondaryButton>
              <SecondaryButton onClick={exportCSV} className="text-xs">
                <Download size={13} className="mr-1" />
                CSV
              </SecondaryButton>
            </div>
          }
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Sample Inputs:</span>
            {SAMPLE_LANGUAGE_SNIPPETS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setInputText(sample.text);
                  handleIdentify(sample.text);
                }}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste English, Hindi (हिन्दी), or Marathi (मराठी) text..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words · {inputText.length} characters
            </span>
            {docName && (
              <span className="truncate max-w-xs text-slate-400">
                Active context: {docName}
              </span>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <PrimaryButton onClick={() => handleIdentify()} disabled={loading}>
              {loading ? <Spinner size={14} /> : "Identify Language"}
            </PrimaryButton>
            <SecondaryButton onClick={() => setInputText("")}>Clear</SecondaryButton>
          </div>
        </CardBody>
      </Card>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Detected Language"
          value={result.detectedLanguage}
          tone={tone}
        />
        <StatCard
          label="Certainty Confidence"
          value={`${(result.confidence * 100).toFixed(0)}%`}
          tone="indigo"
        />
        <StatCard
          label="Detected Script"
          value={result.script.scriptName}
          tone="violet"
        />
        <StatCard
          label="Total Alpha Characters"
          value={result.script.totalAlphaChars}
          tone="slate"
        />
      </div>

      {/* SCRIPT & EVIDENCE INSPECTION */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SCRIPT BREAKDOWN */}
        <Card>
          <CardHeader
            title="Unicode Script Analysis"
            subtitle="Character encoding distribution across Unicode blocks"
          />
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Latin Characters</span>
                <span className="font-semibold">
                  {result.script.latinChars} ({(result.script.latinRatio * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  style={{ width: `${result.script.latinRatio * 100}%` }}
                  className="h-2 rounded-full bg-indigo-600 transition-all"
                />
              </div>

              <div className="flex justify-between text-xs text-slate-600 pt-2">
                <span>Devanagari Characters (U+0900 - U+097F)</span>
                <span className="font-semibold">
                  {result.script.devanagariChars} ({(result.script.devanagariRatio * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  style={{ width: `${result.script.devanagariRatio * 100}%` }}
                  className="h-2 rounded-full bg-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Decision Rationale: </span>
              {result.explanation.decisionRationale}
            </div>
          </CardBody>
        </Card>

        {/* GRAMMATICAL MARKERS DETECTED */}
        <Card>
          <CardHeader
            title="Morphological & Lexical Evidence"
            subtitle="Distinguishing markers matched in input"
            action={
              <Badge tone="indigo">
                {result.markersDetected.length} Evidence Matches
              </Badge>
            }
          />
          <CardBody className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={markerSearch}
                onChange={(e) => setMarkerSearch(e.target.value)}
                placeholder="Filter detected markers..."
                className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="overflow-x-auto">
              {filteredMarkers.length > 0 ? (
                <table className="w-full min-w-[340px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-3">Marker</th>
                      <th className="py-2 pr-3">Target Language</th>
                      <th className="py-2 pr-3">Linguistic Function</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarkers.map((marker, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2 pr-3 font-semibold text-slate-900">{marker.word}</td>
                        <td className="py-2 pr-3">
                          <Badge
                            tone={
                              marker.language === "Hindi"
                                ? "amber"
                                : marker.language === "Marathi"
                                ? "rose"
                                : "indigo"
                            }
                          >
                            {marker.language}
                          </Badge>
                        </td>
                        <td className="py-2 pr-3 text-slate-600">{marker.significance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="py-3 text-xs text-slate-400 italic">
                  {result.markersDetected.length === 0
                    ? "No specific Hindi/Marathi function markers detected."
                    : "No markers match your search."}
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* EDUCATIONAL SCRIPT VS LANGUAGE NOTE */}
      <Card>
        <CardHeader
          title="Linguistic Principle: Script Detection vs Language Discrimination"
          subtitle="Understanding why orthography and vocabulary are distinct"
          action={
            <Badge tone="violet" className="flex items-center gap-1">
              <BookOpen size={12} />
              Educational Insight
            </Badge>
          }
        />
        <CardBody className="space-y-3 text-xs text-slate-600">
          <div className="rounded-lg bg-indigo-50/60 p-3 leading-relaxed text-indigo-900">
            <span className="font-semibold text-indigo-950">Key Linguistic Takeaway: </span>
            {result.explanation.scriptVsLanguageExplanation}
          </div>
          <div className="rounded-lg border border-slate-100 p-3 leading-relaxed">
            <span className="font-semibold text-slate-800">Morphological Analysis: </span>
            {result.explanation.linguisticInsight}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useDocument } from "@/components/document-context";
import { Card, CardBody, CardHeader, SectionHeading, Badge, StatCard, SecondaryButton, Spinner } from "@/components/ui/primitives";
import { ExperimentPlayground } from "@/components/experiment-playground";
import { StepSimulator } from "@/components/ui/step-simulator";
import { generatePreprocessingSimulation } from "@/lib/nlp/simulators";
import { computeReadability } from "@/lib/nlp/readability";
import { Search, Download, Filter, CheckCircle2, BookOpen, Gauge, FileText } from "lucide-react";

export default function PreprocessingPage() {
  const { analysis, loading } = useDocument();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "filtered" | "stopwords" | "numeric">("filtered");

  const preprocessing = analysis?.preprocessing;

  const simTarget = analysis?.rawText?.slice(0, 160) || "Natural language processing is concerned with interactions between computers and language.";
  const simulation = useMemo(() => generatePreprocessingSimulation(simTarget), [simTarget]);
  const readability = useMemo(() => computeReadability(analysis?.rawText || simTarget), [analysis?.rawText, simTarget]);

  function filterTokens(tokens: string[] = []) {
    if (!searchQuery.trim()) return tokens;
    const q = searchQuery.toLowerCase().trim();
    return tokens.filter((t) => t.toLowerCase().includes(q));
  }

  function handleExport() {
    if (!preprocessing) return;
    const data = {
      meta: analysis?.meta,
      scriptValidation: preprocessing.scriptValidation,
      rawTokensCount: preprocessing.rawTokens.length,
      filteredTokens: preprocessing.filteredTokens,
      removedStopwords: preprocessing.removedStopwords,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preprocessing-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredList = preprocessing
    ? activeTab === "all"
      ? filterTokens(preprocessing.rawTokens)
      : activeTab === "filtered"
      ? filterTokens(preprocessing.filteredTokens)
      : activeTab === "stopwords"
      ? filterTokens(preprocessing.removedStopwords)
      : filterTokens(preprocessing.removedNumeric)
    : [];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Practical 2 · Core NLP"
        title="Tokenization, Filtration & Script Validation"
        description="Transform raw text into discrete processing units, strip linguistic noise (stopwords, punctuation, numerals), and validate multilingual script encodings (Latin vs Devanagari)."
      />

      <ExperimentPlayground moduleTitle="Text Preprocessing" />
      
      {/* INTERACTIVE ALGORITHM SIMULATOR */}
      <StepSimulator
        title="Visual Tokenizer & Stopword Filtration Simulator"
        subtitle="Watch the tokenizer scan words, check stopword dictionaries, and filter noise step-by-step"
        tokens={simulation.tokens}
        steps={simulation.steps}
        badgeText="Exp 2 Simulator"
      />

      {loading && !preprocessing && (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
          <span className="ml-2 text-sm text-slate-500">Loading analysis...</span>
        </div>
      )}

      {preprocessing && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Raw Tokens" value={preprocessing.rawTokens.length} />
            <StatCard label="Word Tokens" value={preprocessing.wordTokens.length} />
            <StatCard label="Filtered Tokens" value={preprocessing.filteredTokens.length} tone="emerald" />
            <StatCard label="Stopwords Removed" value={preprocessing.removedStopwords.length} tone="rose" />
          </div>

          {/* Script Validation Card with Rich Visuals */}
          <Card>
            <CardHeader
              title="Script Validation & Encoding Analysis"
              subtitle="Character distribution across Unicode blocks"
              action={
                <Badge tone={preprocessing.scriptValidation.isValid ? "emerald" : "rose"}>
                  <CheckCircle2 className="mr-1 h-3 w-3 inline" />
                  {preprocessing.scriptValidation.label}
                </Badge>
              }
            />
            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Latin Script Ratio</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-700">
                    {(preprocessing.scriptValidation.latinRatio * 100).toFixed(1)}%
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${Math.min(preprocessing.scriptValidation.latinRatio * 100, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{preprocessing.scriptValidation.latinChars} Latin characters</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Devanagari Script Ratio</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {((preprocessing.scriptValidation.devanagariRatio ?? 0) * 100).toFixed(1)}%
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.min((preprocessing.scriptValidation.devanagariRatio ?? 0) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{preprocessing.scriptValidation.devanagariChars} Devanagari characters</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Alphabetic Chars</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">
                    {preprocessing.scriptValidation.totalAlphaChars.toLocaleString()}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Non-Latin Characters: <span className="font-semibold text-slate-700">{preprocessing.scriptValidation.nonLatinChars}</span>
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Interactive Token Inspection with Search & Tabs */}
          <Card>
            <CardHeader
              title="Token Stream Inspector"
              subtitle={`Viewing ${filteredList.length} of ${
                activeTab === "all"
                  ? preprocessing.rawTokens.length
                  : activeTab === "filtered"
                  ? preprocessing.filteredTokens.length
                  : activeTab === "stopwords"
                  ? preprocessing.removedStopwords.length
                  : preprocessing.removedNumeric.length
              } tokens`}
              action={
                <SecondaryButton onClick={handleExport} className="text-xs">
                  <Download className="mr-1 h-3.5 w-3.5 inline" /> Export JSON
                </SecondaryButton>
              }
            />
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setActiveTab("filtered")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === "filtered"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Filtered ({preprocessing.filteredTokens.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("stopwords")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === "stopwords"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Stopwords ({preprocessing.removedStopwords.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("numeric")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === "numeric"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Numerals ({preprocessing.removedNumeric.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === "all"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    All Raw ({preprocessing.rawTokens.length})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tokens..."
                    className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                {filteredList.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No tokens match your search criteria.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {filteredList.slice(0, 300).map((t, idx) => (
                      <Badge
                        key={`${t}-${idx}`}
                        tone={
                          activeTab === "filtered"
                            ? "emerald"
                            : activeTab === "stopwords"
                            ? "rose"
                            : activeTab === "numeric"
                            ? "amber"
                            : "slate"
                        }
                      >
                        {t}
                      </Badge>
                    ))}
                    {filteredList.length > 300 && (
                      <span className="text-xs text-slate-400 self-center">
                        +{filteredList.length - 300} more tokens
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Model: Psycholinguistic Readability & Text Complexity */}
          <Card>
            <CardHeader
              title="Psycholinguistic Readability & Text Complexity Model"
              subtitle="Algorithmic readability scoring via Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog Index, and syllable/akshara distribution."
              action={
                <Badge tone={readability.fleschReadingEase >= 60 ? "emerald" : readability.fleschReadingEase >= 30 ? "amber" : "rose"}>
                  {readability.interpretation.readingDifficulty}
                </Badge>
              }
            />
            <CardBody className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Gauge className="h-3.5 w-3.5 text-indigo-500" />
                    Flesch Reading Ease
                  </div>
                  <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    {readability.fleschReadingEase}
                    <span className="text-xs font-normal text-slate-400"> / 100</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{readability.fleschReadingEaseLabel}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                    Flesch-Kincaid Grade
                  </div>
                  <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    {readability.fleschKincaidGrade}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">School/College level</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <FileText className="h-3.5 w-3.5 text-amber-500" />
                    Gunning Fog Index
                  </div>
                  <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    {readability.gunningFogIndex}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Years of formal education</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Filter className="h-3.5 w-3.5 text-purple-500" />
                    Lexical Density
                  </div>
                  <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    {readability.lexicalDensity}%
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Informational content ratio</div>
                </div>
              </div>

              {/* Progress bar for Flesch ease */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>Readability Scale (0 = Highly Technical, 100 = Very Simple)</span>
                  <span className="font-semibold text-indigo-600">{readability.fleschReadingEase} / 100</span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      readability.fleschReadingEase >= 70
                        ? "bg-emerald-500"
                        : readability.fleschReadingEase >= 50
                        ? "bg-indigo-500"
                        : readability.fleschReadingEase >= 30
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.max(5, Math.min(100, readability.fleschReadingEase))}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                  <div className="text-slate-600">
                    <span className="font-semibold">Target Audience:</span> {readability.interpretation.targetAudience}
                  </div>
                  <div className="text-slate-600">
                    <span className="font-semibold">Avg Sentence:</span> {readability.avgSentenceLength} words
                  </div>
                  <div className="text-slate-600">
                    <span className="font-semibold">Syllables / Word:</span> {readability.avgSyllablesPerWord}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500 italic">
                  {readability.interpretation.summary}
                </p>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

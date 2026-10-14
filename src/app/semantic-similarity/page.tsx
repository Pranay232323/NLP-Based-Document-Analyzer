"use client";

import { useState, useEffect } from "react";
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
import {
  SAMPLE_SIMILARITY_PAIRS,
  computeMultiMetricSimilarity,
  type MultiMetricSimilarityResult,
} from "@/lib/nlp/semanticSimilarity";
import { AlertCircle, Scale, ShieldAlert, Download, FileText, ArrowRightLeft } from "lucide-react";

export default function SemanticSimilarityPage() {
  const { rawText, docName } = useDocument();
  const [textA, setTextA] = useState(SAMPLE_SIMILARITY_PAIRS[0].textA);
  const [textB, setTextB] = useState(SAMPLE_SIMILARITY_PAIRS[0].textB);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MultiMetricSimilarityResult>(() => {
    return computeMultiMetricSimilarity(
      SAMPLE_SIMILARITY_PAIRS[0].textA,
      SAMPLE_SIMILARITY_PAIRS[0].textB
    );
  });

  function runComparison(pA: string, pB: string) {
    if (!pA.trim() || !pB.trim()) {
      setError("Please provide text for both passages before comparing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = computeMultiMetricSimilarity(pA.trim(), pB.trim());
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Comparison failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleSwap() {
    const temp = textA;
    setTextA(textB);
    setTextB(temp);
    runComparison(textB, temp);
  }

  function handleUseActiveDocAsA() {
    if (rawText) {
      const excerpt = rawText.slice(0, 500);
      setTextA(excerpt);
      runComparison(excerpt, textB);
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `semantic-similarity-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const headers = ["Metric", "ScorePercent"];
    const rows = [
      ["CompositeScore", (result.metrics.compositeScore * 100).toFixed(1) + "%"],
      ["SoftSemanticScore", (result.metrics.softSemanticScore * 100).toFixed(1) + "%"],
      ["LexicalCosine", (result.metrics.lexicalCosine * 100).toFixed(1) + "%"],
      ["TokenJaccard", (result.metrics.tokenJaccard * 100).toFixed(1) + "%"],
      ["CharNgramDice", (result.metrics.charNgramDice * 100).toFixed(1) + "%"],
    ];
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `similarity-metrics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const levelTone = !result
    ? "slate"
    : result.interpretation.level === "Identical or Near-Identical"
    ? "rose"
    : result.interpretation.level === "High Semantic Overlap"
    ? "amber"
    : result.interpretation.level === "Moderate Topical Overlap"
    ? "sky"
    : "emerald";

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Advanced NLP Lab · Exp 16"
        title="Multi-Metric Semantic Similarity"
        description="Analyzes text similarity across Lexical (TF-IDF), Syntactic (Token Jaccard), Morphological (Character Tri-grams), and Soft-Lemma Semantic dimensions. Contrasts verbatim word overlap against semantic paraphrasing in English, Hindi, and Marathi."
      />

      {/* SAMPLE SELECTOR & INPUT AREA */}
      <Card>
        <CardHeader
          title="Comparative Text Passages"
          subtitle="Compare any two sentences, paragraphs, or documents across 4 distinct dimensions"
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Multilingual Pairs:</span>
              {SAMPLE_SIMILARITY_PAIRS.map((pair) => (
                <button
                  key={pair.label}
                  type="button"
                  onClick={() => {
                    setTextA(pair.textA);
                    setTextB(pair.textB);
                    runComparison(pair.textA, pair.textB);
                  }}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  {pair.label}
                </button>
              ))}
            </div>

            {rawText && (
              <SecondaryButton onClick={handleUseActiveDocAsA} className="text-xs">
                <FileText size={12} className="mr-1" />
                Set Passage A from Doc ({docName || "Active"})
              </SecondaryButton>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Passage A:</label>
                <span className="text-[11px] text-slate-400">
                  {textA.trim() ? textA.trim().split(/\s+/).length : 0} words · {textA.length} chars
                </span>
              </div>
              <textarea
                rows={5}
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                placeholder="Enter first passage in any language..."
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Passage B:</label>
                <span className="text-[11px] text-slate-400">
                  {textB.trim() ? textB.trim().split(/\s+/).length : 0} words · {textB.length} chars
                </span>
              </div>
              <textarea
                rows={5}
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                placeholder="Enter second passage in any language..."
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <PrimaryButton onClick={() => runComparison(textA, textB)} disabled={loading}>
              {loading ? <Spinner size={14} /> : "Compute Multi-Metric Similarity"}
            </PrimaryButton>
            <SecondaryButton onClick={handleSwap}>
              <ArrowRightLeft size={13} className="mr-1" />
              Swap Passages
            </SecondaryButton>
          </div>
        </CardBody>
      </Card>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Composite Similarity"
          value={`${(result.metrics.compositeScore * 100).toFixed(1)}%`}
          tone={levelTone}
        />
        <StatCard
          label="Soft-Semantic Alignment"
          value={`${(result.metrics.softSemanticScore * 100).toFixed(1)}%`}
          tone="indigo"
        />
        <StatCard
          label="Lexical TF-IDF Cosine"
          value={`${(result.metrics.lexicalCosine * 100).toFixed(1)}%`}
          tone="violet"
        />
        <StatCard
          label="Token Jaccard (IOU)"
          value={`${(result.metrics.tokenJaccard * 100).toFixed(1)}%`}
          tone="sky"
        />
      </div>

      {/* DETAILED SIMILARITY BREAKDOWN */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* METRICS COMPARISON BARS */}
        <Card>
          <CardHeader
            title="Dimensional Similarity Spectrum"
            subtitle="Comparing structural, lexical, and semantic measures"
            action={<Badge tone={levelTone}>{result.interpretation.level}</Badge>}
          />
          <CardBody className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="font-medium text-slate-800">Soft-Lemma Semantic Score</span>
                  <span>{(result.metrics.softSemanticScore * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                  <div
                    style={{ width: `${result.metrics.softSemanticScore * 100}%` }}
                    className="h-2 rounded-full bg-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="font-medium text-slate-800">Lexical Cosine (Vector Space)</span>
                  <span>{(result.metrics.lexicalCosine * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                  <div
                    style={{ width: `${result.metrics.lexicalCosine * 100}%` }}
                    className="h-2 rounded-full bg-violet-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="font-medium text-slate-800">Character Tri-gram Dice (Morphology)</span>
                  <span>{(result.metrics.charNgramDice * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                  <div
                    style={{ width: `${result.metrics.charNgramDice * 100}%` }}
                    className="h-2 rounded-full bg-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="font-medium text-slate-800">Token Jaccard (Set IOU)</span>
                  <span>{(result.metrics.tokenJaccard * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                  <div
                    style={{ width: `${result.metrics.tokenJaccard * 100}%` }}
                    className="h-2 rounded-full bg-sky-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
              <span className="font-semibold text-slate-900">Interpretation Insight: </span>
              {result.interpretation.lexicalVsSemanticInsight}
            </div>
          </CardBody>
        </Card>

        {/* TOKEN ALIGNMENT TABLE */}
        <Card>
          <CardHeader
            title="Cross-Passage Token Alignment"
            subtitle="Matching words across Passages A and B"
          />
          <CardBody className="overflow-x-auto">
            {result.tokenAlignments.length > 0 ? (
              <table className="w-full min-w-[320px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-2">Token in A</th>
                    <th className="py-2 pr-2">Matched in B</th>
                    <th className="py-2 pr-2">Match Nature</th>
                    <th className="py-2 pr-2">Alignment</th>
                  </tr>
                </thead>
                <tbody>
                  {result.tokenAlignments.map((align, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-2 pr-2 font-medium text-slate-800">{align.tokenA}</td>
                      <td className="py-2 pr-2 text-slate-600">{align.matchedTokenB || "—"}</td>
                      <td className="py-2 pr-2">
                        <Badge
                          tone={
                            align.matchType === "Exact"
                              ? "emerald"
                              : align.matchType === "Lemma Match"
                              ? "indigo"
                              : align.matchType === "Sub-word / Fuzzy"
                              ? "amber"
                              : "slate"
                          }
                        >
                          {align.matchType}
                        </Badge>
                      </td>
                      <td className="py-2 pr-2 font-mono text-slate-500">
                        {(align.score * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-400 italic">No significant tokens detected to align.</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* ACADEMIC PLAGIARISM DISCLAIMER */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">Academic Integrity Notice on Similarity Scores</p>
          <p className="mt-1 leading-relaxed text-amber-800">
            {result.interpretation.plagiarismDisclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

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
import {
  SAMPLE_SIMILARITY_PAIRS,
  computeMultiMetricSimilarity,
  type MultiMetricSimilarityResult,
} from "@/lib/nlp/semanticSimilarity";
import {
  solveVectorAnalogy,
  computePCAProjection2D,
  KNOWN_VOCABULARY,
  type VectorAnalogyResult,
  type WordEmbeddingPoint2D,
} from "@/lib/nlp/embeddings";
import { getExperimentPedagogy } from "@/lib/nlp/pedagogy";
import { PedagogyPanel, LinguisticPresetsBar } from "@/components/ui/pedagogy-panel";
import { AlertCircle, Scale, ShieldAlert, Download, FileText, ArrowRightLeft, Compass, Sparkles, Orbit, Calculator } from "lucide-react";

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

  // Dense Word Embeddings & Vector Space State
  const [analogyWordA, setAnalogyWordA] = useState("king");
  const [analogyWordB, setAnalogyWordB] = useState("man");
  const [analogyWordC, setAnalogyWordC] = useState("woman");

  const analogyResult: VectorAnalogyResult = useMemo(() => {
    return solveVectorAnalogy(analogyWordA, analogyWordB, analogyWordC);
  }, [analogyWordA, analogyWordB, analogyWordC]);

  const pcaPoints: WordEmbeddingPoint2D[] = useMemo(() => {
    return computePCAProjection2D();
  }, []);

  const pedagogy = useMemo(() => getExperimentPedagogy("semantic-similarity"), []);

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

      {pedagogy?.linguisticPresets && (
        <LinguisticPresetsBar
          presets={pedagogy.linguisticPresets}
          onSelect={(presetText) => {
            setTextA(presetText);
            runComparison(presetText, textB);
          }}
        />
      )}

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

      {/* Model: Dense Word Embeddings & Vector Space Lab */}
      <Card>
        <CardHeader
          title="Dense Word Embeddings & Vector Space Model (Word2Vec / GloVe)"
          subtitle="Distributed representations of words in continuous vector space. Demonstrates linear vector compositionality (vec(A) - vec(B) + vec(C) ≈ vec(D)) and 2D PCA cluster projections."
          action={
            <Badge tone="indigo">
              Dense Vector Space
            </Badge>
          }
        />
        <CardBody className="space-y-6">
          {/* Sub-section 1: Vector Analogy Solver */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-indigo-600" />
                Semantic Vector Algebra &amp; Analogy Solver
              </span>
              <span className="text-[11px] font-mono text-indigo-600">vec(A) - vec(B) + vec(C) ≈ vec(?)</span>
            </div>

            {/* Analogy Inputs */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                value={analogyWordA}
                onChange={(e) => setAnalogyWordA(e.target.value.toLowerCase())}
                placeholder="Word A (e.g. king)"
                className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-800 outline-none focus:border-indigo-500"
              />
              <span className="font-bold text-slate-400">−</span>
              <input
                type="text"
                value={analogyWordB}
                onChange={(e) => setAnalogyWordB(e.target.value.toLowerCase())}
                placeholder="Word B (e.g. man)"
                className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-800 outline-none focus:border-indigo-500"
              />
              <span className="font-bold text-slate-400">+</span>
              <input
                type="text"
                value={analogyWordC}
                onChange={(e) => setAnalogyWordC(e.target.value.toLowerCase())}
                placeholder="Word C (e.g. woman)"
                className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-800 outline-none focus:border-indigo-500"
              />
              <span className="font-bold text-indigo-600">=</span>

              <div className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-white font-bold shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{analogyResult.bestMatch}</span>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Analogy Presets:</span>
              {[
                { label: "king − man + woman", a: "king", b: "man", c: "woman" },
                { label: "software − computer + biology", a: "software", b: "computer", c: "biology" },
                { label: "parliament − government + sports", a: "parliament", b: "government", c: "sports" },
                { label: "वैज्ञानिक − science + खेल", a: "वैज्ञानिक", b: "science", c: "खेळ" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setAnalogyWordA(preset.a);
                    setAnalogyWordB(preset.b);
                    setAnalogyWordC(preset.c);
                  }}
                  className="rounded border border-indigo-200 bg-white px-2 py-0.5 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Top Candidates list */}
            <div className="rounded-lg bg-white p-3 border border-indigo-100 space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Top Nearest Neighbor Predictions:
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {analogyResult.topCandidates.map((cand, idx) => (
                  <div key={cand.word} className="rounded border border-slate-100 p-2 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-900 font-bold">#{idx + 1} {cand.word}</span>
                      <span className="text-indigo-600 font-mono">{(cand.similarity * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.max(5, Math.min(100, cand.similarity * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-section 2: 2D Principal Component Analysis (PCA) Scatter Plot */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Orbit className="h-4 w-4 text-purple-600" />
                2D PCA Dimensionality Reduction Projection
              </span>
              {/* Cluster Legend */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-600" /> Tech</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Science</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-600" /> Politics</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-600" /> Sports</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-600" /> Indic</span>
              </div>
            </div>

            {/* Interactive 2D Coordinate Grid */}
            <div className="relative h-72 w-full rounded-xl border border-slate-200 bg-slate-950 p-4 overflow-hidden">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-full w-[1px] bg-slate-800" />
                <div className="absolute w-full h-[1px] bg-slate-800" />
              </div>
              <span className="absolute top-2 left-2 text-[10px] text-slate-500 font-mono">PC2 (Component 2) ↑</span>
              <span className="absolute bottom-2 right-2 text-[10px] text-slate-500 font-mono">PC1 (Component 1) →</span>

              {/* Data Points */}
              {pcaPoints.map((pt) => {
                // Map x, y from [-1, 1] to [8%, 92%]
                const leftPercent = 50 + pt.x * 42;
                const topPercent = 50 - pt.y * 42;

                const colorClass =
                  pt.cluster === "Tech"
                    ? "bg-indigo-500/80 text-indigo-200 border-indigo-400"
                    : pt.cluster === "Science"
                    ? "bg-emerald-500/80 text-emerald-200 border-emerald-400"
                    : pt.cluster === "Politics"
                    ? "bg-amber-500/80 text-amber-200 border-amber-400"
                    : pt.cluster === "Sports"
                    ? "bg-rose-500/80 text-rose-200 border-rose-400"
                    : pt.cluster === "Indic"
                    ? "bg-purple-500/80 text-purple-200 border-purple-400"
                    : "bg-sky-500/80 text-sky-200 border-sky-400";

                return (
                  <div
                    key={pt.word}
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300 hover:scale-125 hover:z-20"
                  >
                    <div className="flex items-center gap-1">
                      <div className={`h-2.5 w-2.5 rounded-full border ${colorClass}`} />
                      <span className="rounded bg-slate-900/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-200 shadow-sm border border-slate-700/50">
                        {pt.word}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500">
              *Visualizes continuous 8-dimensional semantic embedding vectors projected onto the 2 maximal principal components. Notice how domain-specific concepts naturally cluster together without manual tagging.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Student Learning, Viva Voce & Lab Manual Hub */}
      {pedagogy && (
        <PedagogyPanel
          pedagogy={pedagogy}
          onApplyPreset={(presetText) => {
            setTextA(presetText);
            runComparison(presetText, textB);
          }}
        />
      )}

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

"use client";

import { useState } from "react";
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
import { useEffect } from "react";
import {
  SAMPLE_SIMILARITY_PAIRS,
  type MultiMetricSimilarityResult,
} from "@/lib/nlp/semanticSimilarity";
import { AlertCircle, Scale, ShieldAlert } from "lucide-react";

export default function SemanticSimilarityPage() {
  const [textA, setTextA] = useState(SAMPLE_SIMILARITY_PAIRS[0].textA);
  const [textB, setTextB] = useState(SAMPLE_SIMILARITY_PAIRS[0].textB);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MultiMetricSimilarityResult | null>(null);

  async function runComparison(pA: string, pB: string) {
    if (!pA.trim() || !pB.trim()) {
      setError("Please provide text for both passages before comparing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/semantic-similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textA: pA, textB: pB }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Comparison failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runComparison(SAMPLE_SIMILARITY_PAIRS[0].textA, SAMPLE_SIMILARITY_PAIRS[0].textB);
  }, []);

  function handleCompare() {
    runComparison(textA, textB);
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
        eyebrow="Advanced NLP Lab"
        title="Multi-Metric Semantic Similarity"
        description="Analyzes text similarity across Lexical (TF-IDF), Syntactic (Token Jaccard), Morphological (Character Tri-grams), and Soft-Lemma Semantic dimensions. Contrasts verbatim word overlap against semantic paraphrasing."
      />

      {/* SAMPLE SELECTOR & INPUT AREA */}
      <Card>
        <CardHeader
          title="Comparative Text Passages"
          subtitle="Compare two sentences or paragraphs across multiple similarity dimensions"
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Sample Pairs:</span>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Passage A:</label>
              <textarea
                rows={4}
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                placeholder="Enter first passage..."
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Passage B:</label>
              <textarea
                rows={4}
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                placeholder="Enter second passage..."
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
            <PrimaryButton onClick={handleCompare} disabled={loading}>
              {loading ? <Spinner size={14} /> : "Compute Multi-Metric Similarity"}
            </PrimaryButton>
          </div>
        </CardBody>
      </Card>

      {/* METRIC OVERVIEW CARDS */}
      {result ? (
        <>
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
                    className="h-2 rounded-full bg-indigo-600"
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
                    className="h-2 rounded-full bg-violet-600"
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
                    className="h-2 rounded-full bg-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="font-medium text-slate-800">Token Jaccard (Set Overlap)</span>
                  <span>{(result.metrics.tokenJaccard * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                  <div
                    style={{ width: `${result.metrics.tokenJaccard * 100}%` }}
                    className="h-2 rounded-full bg-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-800">Lexical vs. Semantic Insight: </span>
              {result.interpretation.lexicalVsSemanticInsight}
            </div>
          </CardBody>
        </Card>

        {/* TOKEN ALIGNMENT TABLE */}
        <Card>
          <CardHeader
            title="Token-Level Semantic Alignment"
            subtitle="How tokens in Passage A map to corresponding tokens in Passage B"
            action={
              <Badge tone="slate">
                {result.tokenAlignments.length} Tokens Analyzed
              </Badge>
            }
          />
          <CardBody className="overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3">Token in A</th>
                  <th className="py-2 pr-3">Mapped in B</th>
                  <th className="py-2 pr-3">Match Type</th>
                  <th className="py-2 pr-3">Weight</th>
                </tr>
              </thead>
              <tbody>
                {result.tokenAlignments.map((align, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-semibold text-slate-800">{align.tokenA}</td>
                    <td className="py-2 pr-3 text-slate-600">
                      {align.matchedTokenB || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-2 pr-3">
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
                    <td className="py-2 pr-3 font-mono text-slate-500">{align.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

          {/* ACADEMIC PLAGIARISM DISCLAIMER */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">Academic Integrity & Plagiarism Disclaimer:</p>
              <p className="leading-relaxed text-amber-800">
                {result.interpretation.plagiarismDisclaimer} Standard textbook formulas, definitions, author citations,
                and shared academic nomenclature naturally generate high token overlap without implying academic dishonesty.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}


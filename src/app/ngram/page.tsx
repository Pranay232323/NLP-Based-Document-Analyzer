"use client";

import { useState } from "react";
import { useDocument } from "@/components/document-context";
import { Card, CardBody, CardHeader, SectionHeading, Badge, PrimaryButton, SecondaryButton, Spinner, StatCard } from "@/components/ui/primitives";
import { ExperimentPlayground } from "@/components/experiment-playground";
import type { NGramGeneration, NGramPrediction } from "@/lib/nlp/types";
import { Sparkles, ArrowRight, Wand2, Search } from "lucide-react";

export default function NGramPage() {
  const { analysis, rawText, loading: docLoading } = useDocument();
  const [n, setN] = useState<number>(2);
  const [context, setContext] = useState("natural");
  const [seed, setSeed] = useState("natural");
  const [length, setLength] = useState(10);
  const [prediction, setPrediction] = useState<NGramPrediction | null>(null);
  const [generation, setGeneration] = useState<NGramGeneration | null>(null);
  const [loading, setLoading] = useState<"predict" | "generate" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function callApi(action: "predict" | "generate") {
    if (!rawText.trim()) {
      setError("Please ensure training text is loaded in the playground above.");
      return;
    }
    setLoading(action);
    setError(null);
    try {
      const res = await fetch("/api/ngram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, n, action, context, seed, length }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (action === "predict") setPrediction(data.prediction);
      else setGeneration(data.generation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "N-Gram computation failed.");
    } finally {
      setLoading(null);
    }
  }

  const ngramSummaries = analysis?.ngramSummaries ?? [];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Practical 5 · Core NLP"
        title="N-Gram Language Model: Prediction & Text Generation"
        description="Build genuine statistical N-Gram language models (Unigram, Bigram, Trigram) using Maximum Likelihood Estimation with Stupid Backoff. Predict the next token and generate continuous text from a seed phrase."
      />

      <ExperimentPlayground moduleTitle="N-Gram Lab" />

      {docLoading && !analysis && (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
          <span className="ml-2 text-sm text-slate-500">Compiling N-Gram models...</span>
        </div>
      )}

      {analysis && (
        <>
          {/* N-Gram Summary Cards */}
          <div className="grid gap-4 lg:grid-cols-3">
            {ngramSummaries.map((s) => (
              <Card key={s.n} className={n === s.n ? "ring-2 ring-indigo-500/80" : ""}>
                <CardHeader
                  title={`${s.label} Model (N=${s.n})`}
                  action={
                    <button
                      onClick={() => setN(s.n)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                        n === s.n ? "bg-indigo-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {n === s.n ? "Active" : "Select"}
                    </button>
                  }
                />
                <CardBody className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <p className="text-slate-500 uppercase tracking-wide text-[10px]">Total N-Grams</p>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">{s.totalNGrams.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <p className="text-slate-500 uppercase tracking-wide text-[10px]">Unique Vocabulary</p>
                      <p className="text-lg font-bold text-indigo-700 mt-0.5">{s.uniqueNGrams.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Top Salient N-Grams:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.topNGrams.slice(0, 5).map((g) => (
                        <span
                          key={g.ngram}
                          className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 font-mono"
                        >
                          <span>{g.ngram}</span>
                          <span className="text-[10px] text-slate-400 font-bold">({g.count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Interactive Next-Word Predictor */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="1. Next-Word Prediction (Conditional Probability)"
                subtitle="Computes P(w_n | w_1...w_{n-1}) with Backoff smoothing"
              />
              <CardBody className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Context Prefix ({n === 1 ? "Ignored in Unigram" : n === 2 ? "1 word required" : "1 or 2 words"}):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && callApi("predict")}
                      placeholder='e.g. "natural" or "machine"'
                      className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                    />
                    <PrimaryButton onClick={() => callApi("predict")} disabled={loading === "predict"}>
                      {loading === "predict" ? <Spinner /> : <Search className="h-3.5 w-3.5 inline mr-1" />} Predict
                    </PrimaryButton>
                  </div>
                </div>

                {prediction && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Context: <code className="text-indigo-700">&quot;{prediction.context}&quot;</code>
                      </span>
                      <Badge tone={prediction.found ? "emerald" : "amber"}>
                        {prediction.found ? `Found via N=${prediction.backoffN ?? prediction.n}` : "Backoff / Fallback"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Candidate Next Words by Probability:
                      </p>
                      {prediction.predictions.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No continuation candidates found in corpus.</p>
                      ) : (
                        prediction.predictions.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-white rounded-lg p-2 border border-slate-100">
                            <span className="font-semibold text-slate-900 font-mono text-sm">{p.word}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500">{p.count}× occurrences</span>
                              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                {(p.probability * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Interactive Statistical Text Generator */}
            <Card>
              <CardHeader
                title="2. Statistical Text Generation"
                subtitle="Generates token sequences by sampling from the Markov chain"
              />
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Seed Phrase / Word:</label>
                    <input
                      type="text"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder='e.g. "natural"'
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Tokens to Generate:</label>
                    <input
                      type="number"
                      min={3}
                      max={40}
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <PrimaryButton onClick={() => callApi("generate")} disabled={loading === "generate"} className="w-full">
                  {loading === "generate" ? <Spinner /> : <Wand2 className="h-3.5 w-3.5 inline mr-1" />} Generate Sentence
                </PrimaryButton>

                {generation && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-950">Generated Sequence (N={n}):</span>
                      <span className="text-[11px] text-slate-500">{generation.steps.length} tokens generated</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed bg-white rounded-lg p-3 border border-indigo-100/60 shadow-2xs">
                      &quot;{generation.generated}&quot;
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-rose-100">{error}</p>}
        </>
      )}
    </div>
  );
}

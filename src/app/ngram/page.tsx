"use client";

import { useState } from "react";
import { useDocument } from "@/components/document-context";
import { NoDocumentState } from "@/components/no-document-state";
import { Card, CardBody, CardHeader, SectionHeading, Badge, PrimaryButton, SecondaryButton, Spinner } from "@/components/ui/primitives";
import type { NGramGeneration, NGramPrediction } from "@/lib/nlp/types";

export default function NGramPage() {
  const { analysis, rawText } = useDocument();
  const [n, setN] = useState(2);
  const [context, setContext] = useState("");
  const [seed, setSeed] = useState("");
  const [length, setLength] = useState(8);
  const [prediction, setPrediction] = useState<NGramPrediction | null>(null);
  const [generation, setGeneration] = useState<NGramGeneration | null>(null);
  const [loading, setLoading] = useState<"predict" | "generate" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function callApi(action: "predict" | "generate") {
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
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(null);
    }
  }

  if (!analysis) {
    return (
      <div className="space-y-6">
        <SectionHeading eyebrow="NLP Tool" title="N-Gram Lab" description="Build real unigram/bigram/trigram models and predict the next word." />
        <NoDocumentState moduleName="the N-Gram Lab" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="NLP Tool"
        title="N-Gram Model: Prediction & Text Generation"
        description="A genuine statistical N-Gram language model built directly from your document's word sequence (no external LLM). Choose N, then predict the next word or generate text from a seed phrase."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {analysis.ngramSummaries.map((s) => (
          <Card key={s.n}>
            <CardHeader title={`${s.label} Model (N=${s.n})`} />
            <CardBody>
              <p className="text-sm text-slate-600">
                Total N-Grams: <strong>{s.totalNGrams}</strong> · Unique: <strong>{s.uniqueNGrams}</strong>
              </p>
              <div className="mt-3 space-y-1">
                {s.topNGrams.slice(0, 5).map((e) => (
                  <div key={e.ngram} className="flex items-center justify-between text-xs">
                    <span className="truncate text-slate-700">{e.ngram}</span>
                    <Badge tone="indigo">{e.count}</Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="N-Gram Settings" />
        <CardBody>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-600">N value:</span>
            {[1, 2, 3].map((v) => (
              <button
                key={v}
                onClick={() => setN(v)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  n === v ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {v === 1 ? "Unigram (1)" : v === 2 ? "Bigram (2)" : "Trigram (3)"}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Next-Word Prediction" subtitle='Example: context "machine learning" → predicted next word' />
          <CardBody className="space-y-3">
            <input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={n === 1 ? "Context not required for unigram" : "e.g. machine learning"}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <PrimaryButton onClick={() => callApi("predict")} disabled={loading === "predict"}>
              {loading === "predict" && <Spinner />} Predict Next Word
            </PrimaryButton>

            {prediction && (
              <div className="rounded-xl border border-slate-200 p-4">
                {prediction.found ? (
                  <>
                    <p className="text-xs text-slate-500">
                      Context used: <strong>&ldquo;{prediction.context || "(none)"}&rdquo;</strong>
                      {prediction.usedBackoff && (
                        <span className="ml-2 text-amber-600">(backed off to N={prediction.backoffN})</span>
                      )}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      Top prediction: <span className="text-indigo-600">{prediction.predictions[0]?.word}</span>
                    </p>
                    <div className="mt-3 space-y-1.5">
                      {prediction.predictions.map((p) => (
                        <div key={p.word} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700">{p.word}</span>
                          <span className="text-slate-400">
                            count {p.count} · p={p.probability}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-rose-600">No continuation found for this context in the document corpus.</p>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Text Generation" subtitle="Generate text forward from a seed phrase" />
          <CardBody className="space-y-3">
            <input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="e.g. artificial intelligence"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">Words to generate:</label>
              <input
                type="number"
                min={1}
                max={40}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
              <SecondaryButton onClick={() => callApi("generate")} disabled={loading === "generate"}>
                {loading === "generate" && <Spinner />} Generate
              </SecondaryButton>
            </div>
            {generation && (
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm leading-relaxed text-slate-800">{generation.generated}</p>
                <p className="mt-2 text-xs text-slate-400">{generation.steps.length} word(s) generated from the N-Gram model.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-rose-100">{error}</p>}
    </div>
  );
}

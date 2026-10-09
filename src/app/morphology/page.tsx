"use client";

import { useState } from "react";
import { useDocument } from "@/components/document-context";
import { NoDocumentState } from "@/components/no-document-state";
import { Card, CardBody, CardHeader, SectionHeading, Badge, PrimaryButton, Spinner } from "@/components/ui/primitives";
import type { MorphologyBreakdown, WordGeneration } from "@/lib/nlp/types";

function BreakdownRow({ m }: { m: MorphologyBreakdown }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-2 pr-4 font-medium text-slate-800">{m.word}</td>
      <td className="py-2 pr-4">{m.prefix ? <Badge tone="violet">{m.prefix}</Badge> : <span className="text-slate-400">none</span>}</td>
      <td className="py-2 pr-4 font-semibold text-indigo-700">{m.root}</td>
      <td className="py-2 pr-4">{m.suffix ? <Badge tone="amber">{m.suffix}</Badge> : <span className="text-slate-400">none</span>}</td>
    </tr>
  );
}

export default function MorphologyPage() {
  const { analysis } = useDocument();
  const [word, setWord] = useState("unhappy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ breakdown: MorphologyBreakdown; generation: WordGeneration } | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/morphology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
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

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="NLP Tool"
        title="Morphological Analysis & Word Generation"
        description="Rule-based decomposition of a word into Prefix + Root + Suffix, plus suffix-based generation of possible word variants. Results are rule-based approximations, not dictionary-validated."
      />

      <Card>
        <CardHeader title="Try a Word" subtitle='e.g. "unhappy", "worked", "carefully", "playing"' />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              className="w-56 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Enter a word"
            />
            <PrimaryButton onClick={handleAnalyze} disabled={loading}>
              {loading && <Spinner />} Analyze
            </PrimaryButton>
          </div>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-rose-100">{error}</p>}

          {result && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Structural Breakdown</p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge tone="violet">Prefix: {result.breakdown.prefix ?? "none"}</Badge>
                  <Badge tone="indigo">Root: {result.breakdown.root}</Badge>
                  <Badge tone="amber">Suffix: {result.breakdown.suffix ?? "none"}</Badge>
                </div>
                <p className="mt-3 text-xs text-slate-500">{result.breakdown.notes}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rule-Based Possible Variants
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.generation.variants.map((v) => (
                    <Badge key={v} tone="emerald">
                      {v}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Generated using suffixation rules. Not every variant is guaranteed to be a linguistically valid English word.
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {!analysis && <NoDocumentState moduleName="document-wide morphology analysis" />}

      {analysis && (
        <Card>
          <CardHeader title="Document Keyword Morphology" subtitle="Automatic breakdown of the most frequent meaningful words in your document" />
          <CardBody className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4">Word</th>
                  <th className="py-2 pr-4">Prefix</th>
                  <th className="py-2 pr-4">Root</th>
                  <th className="py-2 pr-4">Suffix</th>
                </tr>
              </thead>
              <tbody>
                {analysis.morphology.map((m) => (
                  <BreakdownRow key={m.word} m={m} />
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

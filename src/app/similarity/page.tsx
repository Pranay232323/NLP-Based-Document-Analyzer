"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, SectionHeading, Badge, PrimaryButton, SecondaryButton, Spinner } from "@/components/ui/primitives";
import { SAMPLE_DOC_A, SAMPLE_DOC_A_NAME, SAMPLE_DOC_B, SAMPLE_DOC_B_NAME } from "@/lib/nlp/sampleData";
import type { SimilarityResult } from "@/lib/nlp/types";

const LEVEL_TONE = {
  "Highly Similar": "rose",
  "Moderately Similar": "amber",
  "Slightly Similar": "sky",
  "Not Similar": "emerald",
} as const;

export default function SimilarityPage() {
  const [docAName, setDocAName] = useState("Document A");
  const [docBName, setDocBName] = useState("Document B");
  const [docAText, setDocAText] = useState("");
  const [docBText, setDocBText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimilarityResult | null>(null);

  function loadSamples() {
    setDocAName(SAMPLE_DOC_A_NAME);
    setDocBName(SAMPLE_DOC_B_NAME);
    setDocAText(SAMPLE_DOC_A);
    setDocBText(SAMPLE_DOC_B);
  }

  async function handleCompare() {
    setError(null);
    if (!docAText.trim() || !docBText.trim()) {
      setError("Please provide text for both documents before comparing.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docAText, docBText, docAName, docBName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="NLP Tool"
        title="Academic Text Similarity Analyzer"
        description="Computes TF-IDF vectors for two documents and measures their Cosine Similarity. This indicates textual similarity only and should NOT, by itself, be treated as proof of plagiarism."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Document A"
            action={
              <input value={docAName} onChange={(e) => setDocAName(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs" />
            }
          />
          <CardBody>
            <textarea
              value={docAText}
              onChange={(e) => setDocAText(e.target.value)}
              rows={9}
              placeholder="Paste the first document..."
              className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Document B"
            action={
              <input value={docBName} onChange={(e) => setDocBName(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs" />
            }
          />
          <CardBody>
            <textarea
              value={docBText}
              onChange={(e) => setDocBText(e.target.value)}
              rows={9}
              placeholder="Paste the second document..."
              className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={handleCompare} disabled={loading}>
          {loading && <Spinner />} Compare Documents
        </PrimaryButton>
        <SecondaryButton onClick={loadSamples}>Load Sample Document Pair</SecondaryButton>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-rose-100">{error}</p>}

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Similarity Result" />
            <CardBody>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Cosine Similarity Score</p>
                  <p className="text-3xl font-bold text-slate-900">{result.cosineSimilarity}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Similarity Percentage</p>
                  <p className="text-3xl font-bold text-slate-900">{result.similarityPercentage}%</p>
                </div>
                <Badge tone={LEVEL_TONE[result.similarityLevel]} className="text-sm">
                  {result.similarityLevel}
                </Badge>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                  style={{ width: `${result.similarityPercentage}%` }}
                />
              </div>
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">
                ⚠ Similarity score indicates textual similarity and should not by itself be treated as proof of plagiarism.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Common High-Weight Terms" subtitle="Terms appearing in both documents, weighted by TF-IDF" />
            <CardBody className="overflow-x-auto">
              {result.commonTerms.length === 0 ? (
                <p className="text-sm text-slate-400">No significant shared terms found.</p>
              ) : (
                <table className="w-full min-w-[360px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-4">Term</th>
                      <th className="py-2 pr-4">Weight in A</th>
                      <th className="py-2 pr-4">Weight in B</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.commonTerms.map((t) => (
                      <tr key={t.term} className="border-b border-slate-100">
                        <td className="py-2 pr-4 font-medium text-slate-800">{t.term}</td>
                        <td className="py-2 pr-4 text-slate-600">{t.weightA}</td>
                        <td className="py-2 pr-4 text-slate-600">{t.weightB}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title={`Top Keywords - ${result.docAName}`} />
              <CardBody>
                <div className="flex flex-wrap gap-1.5">
                  {result.topTermsA.map((t) => (
                    <Badge key={t.term} tone="indigo">
                      {t.term} ({t.weight})
                    </Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title={`Top Keywords - ${result.docBName}`} />
              <CardBody>
                <div className="flex flex-wrap gap-1.5">
                  {result.topTermsB.map((t) => (
                    <Badge key={t.term} tone="violet">
                      {t.term} ({t.weight})
                    </Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

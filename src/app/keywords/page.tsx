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
import type { KeywordExtractionComparison } from "@/lib/nlp/keywords";
import { AlertCircle, HelpCircle } from "lucide-react";

const SAMPLE_TEXT = `Natural language processing is an interdisciplinary subfield of computer science and artificial intelligence. It is primarily concerned with the interactions between computers and human language, in particular how to program computers to process and analyze large amounts of natural language data. The goal is a computer capable of understanding the contents of documents, including the contextual nuances of the language within them. The technology can then accurately extract information and insights contained in the documents as well as categorize and organize the documents themselves. Challenges in natural language processing frequently involve speech recognition, natural-language understanding, and natural-language generation.`;

export default function KeywordsPage() {
  const { analysis, docName } = useDocument();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<KeywordExtractionComparison | null>(analysis?.keywordComparison ?? null);

  async function runExtract(textToExtract: string) {
    if (!textToExtract.trim()) {
      setError("Please paste text or load a document to extract keywords.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToExtract }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Keyword extraction failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!result) {
      runExtract(analysis?.rawText || SAMPLE_TEXT);
    }
  }, []);

  function handleUseActiveDoc() {
    if (analysis?.rawText) {
      setInputText(analysis.rawText);
      runExtract(analysis.rawText);
    }
  }

  function handleExtract() {
    const textToUse = inputText.trim() || analysis?.rawText || SAMPLE_TEXT;
    runExtract(textToUse);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Advanced NLP Lab"
        title="Keyword & Keyphrase Extraction"
        description="Performs multi-algorithm comparative keyword extraction: Raw Term Frequency, Sentence-level TF-IDF, RAKE (Rapid Automatic Keyword Extraction), and Grammatical Noun Phrases."
      />

      {/* INPUT AREA */}
      <Card>
        <CardHeader
          title="Input Document"
          subtitle="Extract and contrast keywords from your text"
          action={
            analysis ? (
              <SecondaryButton onClick={handleUseActiveDoc} className="text-xs">
                Load Active Document ({docName})
              </SecondaryButton>
            ) : null
          }
        />
        <CardBody className="space-y-4">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste document text (or leave blank to use the active document)..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <PrimaryButton onClick={handleExtract} disabled={loading}>
              {loading ? <Spinner size={14} /> : "Extract & Compare Keywords"}
            </PrimaryButton>
            <SecondaryButton
              onClick={() => {
                setInputText(SAMPLE_TEXT);
                runExtract(SAMPLE_TEXT);
              }}
            >
              Load Sample Text
            </SecondaryButton>
          </div>
        </CardBody>
      </Card>

      {/* METRICS SUMMARY */}
      {result && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

        <StatCard label="Analyzed Words" value={result.wordCount} />
        <StatCard label="RAKE Phrases Extracted" value={result.rake.length} tone="indigo" />
        <StatCard label="TF-IDF Keywords" value={result.tfidf.length} tone="violet" />
        <StatCard
          label="Algorithm Agreement"
          value={`${result.agreementScore}%`}
          tone="emerald"
        />
      </div>

      {/* COMPARATIVE 4-COLUMN GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* RAKE */}
        <Card className="p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">RAKE Algorithm</h3>
            <Badge tone="indigo">Graph Co-occurrence</Badge>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">deg(w)/freq(w) co-occurrence score</p>
          <div className="mt-3 space-y-1.5">
            {result.rake.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="truncate font-medium text-slate-800">{item.phrase}</span>
                <span className="font-mono text-slate-500">{item.score}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* TF-IDF */}
        <Card className="p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Sentence TF-IDF</h3>
            <Badge tone="violet">Discriminative</Badge>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">TF * log(N/DF) across sentences</p>
          <div className="mt-3 space-y-1.5">
            {result.tfidf.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="truncate font-medium text-slate-800">{item.phrase}</span>
                <span className="font-mono text-slate-500">{item.score}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* NOUN PHRASES */}
        <Card className="p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Noun Phrases</h3>
            <Badge tone="sky">Grammar / POS</Badge>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">&lt;JJ&gt;* &lt;NN+&gt; chunk matches</p>
          <div className="mt-3 space-y-1.5">
            {result.nounPhrases.length > 0 ? (
              result.nounPhrases.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="truncate font-medium text-slate-800">{item.phrase}</span>
                  <span className="font-mono text-slate-500">{item.score}x</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No multi-word noun phrases detected.</p>
            )}
          </div>
        </Card>

        {/* TERM FREQUENCY */}
        <Card className="p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Term Frequency</h3>
            <Badge tone="slate">Raw Count</Badge>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Filtered non-stopword occurrence</p>
          <div className="mt-3 space-y-1.5">
            {result.termFrequency.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="truncate font-medium text-slate-800">{item.phrase}</span>
                <span className="font-mono text-slate-500">{item.score}x</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* EDUCATIONAL EXPLANATIONS */}
      <Card>
        <CardHeader
          title="Algorithm Comparison & Theory"
          subtitle="Why different NLP algorithms return distinct keywords"
        />
        <CardBody className="space-y-3 text-xs text-slate-600">
          <div className="rounded-lg bg-slate-50 p-3 leading-relaxed">
            <span className="font-semibold text-slate-800">Core Comparative Insight: </span>
            {result.explanation.comparisonRationale}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-100 p-3">
              <span className="font-semibold text-indigo-700">RAKE Methodology: </span>
              {result.explanation.rakeExplanation}
            </div>
            <div className="rounded-lg border border-slate-100 p-3">
              <span className="font-semibold text-violet-700">TF-IDF Methodology: </span>
              {result.explanation.tfidfExplanation}
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  )}
</div>

  );
}


"use client";

import Link from "next/link";
import { useDocument } from "@/components/document-context";
import { Card, CardBody, CardHeader, SectionHeading, StatCard, Badge, Spinner } from "@/components/ui/primitives";
import { ExperimentPlayground } from "@/components/experiment-playground";
import { CheckCircle2, ArrowRight, Sparkles, Brain, Globe, MessageSquare, Target } from "lucide-react";

const PIPELINE_STAGES = [
  "Raw Text Ingestion",
  "Sentence Splitting",
  "Tokenization",
  "Stopword Filtration",
  "Script Validation",
  "Stemming (Porter/Indic)",
  "Lemmatization (WordNet/Indic)",
  "POS Tagging (Penn Treebank)",
  "Shallow Parsing (Chunking)",
  "Named Entity Recognition",
  "N-Gram Language Models",
  "Keyword Extraction (TF-IDF / RAKE)",
  "Sentiment Polarity Analysis",
  "Language & Script Identification",
  "Multi-Metric Semantic Overlap",
];

export default function DashboardPage() {
  const { analysis, docName, loading } = useDocument();

  const meta = analysis?.meta;
  const pos = analysis?.pos ?? [];
  const chunks = analysis?.chunks ?? [];
  const entities = analysis?.entities ?? [];
  const ngramSummaries = analysis?.ngramSummaries ?? [];
  const sentiment = analysis?.sentiment;
  const languageId = analysis?.languageIdentification;

  const nounCount = pos.filter((p) => p.tag.startsWith("NN")).length;
  const verbCount = pos.filter((p) => p.tag.startsWith("VB")).length;
  const adjCount = pos.filter((p) => p.tag.startsWith("JJ")).length;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Platform Overview"
        title="NLP Intelligence Dashboard"
        description={`Consolidated analytics for "${docName || "Active Corpus"}" spanning 16 integrated NLP experiments across core syllabus practicals and advanced labs.`}
      />

      <ExperimentPlayground moduleTitle="NLP Platform Dashboard" />

      {loading && !analysis && (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
          <span className="ml-2 text-sm text-slate-500">Synthesizing platform metrics...</span>
        </div>
      )}

      {analysis && meta && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="Total Words" value={meta.stats.wordCount} />
            <StatCard label="Unique Words" value={meta.stats.uniqueWordCount} />
            <StatCard label="Sentences" value={meta.stats.sentenceCount} />
            <StatCard label="Named Entities" value={entities.length} tone="violet" />
            <StatCard label="Nouns (NN*)" value={nounCount} tone="emerald" />
            <StatCard label="Verbs (VB*)" value={verbCount} tone="amber" />
            <StatCard label="Adjectives (JJ*)" value={adjCount} tone="sky" />
            <StatCard label="Lexical Diversity" value={`${(meta.stats.lexicalDiversity * 100).toFixed(1)}%`} />
          </div>

          {/* End-to-End Pipeline Indicator */}
          <Card>
            <CardHeader
              title="15-Stage NLP Processing Pipeline"
              subtitle="All downstream linguistic features computed in unified non-blocking execution"
            />
            <CardBody>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                {PIPELINE_STAGES.map((stage, i) => (
                  <div
                    key={stage}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-50/70 border border-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-800"
                  >
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span className="truncate">{stage}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Module Snapshots Grid */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Language & Script Snapshot */}
            <Card>
              <CardHeader title="Language & Script" subtitle="Experiment 15 Snapshot" />
              <CardBody className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Detected Language:</span>
                  <Badge tone="indigo">{languageId?.detectedLanguage ?? "English"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Primary Script:</span>
                  <span className="font-semibold text-slate-800">{meta.scriptValidation.label}</span>
                </div>
                <Link
                  href="/language-id"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Explore Language ID Lab <ArrowRight className="h-3 w-3" />
                </Link>
              </CardBody>
            </Card>

            {/* Sentiment Polarity Snapshot */}
            <Card>
              <CardHeader title="Sentiment & Polarity" subtitle="Experiment 11 Snapshot" />
              <CardBody className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Document Polarity:</span>
                  <Badge
                    tone={
                      sentiment?.label === "Positive"
                        ? "emerald"
                        : sentiment?.label === "Negative"
                        ? "rose"
                        : "slate"
                    }
                  >
                    {sentiment?.label ?? "Neutral"} ({(sentiment?.normalizedScore ?? 0).toFixed(2)})
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Subjectivity Index:</span>
                  <span className="font-semibold text-slate-800">
                    {((sentiment?.subjectivity ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <Link
                  href="/sentiment"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Open Sentiment Lab <ArrowRight className="h-3 w-3" />
                </Link>
              </CardBody>
            </Card>

            {/* Named Entities Snapshot */}
            <Card>
              <CardHeader title="Named Entities" subtitle="Experiment 8 Snapshot" />
              <CardBody className="space-y-3">
                <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                  {entities.slice(0, 5).map((e, i) => (
                    <Badge key={i} tone="violet">
                      {e.text} · {e.type}
                    </Badge>
                  ))}
                  {entities.length === 0 && <p className="text-xs text-slate-400">No entities detected.</p>}
                </div>
                <Link
                  href="/ner"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Open NER Lab ({entities.length} total) <ArrowRight className="h-3 w-3" />
                </Link>
              </CardBody>
            </Card>

            {/* Chunking Structure Snapshot */}
            <Card>
              <CardHeader title="Syntactic Chunking" subtitle="Experiment 7 Snapshot" />
              <CardBody className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="indigo">NP: {chunks.filter((c) => c.type === "NP").length}</Badge>
                  <Badge tone="amber">VP: {chunks.filter((c) => c.type === "VP").length}</Badge>
                  <Badge tone="rose">PP: {chunks.filter((c) => c.type === "PP").length}</Badge>
                </div>
                <Link
                  href="/chunking"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Inspect Phrase Chunks <ArrowRight className="h-3 w-3" />
                </Link>
              </CardBody>
            </Card>

            {/* N-Gram Models Snapshot */}
            <Card>
              <CardHeader title="Statistical N-Grams" subtitle="Experiment 5 Snapshot" />
              <CardBody className="space-y-3 text-sm">
                <div className="flex justify-between text-xs text-slate-600">
                  {ngramSummaries.map((s) => (
                    <span key={s.n}>
                      <strong>{s.label}:</strong> {s.uniqueNGrams}
                    </span>
                  ))}
                </div>
                <Link
                  href="/ngram"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Launch N-Gram Prediction Lab <ArrowRight className="h-3 w-3" />
                </Link>
              </CardBody>
            </Card>

            {/* Advanced Lab Directory */}
            <Card>
              <CardHeader title="Advanced Laboratories" subtitle="Experiments 12-16" />
              <CardBody className="space-y-2 text-xs">
                <div className="flex flex-wrap gap-2">
                  <Link href="/classification" className="rounded-md bg-slate-100 hover:bg-indigo-50 px-2 py-1 font-medium text-slate-700 hover:text-indigo-700">
                    Classification (Exp 12)
                  </Link>
                  <Link href="/topic-modeling" className="rounded-md bg-slate-100 hover:bg-indigo-50 px-2 py-1 font-medium text-slate-700 hover:text-indigo-700">
                    Topic Modeling (Exp 13)
                  </Link>
                  <Link href="/keywords" className="rounded-md bg-slate-100 hover:bg-indigo-50 px-2 py-1 font-medium text-slate-700 hover:text-indigo-700">
                    RAKE & TF-IDF (Exp 14)
                  </Link>
                  <Link href="/semantic-similarity" className="rounded-md bg-slate-100 hover:bg-indigo-50 px-2 py-1 font-medium text-slate-700 hover:text-indigo-700">
                    Semantic Alignment (Exp 16)
                  </Link>
                </div>
                <Link
                  href="/experiments"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-1"
                >
                  View All 16 Experiments Syllabus <ArrowRight className="h-3 w-3" />
                </Link>
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

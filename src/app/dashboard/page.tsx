"use client";

import Link from "next/link";
import { useDocument } from "@/components/document-context";
import { NoDocumentState } from "@/components/no-document-state";
import { Card, CardBody, CardHeader, SectionHeading, StatCard, Badge } from "@/components/ui/primitives";
import { CheckCircle2 } from "lucide-react";

const PIPELINE_STAGES = [
  "Raw Text",
  "Tokenization",
  "Filtration",
  "Stemming/Lemmatization",
  "POS Tagging",
  "Chunking",
  "NER",
  "N-Gram Analysis",
  "Keyword/WordCloud",
];

export default function DashboardPage() {
  const { analysis, docName } = useDocument();

  if (!analysis) {
    return (
      <div className="space-y-6">
        <SectionHeading eyebrow="Module" title="NLP Dashboard" description="A unified analytics view of your document across every NLP experiment." />
        <NoDocumentState moduleName="the dashboard" />
      </div>
    );
  }

  const { meta, pos, chunks, entities, ngramSummaries } = analysis;
  const nounCount = pos.filter((p) => p.tag.startsWith("NN")).length;
  const verbCount = pos.filter((p) => p.tag.startsWith("VB")).length;
  const adjCount = pos.filter((p) => p.tag.startsWith("JJ")).length;

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Module" title="NLP Dashboard" description={`Consolidated analysis for "${docName}" across all integrated NLP experiments.`} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total Words" value={meta.stats.wordCount} />
        <StatCard label="Unique Words" value={meta.stats.uniqueWordCount} />
        <StatCard label="Sentences" value={meta.stats.sentenceCount} />
        <StatCard label="Named Entities" value={entities.length} tone="violet" />
        <StatCard label="Nouns" value={nounCount} tone="emerald" />
        <StatCard label="Verbs" value={verbCount} tone="amber" />
        <StatCard label="Adjectives" value={adjCount} tone="sky" />
        <StatCard label="Avg Sentence Length" value={meta.stats.avgSentenceLength} />
      </div>

      <Card>
        <CardHeader title="NLP Processing Pipeline" subtitle="Every stage below has been executed on this document." />
        <CardBody>
          <div className="flex flex-wrap gap-3">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                <CheckCircle2 size={14} />
                <span>
                  {i + 1}. {stage}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Script Validation" subtitle="Language quality check" />
          <CardBody>
            <Badge tone={meta.scriptValidation.isValid ? "emerald" : "rose"}>{meta.scriptValidation.label}</Badge>
            <p className="mt-3 text-sm text-slate-600">
              Latin alphabetic characters: <strong>{meta.scriptValidation.latinChars}</strong> / {meta.scriptValidation.totalAlphaChars} (
              {meta.scriptValidation.latinRatio}%)
            </p>
            <Link href="/preprocessing" className="mt-3 inline-block text-sm font-semibold text-indigo-600">
              Open Preprocessing module →
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Chunking Snapshot" subtitle="Phrase structure summary" />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              <Badge tone="indigo">NP: {chunks.filter((c) => c.type === "NP").length}</Badge>
              <Badge tone="amber">VP: {chunks.filter((c) => c.type === "VP").length}</Badge>
              <Badge tone="rose">PP: {chunks.filter((c) => c.type === "PP").length}</Badge>
            </div>
            <Link href="/chunking" className="mt-3 inline-block text-sm font-semibold text-indigo-600">
              Open Chunk Analyzer →
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="N-Gram Snapshot" subtitle="Language model summary" />
          <CardBody>
            <ul className="space-y-1 text-sm text-slate-600">
              {ngramSummaries.map((s) => (
                <li key={s.n}>
                  <strong>{s.label}</strong>: {s.totalNGrams} total, {s.uniqueNGrams} unique
                </li>
              ))}
            </ul>
            <Link href="/ngram" className="mt-3 inline-block text-sm font-semibold text-indigo-600">
              Open N-Gram Lab →
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Named Entities Snapshot" subtitle="Detected entities overview" />
          <CardBody>
            <div className="flex flex-wrap gap-1.5">
              {entities.slice(0, 10).map((e, i) => (
                <Badge key={i} tone="violet">
                  {e.text} · {e.type}
                </Badge>
              ))}
              {entities.length === 0 && <p className="text-sm text-slate-500">No named entities detected in this text.</p>}
            </div>
            <Link href="/ner" className="mt-3 inline-block text-sm font-semibold text-indigo-600">
              Open NER module →
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useDocument } from "@/components/document-context";
import { UploadPanel } from "@/components/upload-panel";
import { Card, CardBody, CardHeader, SectionHeading, StatCard, Badge } from "@/components/ui/primitives";
import { ArrowRight } from "lucide-react";

const MODULES = [
  { href: "/preprocessing", title: "Preprocessing", desc: "Tokens, filtration, script validation", exp: 2 },
  { href: "/stemlemma", title: "Stemming & Lemmatization", desc: "Stop words, Porter stemmer, WordNet lemma", exp: 3 },
  { href: "/morphology", title: "Morphology", desc: "Prefix / root / suffix + word generation", exp: 4 },
  { href: "/ngram", title: "N-Gram Lab", desc: "Next-word prediction & text generation", exp: 5 },
  { href: "/pos", title: "POS Tagger", desc: "Penn-Treebank tags & distribution chart", exp: 6 },
  { href: "/chunking", title: "Chunking", desc: "NP / VP / PP phrase structure", exp: 7 },
  { href: "/ner", title: "Named Entities", desc: "PERSON, ORG, GPE, DATE highlighting", exp: 8 },
  { href: "/sentiment", title: "Sentiment Analysis", desc: "Polarity score, confidence, token breakdown", exp: 11 },
  { href: "/keywords", title: "Keyword Extraction", desc: "RAKE, TF-IDF, noun phrases comparison", exp: 14 },
  { href: "/topic-modeling", title: "Topic Modeling", desc: "Latent topics, top terms, doc distributions", exp: 13 },
  { href: "/language-id", title: "Language ID", desc: "Latin vs Devanagari (Hindi / Marathi)", exp: 15 },
  { href: "/similarity", title: "Doc Similarity", desc: "TF-IDF & Cosine distance", exp: 9 },
  { href: "/semantic-similarity", title: "Semantic Similarity", desc: "Multi-metric lexical & soft semantic", exp: 16 },
  { href: "/wordcloud", title: "Word Cloud", desc: "Keyword frequency & text EDA", exp: 10 },
];


export default function AnalyzerPage() {
  const { analysis, docName } = useDocument();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Module"
        title="Document Analyzer"
        description="Paste academic text or upload a .txt / .pdf document. The platform extracts the text, runs the full NLP pipeline locally, and unlocks every experiment module below."
      />

      <UploadPanel />

      {analysis && (
        <>
          <Card>
            <CardHeader title="Document Overview" subtitle={docName} action={<Badge tone="emerald">{analysis.meta.scriptValidation.label}</Badge>} />
            <CardBody>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <StatCard label="Characters" value={analysis.meta.stats.charCount.toLocaleString()} />
                <StatCard label="Words" value={analysis.meta.stats.wordCount.toLocaleString()} />
                <StatCard label="Unique Words" value={analysis.meta.stats.uniqueWordCount.toLocaleString()} />
                <StatCard label="Sentences" value={analysis.meta.stats.sentenceCount.toLocaleString()} />
                <StatCard label="Avg Sentence Length" value={analysis.meta.stats.avgSentenceLength} />
                <StatCard label="Lexical Diversity" value={analysis.meta.stats.lexicalDiversity} />
              </div>
            </CardBody>
          </Card>

          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">Continue the pipeline</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {MODULES.map((m) => (
                <Link key={m.href} href={m.href}>
                  <Card className="group flex h-full flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{m.title}</span>
                      <Badge tone="indigo">NLP Tool</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{m.desc}</p>
                    <span className="mt-auto flex items-center gap-1 text-xs font-medium text-indigo-600 opacity-0 transition group-hover:opacity-100">
                      Open <ArrowRight size={12} />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

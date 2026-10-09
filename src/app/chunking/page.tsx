"use client";

import { useDocument } from "@/components/document-context";
import { NoDocumentState } from "@/components/no-document-state";
import { Card, CardBody, CardHeader, SectionHeading, StatCard, Badge } from "@/components/ui/primitives";

const TYPE_TONE = { NP: "indigo", VP: "amber", PP: "rose" } as const;
const TYPE_LABEL = { NP: "Noun Phrase", VP: "Verb Phrase", PP: "Prepositional Phrase" } as const;

export default function ChunkingPage() {
  const { analysis } = useDocument();

  if (!analysis) {
    return (
      <div className="space-y-6">
        <SectionHeading eyebrow="NLP Tool" title="Chunk Analyzer" description="Rule-based phrase chunking (NP / VP / PP) built on POS tags." />
        <NoDocumentState moduleName="chunking" />
      </div>
    );
  }

  const { chunks, sentences } = analysis;
  const grouped = sentences.map((s, idx) => ({ sentence: s, chunks: chunks.filter((c) => c.sentenceIndex === idx) }));

  const npCount = chunks.filter((c) => c.type === "NP").length;
  const vpCount = chunks.filter((c) => c.type === "VP").length;
  const ppCount = chunks.filter((c) => c.type === "PP").length;

  return (
    <div className="space-y-6">
      <SectionHeading
eyebrow="NLP Tool"
        title="Chunking — Phrase Structure Analysis"
        description="A simplified rule-based chunk grammar identifies Noun Phrases (NP), Verb Phrases (VP) and Prepositional Phrases (PP) from POS-tagged sentences. Example: NP → DT JJ NN, VP → VB(.*) + object NP, PP → IN + NP."
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Noun Phrases (NP)" value={npCount} tone="indigo" />
        <StatCard label="Verb Phrases (VP)" value={vpCount} tone="amber" />
        <StatCard label="Prepositional Phrases (PP)" value={ppCount} tone="rose" />
      </div>

      <div className="space-y-4">
        {grouped.map((g, idx) => (
          <Card key={idx}>
            <CardHeader title={`Sentence ${idx + 1}`} subtitle={g.sentence} />
            <CardBody>
              {g.chunks.length === 0 ? (
                <p className="text-sm text-slate-400">No chunks detected in this sentence.</p>
              ) : (
                <div className="space-y-2">
                  {g.chunks.map((c, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                      <Badge tone={TYPE_TONE[c.type]}>{c.type}</Badge>
                      <span className="text-sm text-slate-500">{TYPE_LABEL[c.type]}</span>
                      <span className="text-slate-300">→</span>
                      <span className="text-sm font-semibold text-slate-800">{c.text}</span>
                      <span className="ml-auto font-mono text-[11px] text-slate-400">{c.pattern}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

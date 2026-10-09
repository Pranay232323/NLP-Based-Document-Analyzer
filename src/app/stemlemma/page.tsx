"use client";

import { useDocument } from "@/components/document-context";
import { NoDocumentState } from "@/components/no-document-state";
import { Card, CardBody, CardHeader, SectionHeading, StatCard, Badge } from "@/components/ui/primitives";

export default function StemLemmaPage() {
  const { analysis } = useDocument();

  if (!analysis) {
    return (
      <div className="space-y-6">
        <SectionHeading eyebrow="NLP Tool" title="Stemming & Lemmatization" description="Compare Porter stemming against WordNet-style lemmatization." />
        <NoDocumentState moduleName="stemming & lemmatization" />
      </div>
    );
  }

  const { preprocessing, stemLemma } = analysis;
  const changedByStem = stemLemma.filter((r) => r.stemmed !== r.word).length;
  const changedByLemma = stemLemma.filter((r) => r.lemmatized !== r.word).length;

  return (
    <div className="space-y-6">
      <SectionHeading
eyebrow="NLP Tool"
        title="Stop Word Removal, Stemming & Lemmatization"
        description='Example flow: lowercase → tokenize → remove stop words → stem (Porter) → lemmatize (POS-aware WordNet-style lemmatizer). "studies" → stem "studi" vs lemma "study".'
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Words After Stop-word Removal" value={stemLemma.length} />
        <StatCard label="Stop Words Removed" value={preprocessing.removedStopwords.length} tone="rose" />
        <StatCard label="Words Changed by Stemming" value={changedByStem} tone="amber" />
        <StatCard label="Words Changed by Lemmatization" value={changedByLemma} tone="emerald" />
      </div>

      <Card>
        <CardHeader title="After Stop Word Removal" subtitle="Lowercased, unique, meaningful tokens" />
        <CardBody>
          <div className="flex flex-wrap gap-1.5">
            {stemLemma.slice(0, 150).map((r) => (
              <Badge key={r.word} tone="slate">
                {r.word}
              </Badge>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Stemming vs Lemmatization — Comparison Table" subtitle="Word | POS | Stemmed Form | Lemmatized Form" />
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4">Word</th>
                <th className="py-2 pr-4">POS</th>
                <th className="py-2 pr-4">Stemmed Form (Porter)</th>
                <th className="py-2 pr-4">Lemmatized Form</th>
              </tr>
            </thead>
            <tbody>
              {stemLemma.slice(0, 150).map((r) => (
                <tr key={r.word} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-800">{r.word}</td>
                  <td className="py-2 pr-4 text-slate-500">{r.pos || "—"}</td>
                  <td className="py-2 pr-4">
                    <span className={r.stemmed !== r.word ? "font-semibold text-amber-600" : "text-slate-600"}>{r.stemmed}</span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className={r.lemmatized !== r.word ? "font-semibold text-emerald-600" : "text-slate-600"}>{r.lemmatized}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stemLemma.length > 150 && <p className="mt-2 text-xs text-slate-400">Showing first 150 of {stemLemma.length} unique words.</p>}
        </CardBody>
      </Card>
    </div>
  );
}

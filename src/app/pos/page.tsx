"use client";

import { useDocument } from "@/components/document-context";
import { NoDocumentState } from "@/components/no-document-state";
import { Card, CardBody, CardHeader, SectionHeading, StatCard, Badge } from "@/components/ui/primitives";

export default function PosPage() {
  const { analysis } = useDocument();

  if (!analysis) {
    return (
      <div className="space-y-6">
        <SectionHeading eyebrow="NLP Tool" title="POS Tagger" description="Penn-Treebank style POS tagging using NLTK-style Treebank tags." />
        <NoDocumentState moduleName="POS tagging" />
      </div>
    );
  }

  const { pos, posDistribution } = analysis;
  const maxCount = Math.max(...posDistribution.map((d) => d.count), 1);
  const nouns = pos.filter((p) => p.tag.startsWith("NN")).length;
  const verbs = pos.filter((p) => p.tag.startsWith("VB")).length;
  const adjectives = pos.filter((p) => p.tag.startsWith("JJ")).length;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="NLP Tool"
        title="Part-of-Speech Tagging"
        description='Each token in the document is tagged with its grammatical category using a Penn-Treebank style tagset (e.g. "student" → NN, "is" → VBZ).'
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Tagged Tokens" value={pos.length} />
        <StatCard label="Nouns (NN*)" value={nouns} tone="emerald" />
        <StatCard label="Verbs (VB*)" value={verbs} tone="amber" />
        <StatCard label="Adjectives (JJ*)" value={adjectives} tone="violet" />
      </div>

      <Card>
        <CardHeader title="POS Distribution" subtitle="Frequency of each tag across the document" />
        <CardBody className="space-y-2">
          {posDistribution.map((d) => (
            <div key={d.tag} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs font-semibold text-slate-700">{d.tag}</span>
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${(d.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs text-slate-500">{d.count}</span>
              <span className="hidden w-48 shrink-0 text-xs text-slate-400 sm:block">{d.description}</span>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Word | POS Tag | Description" subtitle={`${pos.length} tokens tagged`} />
        <CardBody className="max-h-[480px] overflow-y-auto overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4">Word</th>
                <th className="py-2 pr-4">POS Tag</th>
                <th className="py-2 pr-4">Description</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((row, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-1.5 pr-4 font-medium text-slate-800">{row.word}</td>
                  <td className="py-1.5 pr-4">
                    <Badge tone="indigo">{row.tag}</Badge>
                  </td>
                  <td className="py-1.5 pr-4 text-slate-500">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

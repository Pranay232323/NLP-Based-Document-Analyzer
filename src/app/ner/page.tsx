"use client";

import { useDocument } from "@/components/document-context";
import { NoDocumentState } from "@/components/no-document-state";
import { Card, CardBody, CardHeader, SectionHeading, StatCard, Badge } from "@/components/ui/primitives";
import { buildHighlightSegments } from "@/lib/nlp/highlight";

const TYPE_COLORS: Record<string, string> = {
  PERSON: "bg-indigo-100 text-indigo-800",
  ORGANIZATION: "bg-violet-100 text-violet-800",
  "GPE/LOCATION": "bg-sky-100 text-sky-800",
  DATE: "bg-emerald-100 text-emerald-800",
  TIME: "bg-emerald-100 text-emerald-800",
  MONEY: "bg-amber-100 text-amber-800",
  PERCENT: "bg-amber-100 text-amber-800",
  CARDINAL: "bg-slate-200 text-slate-700",
  ORDINAL: "bg-slate-200 text-slate-700",
  DURATION: "bg-rose-100 text-rose-800",
};

function colorFor(type: string) {
  return TYPE_COLORS[type] ?? "bg-slate-200 text-slate-700";
}

export default function NerPage() {
  const { analysis } = useDocument();

  if (!analysis) {
    return (
      <div className="space-y-6">
        <SectionHeading eyebrow="NLP Tool" title="Named Entity Recognition" description="Identify PERSON, ORGANIZATION, LOCATION/GPE, DATE and other entities." />
        <NoDocumentState moduleName="named entity recognition" />
      </div>
    );
  }

  const { entities, rawText } = analysis;
  const segments = buildHighlightSegments(rawText, entities);
  const byType = new Map<string, number>();
  entities.forEach((e) => byType.set(e.type, (byType.get(e.type) ?? 0) + 1));

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="NLP Tool"
        title="Named Entity Recognition"
        description="Entities are extracted using a hybrid of lexicon/capitalisation-based rules (PERSON, ORGANIZATION, GPE/LOCATION) and a statistical entity detector (DATE, TIME, MONEY, PERCENT, CARDINAL, ORDINAL)."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Entities" value={entities.length} />
        {Array.from(byType.entries())
          .slice(0, 3)
          .map(([type, count]) => (
            <StatCard key={type} label={type} value={count} tone="violet" />
          ))}
      </div>

      <Card>
        <CardHeader title="Highlighted Document" subtitle="Entities highlighted inline in the original text" />
        <CardBody>
          <p className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm leading-loose text-slate-700">
            {segments.map((seg, i) =>
              seg.entity ? (
                <span key={i} className={`entity-highlight ${colorFor(seg.entity.type)}`} title={seg.entity.type}>
                  {seg.text}
                </span>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Entity | Type | Category" subtitle={`${entities.length} entities detected`} />
        <CardBody className="overflow-x-auto">
          {entities.length === 0 ? (
            <p className="text-sm text-slate-400">No named entities were detected in this document.</p>
          ) : (
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4">Entity</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Category</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((e, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-800">{e.text}</td>
                    <td className="py-2 pr-4">
                      <Badge tone="indigo">{e.type}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-slate-500">{e.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

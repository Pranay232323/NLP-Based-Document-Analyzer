"use client";

import { useState } from "react";
import { useDocument } from "@/components/document-context";
import { Card, CardBody, CardHeader, SectionHeading, StatCard, Badge, SecondaryButton, Spinner } from "@/components/ui/primitives";
import { ExperimentPlayground } from "@/components/experiment-playground";
import { buildHighlightSegments } from "@/lib/nlp/highlight";
import { Search, Download, ShieldCheck, Tag } from "lucide-react";

const TYPE_COLORS: Record<string, { bg: string; text: string; badgeTone: "indigo" | "violet" | "sky" | "emerald" | "amber" | "rose" | "slate" }> = {
  PERSON: { bg: "bg-indigo-100/80 text-indigo-900 border-indigo-200", text: "text-indigo-900", badgeTone: "indigo" },
  ORGANIZATION: { bg: "bg-violet-100/80 text-violet-900 border-violet-200", text: "text-violet-900", badgeTone: "violet" },
  "GPE/LOCATION": { bg: "bg-sky-100/80 text-sky-900 border-sky-200", text: "text-sky-900", badgeTone: "sky" },
  DATE: { bg: "bg-emerald-100/80 text-emerald-900 border-emerald-200", text: "text-emerald-900", badgeTone: "emerald" },
  TIME: { bg: "bg-teal-100/80 text-teal-900 border-teal-200", text: "text-teal-900", badgeTone: "emerald" },
  MONEY: { bg: "bg-amber-100/80 text-amber-900 border-amber-200", text: "text-amber-900", badgeTone: "amber" },
  PERCENT: { bg: "bg-amber-100/80 text-amber-900 border-amber-200", text: "text-amber-900", badgeTone: "amber" },
  CARDINAL: { bg: "bg-slate-200 text-slate-800 border-slate-300", text: "text-slate-800", badgeTone: "slate" },
  ORDINAL: { bg: "bg-slate-200 text-slate-800 border-slate-300", text: "text-slate-800", badgeTone: "slate" },
  DURATION: { bg: "bg-rose-100/80 text-rose-900 border-rose-200", text: "text-rose-900", badgeTone: "rose" },
};

function getColorMeta(type: string) {
  return TYPE_COLORS[type] ?? { bg: "bg-slate-100 text-slate-800 border-slate-200", text: "text-slate-800", badgeTone: "slate" as const };
}

export default function NerPage() {
  const { analysis, loading } = useDocument();
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const entities = analysis?.entities ?? [];
  const rawText = analysis?.rawText ?? "";

  const segments = rawText ? buildHighlightSegments(rawText, entities) : [];

  const byType = new Map<string, number>();
  entities.forEach((e) => byType.set(e.type, (byType.get(e.type) ?? 0) + 1));

  // Entity aggregation table: group identical entities
  const groupedEntities = Array.from(
    entities.reduce((acc, curr) => {
      const key = `${curr.text}::${curr.type}`;
      if (!acc.has(key)) {
        acc.set(key, { text: curr.text, type: curr.type, category: curr.category, count: 0, occurrences: [] as number[] });
      }
      const entry = acc.get(key)!;
      entry.count += 1;
      entry.occurrences.push(curr.start);
      return acc;
    }, new Map<string, { text: string; type: string; category: string; count: number; occurrences: number[] }>()).values()
  );

  const filteredGrouped = groupedEntities.filter((item) => {
    if (selectedType !== "ALL" && item.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return item.text.toLowerCase().includes(q) || item.type.toLowerCase().includes(q);
    }
    return true;
  });

  function handleExport() {
    if (entities.length === 0) return;
    const jsonStr = JSON.stringify({ entities, grouped: groupedEntities }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ner-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Practical 8 · Core NLP"
        title="Named Entity Recognition (NER)"
        description="Locate and classify named entities (PERSON, ORGANIZATION, LOCATION/GPE, DATE, MONEY) across English, Hindi, and Marathi text using hybrid statistical and rule-based gazetteers."
      />

      <ExperimentPlayground moduleTitle="Named Entity Recognition" />

      {loading && !analysis && (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
          <span className="ml-2 text-sm text-slate-500">Extracting named entities...</span>
        </div>
      )}

      {analysis && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Named Entities" value={entities.length} />
            <StatCard label="Unique Entities" value={groupedEntities.length} tone="indigo" />
            <StatCard label="Organizations" value={byType.get("ORGANIZATION") ?? 0} tone="violet" />
            <StatCard label="Locations / GPE" value={byType.get("GPE/LOCATION") ?? 0} tone="sky" />
          </div>

          {/* Interactive Document Highlighting */}
          <Card>
            <CardHeader
              title="Interactive Inline Entity Highlighter"
              subtitle="Hover over any highlighted span to see entity type and boundaries"
              action={
                <SecondaryButton onClick={handleExport} className="text-xs">
                  <Download className="mr-1 h-3.5 w-3.5 inline" /> Export JSON
                </SecondaryButton>
              }
            />
            <CardBody>
              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800 shadow-inner">
                {segments.map((seg, idx) => {
                  if (!seg.entity) {
                    return <span key={idx}>{seg.text}</span>;
                  }
                  const meta = getColorMeta(seg.entity.type);
                  return (
                    <mark
                      key={idx}
                      className={`mx-0.5 inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-semibold shadow-2xs transition hover:scale-105 ${meta.bg}`}
                      title={`${seg.entity.text} · ${seg.entity.type}`}
                    >
                      <span>{seg.text}</span>
                      <span className="ml-1 text-[10px] uppercase opacity-75 font-mono">
                        {seg.entity.type}
                      </span>
                    </mark>
                  );
                })}
              </div>

              {/* Entity Legend */}
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-500">Legend:</span>
                <span className="rounded px-2 py-0.5 bg-indigo-100 text-indigo-900 font-medium">PERSON</span>
                <span className="rounded px-2 py-0.5 bg-violet-100 text-violet-900 font-medium">ORGANIZATION</span>
                <span className="rounded px-2 py-0.5 bg-sky-100 text-sky-900 font-medium">GPE/LOCATION</span>
                <span className="rounded px-2 py-0.5 bg-emerald-100 text-emerald-900 font-medium">DATE</span>
                <span className="rounded px-2 py-0.5 bg-amber-100 text-amber-900 font-medium">MONEY/PERCENT</span>
                <span className="rounded px-2 py-0.5 bg-slate-200 text-slate-800 font-medium">NUMERIC</span>
              </div>
            </CardBody>
          </Card>

          {/* Grouped Entities Table with Search */}
          <Card>
            <CardHeader
              title="Classified Entity Registry"
              subtitle={`Showing ${filteredGrouped.length} of ${groupedEntities.length} unique entity mentions`}
            />
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedType("ALL")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedType === "ALL" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    All ({groupedEntities.length})
                  </button>
                  {Array.from(byType.keys()).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        selectedType === type ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {type} ({byType.get(type)})
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search entity name or type..."
                    className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <tr className="border-b border-slate-200">
                      <th className="py-2.5 px-4">Entity Text</th>
                      <th className="py-2.5 px-4">Classified Type</th>
                      <th className="py-2.5 px-4">Broad Category</th>
                      <th className="py-2.5 px-4 text-center">Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredGrouped.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                          No entities match the search or filter query.
                        </td>
                      </tr>
                    ) : (
                      filteredGrouped.map((item, idx) => {
                        const meta = getColorMeta(item.type);
                        return (
                          <tr key={`${item.text}-${idx}`} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-4 font-semibold text-slate-900">{item.text}</td>
                            <td className="py-2.5 px-4">
                              <span className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded border ${meta.bg}`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-xs text-slate-600">{item.category}</td>
                            <td className="py-2.5 px-4 text-center font-semibold text-slate-700">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                                {item.count}×
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

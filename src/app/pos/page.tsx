"use client";

import { useState, useMemo } from "react";
import { useDocument } from "@/components/document-context";
import { Card, CardBody, CardHeader, SectionHeading, StatCard, Badge, SecondaryButton, Spinner } from "@/components/ui/primitives";
import { ExperimentPlayground } from "@/components/experiment-playground";
import { StepSimulator } from "@/components/ui/step-simulator";
import { generatePOSTaggingSimulation } from "@/lib/nlp/simulators";
import { Search, Download, Layers, Tag } from "lucide-react";

const TAG_COLOR_MAP: Record<string, { bg: string; text: string; tone: "indigo" | "amber" | "emerald" | "violet" | "sky" | "rose" | "slate" }> = {
  NN: { bg: "bg-indigo-50", text: "text-indigo-700", tone: "indigo" },
  NNS: { bg: "bg-indigo-50", text: "text-indigo-700", tone: "indigo" },
  NNP: { bg: "bg-indigo-100", text: "text-indigo-800", tone: "indigo" },
  NNPS: { bg: "bg-indigo-100", text: "text-indigo-800", tone: "indigo" },
  VB: { bg: "bg-amber-50", text: "text-amber-700", tone: "amber" },
  VBD: { bg: "bg-amber-50", text: "text-amber-700", tone: "amber" },
  VBG: { bg: "bg-amber-50", text: "text-amber-700", tone: "amber" },
  VBN: { bg: "bg-amber-50", text: "text-amber-700", tone: "amber" },
  VBP: { bg: "bg-amber-50", text: "text-amber-700", tone: "amber" },
  VBZ: { bg: "bg-amber-50", text: "text-amber-700", tone: "amber" },
  JJ: { bg: "bg-emerald-50", text: "text-emerald-700", tone: "emerald" },
  JJR: { bg: "bg-emerald-50", text: "text-emerald-700", tone: "emerald" },
  JJS: { bg: "bg-emerald-50", text: "text-emerald-700", tone: "emerald" },
  RB: { bg: "bg-sky-50", text: "text-sky-700", tone: "sky" },
  RBR: { bg: "bg-sky-50", text: "text-sky-700", tone: "sky" },
  RBS: { bg: "bg-sky-50", text: "text-sky-700", tone: "sky" },
  PRP: { bg: "bg-violet-50", text: "text-violet-700", tone: "violet" },
  "PRP$": { bg: "bg-violet-50", text: "text-violet-700", tone: "violet" },
  IN: { bg: "bg-slate-100", text: "text-slate-700", tone: "slate" },
  CC: { bg: "bg-rose-50", text: "text-rose-700", tone: "rose" },
  CD: { bg: "bg-purple-50", text: "text-purple-700", tone: "slate" },
};

function getTagMeta(tag: string) {
  return TAG_COLOR_MAP[tag] ?? { bg: "bg-slate-50", text: "text-slate-600", tone: "slate" as const };
}

export default function PosPage() {
  const { analysis, loading } = useDocument();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const pos = analysis?.pos ?? [];
  const posDistribution = analysis?.posDistribution ?? [];

  const nouns = pos.filter((p) => p.tag.startsWith("NN")).length;
  const verbs = pos.filter((p) => p.tag.startsWith("VB")).length;
  const adjectives = pos.filter((p) => p.tag.startsWith("JJ")).length;
  const adverbs = pos.filter((p) => p.tag.startsWith("RB")).length;

  const filteredTokens = pos.filter((item) => {
    if (selectedCategory === "NOUNS" && !item.tag.startsWith("NN")) return false;
    if (selectedCategory === "VERBS" && !item.tag.startsWith("VB")) return false;
    if (selectedCategory === "ADJECTIVES" && !item.tag.startsWith("JJ")) return false;
    if (selectedCategory === "ADVERBS" && !item.tag.startsWith("RB")) return false;
    if (selectedCategory === "PRONOUNS" && !item.tag.startsWith("PRP")) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.word.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const maxDistCount = Math.max(...posDistribution.map((d) => d.count), 1);

  function handleExport() {
    if (pos.length === 0) return;
    const jsonStr = JSON.stringify({ posTokens: pos, distribution: posDistribution }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pos-tagging-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const simTarget = analysis?.rawText?.slice(0, 160) || "The dedicated professor clearly explained complex computational algorithms.";
  const simulation = useMemo(() => generatePOSTaggingSimulation(simTarget), [simTarget]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Practical 6 · Core NLP"
        title="Part-of-Speech (POS) Tagging"
        description="Grammatical category disambiguation using Penn Treebank tagsets (Eric Brill transformation-based tagging for English, morphological postposition & verb rules for Indic)."
      />

      <ExperimentPlayground moduleTitle="Part-of-Speech Tagging" />

      {/* INTERACTIVE ALGORITHM SIMULATOR */}
      <StepSimulator
        title="Visual Part-of-Speech Tagging Scanner"
        subtitle="Watch the tagger inspect each word and its syntactic context to assign Penn Treebank tags step-by-step"
        tokens={simulation.tokens}
        steps={simulation.steps}
        badgeText="Exp 6 Simulator"
      />

      {loading && !analysis && (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
          <span className="ml-2 text-sm text-slate-500">Tagging parts of speech...</span>
        </div>
      )}

      {analysis && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Tagged Tokens" value={pos.length} />
            <StatCard label="Nouns (NN*)" value={nouns} tone="indigo" />
            <StatCard label="Verbs (VB*)" value={verbs} tone="amber" />
            <StatCard label="Adjectives (JJ*)" value={adjectives} tone="emerald" />
          </div>

          {/* Interactive Tag Distribution Chart */}
          <Card>
            <CardHeader
              title="Grammatical Category Distribution"
              subtitle="Relative frequency of Penn Treebank syntactic tags across the analyzed text"
              action={
                <SecondaryButton onClick={handleExport} className="text-xs">
                  <Download className="mr-1 h-3.5 w-3.5 inline" /> Export JSON
                </SecondaryButton>
              }
            />
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {posDistribution.slice(0, 12).map((item) => {
                  const pct = ((item.count / pos.length) * 100).toFixed(1);
                  const meta = getTagMeta(item.tag);
                  return (
                    <div key={item.tag} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${meta.bg} ${meta.text}`}>
                            {item.tag}
                          </span>
                          <span className="text-slate-600 truncate max-w-[140px]" title={item.description}>
                            {item.description}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-700">{item.count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${(item.count / maxDistCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Interactive Sentence POS Stream */}
          <Card>
            <CardHeader
              title="Interactive Tagged Token Stream"
              subtitle="Hover over any word to inspect its grammatical classification and POS tag"
            />
            <CardBody>
              <div className="flex flex-wrap gap-2 leading-loose max-h-60 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                {pos.slice(0, 250).map((item, idx) => {
                  const meta = getTagMeta(item.tag);
                  return (
                    <span
                      key={`${item.word}-${idx}`}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs transition hover:scale-105 ${meta.bg} ${meta.text} border-slate-200/80 shadow-xs cursor-help`}
                      title={`${item.word} → ${item.tag} (${item.description})`}
                    >
                      <span className="font-medium">{item.word}</span>
                      <span className="font-mono text-[10px] opacity-75 font-bold">/{item.tag}</span>
                    </span>
                  );
                })}
              </div>
              {pos.length > 250 && (
                <p className="mt-2 text-right text-xs text-slate-400">
                  Showing first 250 tokens in preview. Use table below for comprehensive inspection.
                </p>
              )}
            </CardBody>
          </Card>

          {/* Searchable Token Table */}
          <Card>
            <CardHeader
              title="Searchable POS Token Table"
              subtitle={`Displaying ${filteredTokens.length} of ${pos.length} tagged tokens`}
            />
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCategory("ALL")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedCategory === "ALL" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    All ({pos.length})
                  </button>
                  <button
                    onClick={() => setSelectedCategory("NOUNS")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedCategory === "NOUNS" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Nouns ({nouns})
                  </button>
                  <button
                    onClick={() => setSelectedCategory("VERBS")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedCategory === "VERBS" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Verbs ({verbs})
                  </button>
                  <button
                    onClick={() => setSelectedCategory("ADJECTIVES")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedCategory === "ADJECTIVES" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Adjectives ({adjectives})
                  </button>
                  <button
                    onClick={() => setSelectedCategory("ADVERBS")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedCategory === "ADVERBS" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Adverbs ({adverbs})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search word, tag (e.g. NNP), or description..."
                    className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <tr className="border-b border-slate-200">
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Word Token</th>
                      <th className="py-2.5 px-4">Penn Tag</th>
                      <th className="py-2.5 px-4">Grammatical Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredTokens.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                          No tokens match the search query or category filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTokens.slice(0, 150).map((item, idx) => {
                        const meta = getTagMeta(item.tag);
                        return (
                          <tr key={`${item.word}-${idx}`} className="hover:bg-slate-50 transition">
                            <td className="py-2 px-4 text-xs text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-2 px-4 font-semibold text-slate-900">{item.word}</td>
                            <td className="py-2 px-4">
                              <span className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${meta.bg} ${meta.text}`}>
                                {item.tag}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-xs text-slate-600">{item.description}</td>
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

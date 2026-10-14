"use client";

import { useState } from "react";
import { useDocument } from "@/components/document-context";
import { Card, CardBody, CardHeader, SectionHeading, StatCard, Badge, SecondaryButton, Spinner } from "@/components/ui/primitives";
import { ExperimentPlayground } from "@/components/experiment-playground";
import { Search, Download, Layers, Sparkles } from "lucide-react";

const TYPE_CONFIG = {
  NP: {
    label: "Noun Phrase",
    badgeTone: "indigo" as const,
    bg: "bg-indigo-50 border-indigo-200 text-indigo-900",
    pillBg: "bg-indigo-100 text-indigo-800",
  },
  VP: {
    label: "Verb Phrase",
    badgeTone: "amber" as const,
    bg: "bg-amber-50 border-amber-200 text-amber-900",
    pillBg: "bg-amber-100 text-amber-800",
  },
  PP: {
    label: "Prepositional Phrase",
    badgeTone: "rose" as const,
    bg: "bg-rose-50 border-rose-200 text-rose-900",
    pillBg: "bg-rose-100 text-rose-800",
  },
};

export default function ChunkingPage() {
  const { analysis, loading } = useDocument();
  const [selectedType, setSelectedType] = useState<"ALL" | "NP" | "VP" | "PP">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const chunks = analysis?.chunks ?? [];
  const sentences = analysis?.sentences ?? [];

  const npCount = chunks.filter((c) => c.type === "NP").length;
  const vpCount = chunks.filter((c) => c.type === "VP").length;
  const ppCount = chunks.filter((c) => c.type === "PP").length;

  const filteredChunks = chunks.filter((c) => {
    if (selectedType !== "ALL" && c.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return c.text.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
    }
    return true;
  });

  const groupedBySentence = sentences.map((sentence, idx) => ({
    sentence,
    sentenceIndex: idx,
    chunks: chunks.filter((c) => c.sentenceIndex === idx),
  }));

  function handleExport() {
    if (chunks.length === 0) return;
    const jsonStr = JSON.stringify({ chunks, sentenceCount: sentences.length }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chunking-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Practical 7 · Core NLP"
        title="Phrase Chunking / Shallow Parsing"
        description="Extract non-overlapping grammatical constituents (Noun Phrases, Verb Phrases, Prepositional Phrases) using regular expressions over POS-tagged token sequences."
      />

      <ExperimentPlayground moduleTitle="Chunk Analyzer" />

      {loading && !analysis && (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
          <span className="ml-2 text-sm text-slate-500">Extracting grammatical chunks...</span>
        </div>
      )}

      {analysis && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Syntactic Chunks" value={chunks.length} />
            <StatCard label="Noun Phrases (NP)" value={npCount} tone="indigo" />
            <StatCard label="Verb Phrases (VP)" value={vpCount} tone="amber" />
            <StatCard label="Prepositional Phrases (PP)" value={ppCount} tone="rose" />
          </div>

          {/* Sentence-by-Sentence Breakdown Card */}
          <Card>
            <CardHeader
              title="Sentence-by-Sentence Chunk Decomposition"
              subtitle={`Parsed ${sentences.length} sentences across ${chunks.length} constituent phrases`}
              action={
                <SecondaryButton onClick={handleExport} className="text-xs">
                  <Download className="mr-1 h-3.5 w-3.5 inline" /> Export Chunks
                </SecondaryButton>
              }
            />
            <CardBody className="space-y-4">
              <div className="space-y-3">
                {groupedBySentence.map((item, sIdx) => (
                  <div key={sIdx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Sentence {sIdx + 1}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {item.chunks.length} phrases identified
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed mb-3">
                      &quot;{item.sentence}&quot;
                    </p>

                    {item.chunks.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                        {item.chunks.map((chk, cIdx) => {
                          const config = TYPE_CONFIG[chk.type as keyof typeof TYPE_CONFIG] ?? {
                            label: chk.type,
                            bg: "bg-slate-50 border-slate-200 text-slate-800",
                            pillBg: "bg-slate-200 text-slate-800",
                          };
                          return (
                            <div
                              key={cIdx}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs ${config.bg}`}
                            >
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${config.pillBg}`}>
                                {chk.type}
                              </span>
                              <span className="font-semibold">{chk.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No complex phrases recognized in this sentence segment.</p>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Searchable All Chunks List */}
          <Card>
            <CardHeader
              title="All Extracted Phrase Chunks"
              subtitle={`Showing ${filteredChunks.length} of ${chunks.length} total chunks`}
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
                    All ({chunks.length})
                  </button>
                  <button
                    onClick={() => setSelectedType("NP")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedType === "NP" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Noun Phrases ({npCount})
                  </button>
                  <button
                    onClick={() => setSelectedType("VP")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedType === "VP" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Verb Phrases ({vpCount})
                  </button>
                  <button
                    onClick={() => setSelectedType("PP")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedType === "PP" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Prepositional Phrases ({ppCount})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search phrase text..."
                    className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                {filteredChunks.length === 0 ? (
                  <p className="col-span-full py-6 text-center text-xs text-slate-400">
                    No chunk phrases match the search or filter criteria.
                  </p>
                ) : (
                  filteredChunks.map((c, idx) => {
                    const config = TYPE_CONFIG[c.type as keyof typeof TYPE_CONFIG] ?? {
                      label: c.type,
                      bg: "bg-white border-slate-200 text-slate-800",
                      pillBg: "bg-slate-100 text-slate-700",
                    };
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between rounded-xl border p-2.5 text-xs shadow-xs ${config.bg}`}
                      >
                        <span className="font-semibold truncate mr-2">{c.text}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${config.pillBg}`}>
                          {c.type}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

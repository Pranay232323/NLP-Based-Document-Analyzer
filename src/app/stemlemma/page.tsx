"use client";

import { useState, useMemo } from "react";
import { useDocument } from "@/components/document-context";
import { Card, CardBody, CardHeader, SectionHeading, StatCard, Badge, SecondaryButton, Spinner } from "@/components/ui/primitives";
import { ExperimentPlayground } from "@/components/experiment-playground";
import { StepSimulator } from "@/components/ui/step-simulator";
import { generateStemLemmaSimulation } from "@/lib/nlp/simulators";
import { Search, Download, GitCompare, Info } from "lucide-react";

export default function StemLemmaPage() {
  const { analysis, loading } = useDocument();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "stemChanged" | "lemmaChanged" | "divergent">("all");

  const stemLemma = analysis?.stemLemma ?? [];
  const preprocessing = analysis?.preprocessing;

  const simTarget = analysis?.rawText?.slice(0, 160) || "The researchers were studying and analyzing algorithmic systems.";
  const simulation = useMemo(() => generateStemLemmaSimulation(simTarget), [simTarget]);

  const changedByStem = stemLemma.filter((r) => r.stemmed !== r.word).length;
  const changedByLemma = stemLemma.filter((r) => r.lemmatized !== r.word).length;
  const divergent = stemLemma.filter((r) => r.stemmed !== r.lemmatized).length;

  const filteredRows = stemLemma.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matches =
        r.word.toLowerCase().includes(q) ||
        r.stemmed.toLowerCase().includes(q) ||
        r.lemmatized.toLowerCase().includes(q) ||
        r.pos.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filterType === "stemChanged") return r.stemmed !== r.word;
    if (filterType === "lemmaChanged") return r.lemmatized !== r.word;
    if (filterType === "divergent") return r.stemmed !== r.lemmatized;
    return true;
  });

  function handleExport() {
    if (stemLemma.length === 0) return;
    const header = "Word,POS,Stemmed (Porter/Indic),Lemmatized (WordNet/Indic)\n";
    const csvContent =
      "data:text/csv;charset=utf-8," +
      header +
      stemLemma.map((r) => `"${r.word}","${r.pos}","${r.stemmed}","${r.lemmatized}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stemming-vs-lemmatization-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Practical 3 · Core NLP"
        title="Stop Word Removal, Stemming & Lemmatization"
        description="Filter non-informative stop words, strip inflectional affixes via Porter heuristic stemming, and map inflectional variants to valid dictionary base lemmas."
      />

      <ExperimentPlayground moduleTitle="Stemming & Lemmatization" />

      {/* INTERACTIVE ALGORITHM SIMULATOR */}
      <StepSimulator
        title="Visual Stemming vs Lemmatization Simulator"
        subtitle="Watch Porter rule suffix stripping versus morphological dictionary lookup step-by-step"
        tokens={simulation.tokens}
        steps={simulation.steps}
        badgeText="Exp 3 Simulator"
      />

      {loading && !analysis && (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
          <span className="ml-2 text-sm text-slate-500">Processing morphology & stems...</span>
        </div>
      )}

      {analysis && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Content Vocabulary" value={stemLemma.length} />
            <StatCard label="Stop Words Filtered" value={preprocessing?.removedStopwords.length ?? 0} tone="rose" />
            <StatCard label="Modified by Stemmer" value={changedByStem} tone="amber" />
            <StatCard label="Stem vs Lemma Divergent" value={divergent} tone="violet" />
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-indigo-900 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-950 mb-1">
              <Info className="h-4 w-4 text-indigo-600" />
              Linguistic Difference: Heuristic Stemming vs Morphological Lemmatization
            </div>
            <p>
              <strong>Stemming</strong> (Porter algorithm) operates purely on rule-based suffix truncation and often produces non-dictionary stems (e.g., <em>&quot;studies&quot; → &quot;studi&quot;</em>, <em>&quot;computation&quot; → &quot;comput&quot;</em>).
              In contrast, <strong>Lemmatization</strong> utilizes grammatical POS context and morphological vocabulary lookup to yield genuine canonical lemmas (e.g., <em>&quot;running&quot; (VBG) → &quot;run&quot;</em>, <em>&quot;better&quot; (JJR) → &quot;good&quot;</em>).
            </p>
          </div>

          <Card>
            <CardHeader
              title="Stemming vs Lemmatization Comparison Table"
              subtitle={`Showing ${filteredRows.length} of ${stemLemma.length} vocabulary terms`}
              action={
                <SecondaryButton onClick={handleExport} className="text-xs">
                  <Download className="mr-1 h-3.5 w-3.5 inline" /> Export CSV
                </SecondaryButton>
              }
            />
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      filterType === "all" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    All ({stemLemma.length})
                  </button>
                  <button
                    onClick={() => setFilterType("divergent")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      filterType === "divergent" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Stem ≠ Lemma ({divergent})
                  </button>
                  <button
                    onClick={() => setFilterType("stemChanged")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      filterType === "stemChanged" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Stem Changed ({changedByStem})
                  </button>
                  <button
                    onClick={() => setFilterType("lemmaChanged")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      filterType === "lemmaChanged" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Lemma Changed ({changedByLemma})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search words, stems, tags..."
                    className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[550px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <tr className="border-b border-slate-200">
                      <th className="py-2.5 px-4">Original Word</th>
                      <th className="py-2.5 px-4">POS Tag</th>
                      <th className="py-2.5 px-4">Stemmed Form (Porter/Indic)</th>
                      <th className="py-2.5 px-4">Lemmatized Form (WordNet/Indic)</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                          No words found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.slice(0, 150).map((r, idx) => {
                        const isDivergent = r.stemmed !== r.lemmatized;
                        return (
                          <tr key={`${r.word}-${idx}`} className="hover:bg-slate-50/80 transition">
                            <td className="py-2 px-4 font-semibold text-slate-900">{r.word}</td>
                            <td className="py-2 px-4">
                              <Badge tone="slate" className="font-mono text-[11px]">
                                {r.pos || "N/A"}
                              </Badge>
                            </td>
                            <td className="py-2 px-4 font-mono text-amber-700">
                              {r.stemmed}
                            </td>
                            <td className="py-2 px-4 font-mono text-emerald-700 font-medium">
                              {r.lemmatized}
                            </td>
                            <td className="py-2 px-4 text-center">
                              {isDivergent ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                                  <GitCompare className="h-3 w-3" /> Divergent
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400">Identical</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {filteredRows.length > 150 && (
                <p className="text-center text-xs text-slate-400">
                  Showing first 150 entries out of {filteredRows.length}. Use the search box above to locate specific tokens.
                </p>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

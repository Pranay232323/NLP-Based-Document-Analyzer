"use client";

import { useState } from "react";
import { useDocument } from "@/components/document-context";
import { Card, CardBody, CardHeader, SectionHeading, StatCard, SecondaryButton, Spinner, Badge } from "@/components/ui/primitives";
import { ExperimentPlayground } from "@/components/experiment-playground";
import { Search, Download, BarChart2, Hash, BookOpen } from "lucide-react";

const PALETTE = ["#4f46e5", "#7c3aed", "#0ea5e9", "#059669", "#d97706", "#e11d48", "#0891b2", "#2563eb", "#db2777"];

export default function WordCloudPage() {
  const { analysis, loading } = useDocument();
  const [searchQuery, setSearchQuery] = useState("");
  const [minCount, setMinCount] = useState<number>(1);

  const keywords = analysis?.keywords ?? [];
  const meta = analysis?.meta;
  const stats = meta?.stats;

  // Words appearing only once in document (Hapax Legomena)
  const hapaxCount = keywords.filter((k) => k.count === 1).length;

  const filteredKeywords = keywords.filter((k) => {
    if (k.count < minCount) return false;
    if (searchQuery.trim()) {
      return k.word.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }
    return true;
  });

  const maxFreq = keywords.length > 0 ? keywords[0].count : 1;
  const minFreq = keywords.length > 0 ? keywords[keywords.length - 1].count : 1;

  const scaleFont = (count: number) => {
    if (maxFreq === minFreq) return 22;
    return 13 + ((count - minFreq) / (maxFreq - minFreq)) * 36;
  };

  function handleExport() {
    if (keywords.length === 0) return;
    const header = "Rank,Word,Frequency,RelativeFrequency%\n";
    const totalWords = stats?.wordCount || 1;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      header +
      keywords.map((k, i) => `${i + 1},"${k.word}",${k.count},${((k.count / totalWords) * 100).toFixed(2)}%`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `word-frequencies-eda-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Practical 10 · Core NLP"
        title="Word Cloud & Text Exploratory Data Analysis (EDA)"
        description="Visualize salient content vocabulary, analyze Zipfian rank-frequency distributions, and compute corpus statistics (lexical diversity, TTR, hapax legomena)."
      />

      <ExperimentPlayground moduleTitle="Word Cloud & Text Analytics" />

      {loading && !analysis && (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
          <span className="ml-2 text-sm text-slate-500">Computing vocabulary distributions...</span>
        </div>
      )}

      {analysis && stats && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Word Tokens" value={stats.wordCount} />
            <StatCard label="Unique Vocabulary" value={stats.uniqueWordCount} tone="indigo" />
            <StatCard label="Lexical Diversity (TTR)" value={`${(stats.lexicalDiversity * 100).toFixed(1)}%`} tone="emerald" />
            <StatCard label="Hapax Legomena (Freq=1)" value={hapaxCount} tone="amber" />
          </div>

          {/* Interactive Word Cloud Visualizer */}
          <Card>
            <CardHeader
              title="Interactive Visual Word Cloud"
              subtitle="Font sizes dynamically scale with Zipfian frequency in the filtered vocabulary"
              action={
                <SecondaryButton onClick={handleExport} className="text-xs">
                  <Download className="mr-1 h-3.5 w-3.5 inline" /> Export CSV
                </SecondaryButton>
              }
            />
            <CardBody>
              {keywords.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No content words identified.</p>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50/50 to-indigo-50/20 p-8 min-h-[220px]">
                  {keywords.slice(0, 60).map((k, i) => (
                    <span
                      key={k.word}
                      style={{
                        fontSize: `${scaleFont(k.count)}px`,
                        color: PALETTE[i % PALETTE.length],
                        lineHeight: 1.1,
                      }}
                      className="font-bold tracking-tight transition hover:scale-125 cursor-pointer select-none drop-shadow-2xs"
                      title={`"${k.word}": ${k.count} occurrences (${(((k.count / stats.wordCount) * 100).toFixed(1))}%)`}
                    >
                      {k.word}
                    </span>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Rank Frequency Distribution & Search Table */}
          <Card>
            <CardHeader
              title="Zipfian Term Rank-Frequency Table"
              subtitle={`Showing ${filteredKeywords.length} of ${keywords.length} content words`}
            />
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Minimum Count:</span>
                  {[1, 2, 3, 5].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setMinCount(cnt)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        minCount === cnt ? "bg-indigo-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      ≥ {cnt}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vocabulary words..."
                    className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <tr className="border-b border-slate-200">
                      <th className="py-2.5 px-4">Rank</th>
                      <th className="py-2.5 px-4">Vocabulary Word</th>
                      <th className="py-2.5 px-4">Occurrences</th>
                      <th className="py-2.5 px-4">Corpus Share</th>
                      <th className="py-2.5 px-4">Frequency Bar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredKeywords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                          No vocabulary matches the search query.
                        </td>
                      </tr>
                    ) : (
                      filteredKeywords.slice(0, 100).map((k, idx) => {
                        const pct = ((k.count / stats.wordCount) * 100).toFixed(2);
                        return (
                          <tr key={`${k.word}-${idx}`} className="hover:bg-slate-50 transition">
                            <td className="py-2 px-4 font-mono text-xs text-slate-400">#{idx + 1}</td>
                            <td className="py-2 px-4 font-semibold text-slate-900">{k.word}</td>
                            <td className="py-2 px-4 font-semibold text-indigo-700">{k.count}</td>
                            <td className="py-2 px-4 text-xs text-slate-600">{pct}%</td>
                            <td className="py-2 px-4 w-40">
                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-indigo-600 rounded-full"
                                  style={{ width: `${(k.count / maxFreq) * 100}%` }}
                                />
                              </div>
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

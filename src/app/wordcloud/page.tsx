"use client";

import { useDocument } from "@/components/document-context";
import { NoDocumentState } from "@/components/no-document-state";
import { Card, CardBody, CardHeader, SectionHeading, StatCard } from "@/components/ui/primitives";

const PALETTE = ["#4f46e5", "#7c3aed", "#0ea5e9", "#059669", "#d97706", "#e11d48", "#0891b2"];

function WordCloudView({ keywords }: { keywords: { word: string; count: number }[] }) {
  if (keywords.length === 0) return <p className="text-sm text-slate-400">Not enough keyword data to build a word cloud.</p>;
  const max = keywords[0].count;
  const min = keywords[keywords.length - 1].count;
  const scale = (count: number) => {
    if (max === min) return 22;
    return 14 + ((count - min) / (max - min)) * 38;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-8">
      {keywords.map((k, i) => (
        <span
          key={k.word}
          style={{ fontSize: `${scale(k.count)}px`, color: PALETTE[i % PALETTE.length], lineHeight: 1 }}
          className="font-bold transition hover:scale-110"
          title={`${k.word}: ${k.count} occurrences`}
        >
          {k.word}
        </span>
      ))}
    </div>
  );
}

export default function WordCloudPage() {
  const { analysis } = useDocument();

  if (!analysis) {
    return (
      <div className="space-y-6">
        <SectionHeading eyebrow="NLP Tool" title="Word Cloud & Text Analytics" description="Exploratory data analysis of your document's vocabulary." />
        <NoDocumentState moduleName="word cloud analysis" />
      </div>
    );
  }

  const { keywords, meta } = analysis;
  const top10 = keywords.slice(0, 10);
  const top20 = keywords.slice(0, 20);

  return (
    <div className="space-y-6">
      <SectionHeading
eyebrow="NLP Tool"
        title="Exploratory Data Analysis — Word Cloud"
        description="Text is cleaned (lowercased, special characters removed), stop words are removed, and word frequencies are computed to build the cloud below."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Characters" value={meta.stats.charCount} />
        <StatCard label="Words" value={meta.stats.wordCount} />
        <StatCard label="Unique Words" value={meta.stats.uniqueWordCount} />
        <StatCard label="Avg Word Length" value={meta.stats.avgWordLength} />
      </div>

      <Card>
        <CardHeader title="Word Cloud" subtitle="Font size scaled by frequency" />
        <CardBody>
          <WordCloudView keywords={keywords} />
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top 10 Most Frequent Words" />
          <CardBody>
            <ol className="space-y-1.5">
              {top10.map((k, i) => (
                <li key={k.word} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">
                    {i + 1}. {k.word}
                  </span>
                  <span className="font-semibold text-indigo-600">{k.count}</span>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Frequency Table (Top 20)" />
          <CardBody className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4">Word</th>
                  <th className="py-2 pr-4">Count</th>
                  <th className="py-2 pr-4">% of words</th>
                </tr>
              </thead>
              <tbody>
                {top20.map((k) => (
                  <tr key={k.word} className="border-b border-slate-100">
                    <td className="py-1.5 pr-4 font-medium text-slate-800">{k.word}</td>
                    <td className="py-1.5 pr-4 text-slate-600">{k.count}</td>
                    <td className="py-1.5 pr-4 text-slate-500">{k.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Basic Text Statistics" />
        <CardBody>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Sentences" value={meta.stats.sentenceCount} />
            <StatCard label="Avg Sentence Length" value={meta.stats.avgSentenceLength} />
            <StatCard label="Lexical Diversity" value={meta.stats.lexicalDiversity} />
            <StatCard label="Characters (no spaces)" value={meta.stats.charCountNoSpaces} />
            <StatCard label="Avg Word Length" value={meta.stats.avgWordLength} />
            <StatCard label="Script" value={meta.scriptValidation.label} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

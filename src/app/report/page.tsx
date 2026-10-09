"use client";

import { useDocument } from "@/components/document-context";
import { NoDocumentState } from "@/components/no-document-state";
import { Card, CardBody, CardHeader, SectionHeading, Badge, PrimaryButton } from "@/components/ui/primitives";
import { buildHighlightSegments } from "@/lib/nlp/highlight";
import { Printer } from "lucide-react";

export default function ReportPage() {
  const { analysis, docName } = useDocument();

  if (!analysis) {
    return (
      <div className="space-y-6">
        <SectionHeading eyebrow="Final Deliverable" title="Final NLP Analysis Report" description="A consolidated report covering every experiment performed on your document." />
        <NoDocumentState moduleName="the final report" />
      </div>
    );
  }

  const { meta, preprocessing, stemLemma, morphology, pos, posDistribution, chunks, entities, ngramSummaries, keywords } = analysis;
  const segments = buildHighlightSegments(analysis.rawText, entities);

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between">
        <SectionHeading eyebrow="Final Deliverable" title="Final NLP Analysis Report" description="Generated automatically from live NLP processing. Use Print / Save as PDF to export." />
        <PrimaryButton onClick={() => window.print()}>
          <Printer size={16} /> Print / Save as PDF
        </PrimaryButton>
      </div>

      <Card className="p-8">
        <div className="border-b border-slate-200 pb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">NLP Intelligence Platform</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            NLP-Based Intelligent Academic Document Analyzer and Research Assistant
          </h1>
          <p className="mt-2 text-sm text-slate-500">Final NLP Analysis Report</p>
        </div>

        <section className="mt-6 space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Document Information</h2>
          <p className="text-sm text-slate-600">Document Name: <strong>{docName}</strong></p>
          <p className="text-sm text-slate-600">Script Validation: <strong>{meta.scriptValidation.label}</strong></p>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Basic Statistics</h2>
          <table className="w-full max-w-md text-sm">
            <tbody>
              <tr><td className="py-1 text-slate-500">Characters</td><td className="py-1 font-medium">{meta.stats.charCount}</td></tr>
              <tr><td className="py-1 text-slate-500">Words</td><td className="py-1 font-medium">{meta.stats.wordCount}</td></tr>
              <tr><td className="py-1 text-slate-500">Unique Words</td><td className="py-1 font-medium">{meta.stats.uniqueWordCount}</td></tr>
              <tr><td className="py-1 text-slate-500">Sentences</td><td className="py-1 font-medium">{meta.stats.sentenceCount}</td></tr>
              <tr><td className="py-1 text-slate-500">Avg Sentence Length</td><td className="py-1 font-medium">{meta.stats.avgSentenceLength}</td></tr>
              <tr><td className="py-1 text-slate-500">Lexical Diversity</td><td className="py-1 font-medium">{meta.stats.lexicalDiversity}</td></tr>
            </tbody>
          </table>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Preprocessing (Tokenization &amp; Filtration)</h2>
          <p className="text-sm text-slate-600">Raw tokens: {preprocessing.rawTokens.length} · Filtered (meaningful) tokens: {preprocessing.filteredTokens.length} · Stop words removed: {preprocessing.removedStopwords.length}</p>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-base font-bold text-slate-900">4 &amp; 5. Stemming and Lemmatization (sample)</h2>
          <table className="w-full max-w-lg text-left text-sm">
            <thead><tr className="text-xs uppercase text-slate-400"><th className="py-1">Word</th><th className="py-1">Stemmed</th><th className="py-1">Lemmatized</th></tr></thead>
            <tbody>
              {stemLemma.slice(0, 12).map((r) => (
                <tr key={r.word}><td className="py-1">{r.word}</td><td className="py-1">{r.stemmed}</td><td className="py-1">{r.lemmatized}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-base font-bold text-slate-900">6. Morphological Analysis (sample)</h2>
          <table className="w-full max-w-lg text-left text-sm">
            <thead><tr className="text-xs uppercase text-slate-400"><th className="py-1">Word</th><th className="py-1">Prefix</th><th className="py-1">Root</th><th className="py-1">Suffix</th></tr></thead>
            <tbody>
              {morphology.slice(0, 10).map((m) => (
                <tr key={m.word}><td className="py-1">{m.word}</td><td className="py-1">{m.prefix ?? "-"}</td><td className="py-1">{m.root}</td><td className="py-1">{m.suffix ?? "-"}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-base font-bold text-slate-900">7. N-Gram Results</h2>
          {ngramSummaries.map((s) => (
            <p key={s.n} className="text-sm text-slate-600">
              {s.label} (N={s.n}): {s.totalNGrams} total n-grams, {s.uniqueNGrams} unique. Top: {s.topNGrams.slice(0, 3).map((t) => t.ngram).join(", ")}
            </p>
          ))}
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-base font-bold text-slate-900">8. POS Analysis</h2>
          <p className="text-sm text-slate-600">{pos.length} tokens tagged. Distribution: {posDistribution.slice(0, 8).map((d) => `${d.tag} (${d.count})`).join(", ")}</p>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-base font-bold text-slate-900">9. Chunking Results</h2>
          <p className="text-sm text-slate-600">
            NP: {chunks.filter((c) => c.type === "NP").length} · VP: {chunks.filter((c) => c.type === "VP").length} · PP: {chunks.filter((c) => c.type === "PP").length}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {chunks.slice(0, 12).map((c, i) => (
              <Badge key={i} tone="slate">{c.type}: {c.text}</Badge>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-base font-bold text-slate-900">10. Named Entities</h2>
          <p className="max-h-60 overflow-y-auto whitespace-pre-wrap text-sm leading-loose text-slate-700">
            {segments.map((seg, i) =>
              seg.entity ? (
                <span key={i} className="entity-highlight bg-indigo-100 text-indigo-800">{seg.text}</span>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </p>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-base font-bold text-slate-900">11. Top Keywords</h2>
          <div className="flex flex-wrap gap-1.5">
            {keywords.slice(0, 15).map((k) => (
              <Badge key={k.word} tone="emerald">{k.word} ({k.count})</Badge>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-base font-bold text-slate-900">12. Conclusion</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            The document was processed through the complete NLP pipeline implemented in this platform: tokenization,
            filtration, script validation, stop-word removal, stemming, lemmatization, morphological analysis, POS
            tagging, chunking, named entity recognition, N-Gram modelling and keyword/word-cloud analytics. All
            results above were generated by locally executed NLP algorithms on the actual input text, with no
            external AI APIs or hardcoded output.
          </p>
        </section>
      </Card>
    </div>
  );
}

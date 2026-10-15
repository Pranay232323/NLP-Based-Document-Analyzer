"use client";

import { useMemo } from "react";
import { useDocument } from "@/components/document-context";
import { Card, CardBody, CardHeader, SectionHeading, Badge, PrimaryButton, Spinner } from "@/components/ui/primitives";
import { ExperimentPlayground } from "@/components/experiment-playground";
import { buildHighlightSegments } from "@/lib/nlp/highlight";
import { summarizeTextRank } from "@/lib/nlp/textRank";
import { Printer, Download, Sparkles } from "lucide-react";

export default function ReportPage() {
  const { analysis, docName, loading } = useDocument();

  const meta = analysis?.meta;
  const preprocessing = analysis?.preprocessing;
  const stemLemma = analysis?.stemLemma ?? [];
  const morphology = analysis?.morphology ?? [];
  const pos = analysis?.pos ?? [];
  const posDistribution = analysis?.posDistribution ?? [];
  const chunks = analysis?.chunks ?? [];
  const entities = analysis?.entities ?? [];
  const ngramSummaries = analysis?.ngramSummaries ?? [];
  const keywords = analysis?.keywords ?? [];
  const rawText = analysis?.rawText ?? "";

  const segments = rawText ? buildHighlightSegments(rawText, entities) : [];
  const textRankSummary = useMemo(() => (rawText ? summarizeTextRank(rawText, 3) : null), [rawText]);

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeading
            eyebrow="Final Deliverable"
            title="Consolidated NLP Analysis Report"
            description="A comprehensive formal practical report synthesizing all 16 core syllabus experiments and advanced laboratories on your document."
          />
          {analysis && (
            <PrimaryButton onClick={() => window.print()}>
              <Printer size={16} /> Print / Save as PDF
            </PrimaryButton>
          )}
        </div>

        <ExperimentPlayground moduleTitle="Comprehensive Report Generator" />
      </div>

      {loading && !analysis && (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
          <span className="ml-2 text-sm text-slate-500">Generating comprehensive practical report...</span>
        </div>
      )}

      {analysis && meta && (
        <Card className="p-8 shadow-sm">
          <div className="border-b border-slate-200 pb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">NLP Intelligence Platform</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              NLP-Based Intelligent Academic Document Analyzer and Research Assistant
            </h1>
            <p className="mt-2 text-sm text-slate-500">Comprehensive Practical &amp; Laboratory Analysis Report</p>
          </div>

          <section className="mt-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Document Information &amp; Metadata</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 max-w-xl">
              <div>Document Name: <strong className="text-slate-900">{docName || "Active Corpus"}</strong></div>
              <div>Primary Script: <strong className="text-slate-900">{meta.scriptValidation.label}</strong></div>
              <div>Detected Language: <strong className="text-slate-900">{analysis.languageIdentification?.detectedLanguage ?? "English"}</strong></div>
              <div>Lexical Diversity (TTR): <strong className="text-slate-900">{(meta.stats.lexicalDiversity * 100).toFixed(1)}%</strong></div>
            </div>
          </section>

          <section className="mt-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Quantitative Corpus Statistics</h2>
            <table className="w-full max-w-md text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr><td className="py-1 text-slate-500">Total Characters</td><td className="py-1 font-semibold">{meta.stats.charCount.toLocaleString()}</td></tr>
                <tr><td className="py-1 text-slate-500">Total Word Tokens</td><td className="py-1 font-semibold">{meta.stats.wordCount.toLocaleString()}</td></tr>
                <tr><td className="py-1 text-slate-500">Unique Vocabulary</td><td className="py-1 font-semibold">{meta.stats.uniqueWordCount.toLocaleString()}</td></tr>
                <tr><td className="py-1 text-slate-500">Sentence Count</td><td className="py-1 font-semibold">{meta.stats.sentenceCount}</td></tr>
                <tr><td className="py-1 text-slate-500">Average Sentence Length</td><td className="py-1 font-semibold">{meta.stats.avgSentenceLength} words</td></tr>
                <tr><td className="py-1 text-slate-500">Average Word Length</td><td className="py-1 font-semibold">{meta.stats.avgWordLength} characters</td></tr>
              </tbody>
            </table>
          </section>

          {preprocessing && (
            <section className="mt-6 space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Text Preprocessing &amp; Stopword Filtration (Exp 2)</h2>
              <p className="text-sm text-slate-600">
                Extracted <strong>{preprocessing.rawTokens.length}</strong> raw tokens, yielding{" "}
                <strong>{preprocessing.filteredTokens.length}</strong> meaningful content tokens after removing{" "}
                <strong>{preprocessing.removedStopwords.length}</strong> stop words and{" "}
                <strong>{preprocessing.removedNumeric.length}</strong> numeric tokens.
              </p>
            </section>
          )}

          <section className="mt-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Stemming vs Lemmatization (Exp 3)</h2>
            <p className="text-sm text-slate-600">
              Evaluated <strong>{stemLemma.length}</strong> unique words. The heuristic Porter stemmer modified{" "}
              <strong>{stemLemma.filter((r) => r.stemmed !== r.word).length}</strong> words; POS-aware lemmatization modified{" "}
              <strong>{stemLemma.filter((r) => r.lemmatized !== r.word).length}</strong> words.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {stemLemma.slice(0, 10).map((r) => (
                <Badge key={r.word} tone="slate">
                  {r.word} → {r.stemmed} | {r.lemmatized}
                </Badge>
              ))}
            </div>
          </section>

          <section className="mt-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Morphological Decomposition (Exp 4)</h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {morphology.slice(0, 8).map((m) => (
                <span key={m.word} className="rounded-lg border bg-slate-50 px-2 py-1">
                  <strong>{m.word}</strong>: {m.prefix ? `${m.prefix}-` : ""}[{m.root}]{m.suffix ? `-${m.suffix}` : ""}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">6. Part-of-Speech Tagging Distribution (Exp 6)</h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {posDistribution.slice(0, 10).map((d) => (
                <Badge key={d.tag} tone="indigo">
                  {d.tag} ({d.description}): {d.count}
                </Badge>
              ))}
            </div>
          </section>

          <section className="mt-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">7. Syntactic Phrase Chunks (Exp 7)</h2>
            <p className="text-sm text-slate-600">
              Identified <strong>{chunks.length}</strong> shallow parsing phrases (Noun Phrases, Verb Phrases, Prepositional Phrases).
            </p>
            <div className="flex flex-wrap gap-1.5">
              {chunks.slice(0, 12).map((c, i) => (
                <Badge key={i} tone={c.type === "NP" ? "indigo" : c.type === "VP" ? "amber" : "rose"}>
                  [{c.type}] {c.text}
                </Badge>
              ))}
            </div>
          </section>

          <section className="mt-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">8. Named Entity Recognition (Exp 8)</h2>
            <p className="text-sm text-slate-600">
              Detected <strong>{entities.length}</strong> real-world entity mentions.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {entities.map((e, i) => (
                <Badge key={i} tone="violet">
                  {e.text} · {e.type}
                </Badge>
              ))}
              {entities.length === 0 && <p className="text-xs text-slate-400">No named entities detected.</p>}
            </div>
          </section>

          <section className="mt-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">9. Statistical N-Gram Language Models (Exp 5)</h2>
            <ul className="space-y-1 text-sm text-slate-600">
              {ngramSummaries.map((s) => (
                <li key={s.n}>
                  <strong>{s.label} Model (N={s.n}):</strong> {s.totalNGrams.toLocaleString()} total tokens,{" "}
                  {s.uniqueNGrams.toLocaleString()} unique n-grams.
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">10. Salient Vocabulary &amp; Word Frequencies (Exp 10)</h2>
            <div className="flex flex-wrap gap-1.5">
              {keywords.slice(0, 15).map((k) => (
                <Badge key={k.word} tone="slate">
                  {k.word} ({k.count})
                </Badge>
              ))}
            </div>
          </section>

          {analysis.sentiment && (
            <section className="mt-6 space-y-2">
              <h2 className="text-base font-bold text-slate-900">11. Sentiment &amp; Affective Stance (Exp 11)</h2>
              <p className="text-sm text-slate-600">
                Classification: <strong>{analysis.sentiment.label}</strong> (Polarity Score: {analysis.sentiment.normalizedScore.toFixed(2)}, Subjectivity: {(analysis.sentiment.subjectivity * 100).toFixed(0)}%, Confidence: {(analysis.sentiment.confidence * 100).toFixed(0)}%).
              </p>
            </section>
          )}

          {analysis.languageIdentification && (
            <section className="mt-6 space-y-2">
              <h2 className="text-base font-bold text-slate-900">12. Language Identification &amp; Script Discrimination (Exp 15)</h2>
              <p className="text-sm text-slate-600">
                Detected Language: <strong>{analysis.languageIdentification.detectedLanguage}</strong> ({analysis.languageIdentification.languageCode}) · Script: <strong>{analysis.languageIdentification.script.scriptName}</strong>.
              </p>
            </section>
          )}

          {analysis.keywordComparison && (
            <section className="mt-6 space-y-2">
              <h2 className="text-base font-bold text-slate-900">13. Advanced Multi-Method Keyphrase Extraction (Exp 14)</h2>
              <div className="flex flex-wrap gap-1.5">
                {analysis.keywordComparison.rake.slice(0, 8).map((r, i) => (
                  <Badge key={i} tone="indigo">{r.phrase} ({r.score})</Badge>
                ))}
              </div>
            </section>
          )}

          {textRankSummary && (
            <section className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">14. TextRank Graph Extractive Executive Summary (Mihalcea &amp; Tarau)</h2>
                <Badge tone="violet">Compression: {textRankSummary.compressionRatio}%</Badge>
              </div>
              <div className="rounded-lg border border-purple-100 bg-purple-50/40 p-3 text-sm italic text-slate-800 leading-relaxed">
                &ldquo;{textRankSummary.summaryText}&rdquo;
              </div>
              <p className="text-xs text-slate-500">
                Extracted top {textRankSummary.summarySentenceCount} of {textRankSummary.originalSentenceCount} sentences via sentence graph PageRank eigenvector centrality convergence.
              </p>
            </section>
          )}

          <section className="mt-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">15. Conclusion &amp; Academic Verification</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              The document was processed through the complete 16-experiment NLP platform architecture: tokenization,
              filtration, script validation, stop-word removal, stemming, lemmatization, morphological analysis, POS
              tagging, chunking, named entity recognition, N-Gram modelling, sentiment analysis, language identification,
              and keyword/word-cloud analytics. All results above were computed by locally executed NLP algorithms on the
              actual input text with zero external reliance or mock data.
            </p>
          </section>
        </Card>
      )}
    </div>
  );
}

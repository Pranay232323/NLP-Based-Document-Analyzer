"use client";

import { useState, useEffect, useMemo } from "react";
import { useDocument } from "@/components/document-context";
import {
  Card,
  CardBody,
  CardHeader,
  SectionHeading,
  Badge,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  Spinner,
} from "@/components/ui/primitives";
import { ExperimentPlayground } from "@/components/experiment-playground";
import {
  compareKeywordMethods,
  type KeywordExtractionComparison,
} from "@/lib/nlp/keywords";
import { AlertCircle, Download, Search, CheckCircle2 } from "lucide-react";

const SAMPLE_ENGLISH_TEXT = `Natural language processing is an interdisciplinary subfield of computer science and artificial intelligence. It is primarily concerned with the interactions between computers and human language, in particular how to program computers to process and analyze large amounts of natural language data. The goal is a computer capable of understanding the contents of documents, including the contextual nuances of the language within them. The technology can then accurately extract information and insights contained in the documents as well as categorize and organize the documents themselves. Challenges in natural language processing frequently involve speech recognition, natural-language understanding, and natural-language generation.`;

const SAMPLE_HINDI_TEXT = `प्राकृतिक भाषा प्रसंस्करण (NLP) और कृत्रिम बुद्धिमत्ता (AI) आधुनिक कंप्यूटर विज्ञान का एक महत्वपूर्ण क्षेत्र है। यह तकनीक पाठ वर्गीकरण, भावना विश्लेषण, सूचना निष्कर्षण और दस्तावेज़ सारांशीकरण में अत्यंत प्रभावी भूमिका निभाती है। डीप लर्निंग मॉडल और न्यूरल नेटवर्क की सहायता से कंप्यूटर जटिल भाषाई संरचनाओं और व्याकरणिक नियमों को सहजता से समझ सकते हैं।`;

const SAMPLE_MARATHI_TEXT = `नैसर्गिक भाषा प्रक्रिया आणि संगणकीय भाषाशास्त्र मानवी भाषेचे विश्लेषण करण्यासाठी प्रगत अल्गोरिदम वापरतात. यामुळे माहिती संकलन, मजकूर वर्गीकरण आणि भावना विश्लेषण अधिक अचूक बनते. आधुनिक तंत्रज्ञान आणि मशीन लर्निंग मॉडेल्समुळे विविध भाषांमधील भाषिक डेटा सहजपणे प्रक्रिया करणे शक्य झाले आहे.`;

export default function KeywordsPage() {
  const { analysis, rawText, docName } = useDocument();
  const [inputText, setInputText] = useState(
    () => rawText || SAMPLE_ENGLISH_TEXT
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const [result, setResult] = useState<KeywordExtractionComparison>(() => {
    if (analysis?.keywordComparison) {
      return analysis.keywordComparison;
    }
    const textToExtract = rawText || SAMPLE_ENGLISH_TEXT;
    return compareKeywordMethods(textToExtract);
  });

  function runExtract(textToExtract: string) {
    if (!textToExtract.trim()) {
      setError("Please paste text or load a document to extract keywords.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Execute robustly via direct library evaluation
      const comparison = compareKeywordMethods(textToExtract);
      setResult(comparison);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Keyword extraction failed.");
    } finally {
      setLoading(false);
    }
  }

  // Sync when active document changes
  useEffect(() => {
    if (rawText) {
      setInputText(rawText);
      runExtract(rawText);
    }
  }, [rawText]);

  function handleLoadPreset(text: string) {
    setInputText(text);
    runExtract(text);
  }

  function handleExtract() {
    const textToUse = inputText.trim() || rawText || SAMPLE_ENGLISH_TEXT;
    runExtract(textToUse);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keywords-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const headers = ["Algorithm", "KeywordOrPhrase", "Score"];
    const rows: (string | number)[][] = [];

    result.rake.forEach((r) => rows.push(["RAKE", `"${r.phrase}"`, r.score]));
    result.tfidf.forEach((t) => rows.push(["TF-IDF", `"${t.phrase}"`, t.score]));
    result.nounPhrases.forEach((n) => rows.push(["NounPhrase", `"${n.phrase}"`, n.score]));
    result.termFrequency.forEach((tf) => rows.push(["TermFrequency", `"${tf.phrase}"`, tf.score]));

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keywords-comparison-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filterList = (list: { phrase: string; score: number }[]) => {
    if (!searchFilter.trim()) return list;
    const q = searchFilter.toLowerCase();
    return list.filter((item) => item.phrase.toLowerCase().includes(q));
  };

  const filteredRake = useMemo(() => filterList(result.rake), [result.rake, searchFilter]);
  const filteredTfidf = useMemo(() => filterList(result.tfidf), [result.tfidf, searchFilter]);
  const filteredNoun = useMemo(() => filterList(result.nounPhrases), [result.nounPhrases, searchFilter]);
  const filteredTf = useMemo(() => filterList(result.termFrequency), [result.termFrequency, searchFilter]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Advanced NLP Lab · Exp 14"
        title="Keyword & Keyphrase Extraction"
        description="Performs multi-algorithm comparative keyword extraction: Raw Term Frequency, Sentence-level TF-IDF, RAKE (Rapid Automatic Keyword Extraction), and Grammatical Noun Phrases across English, Hindi, and Marathi."
      />

      {/* GLOBAL INTERACTIVE PLAYGROUND */}
      <ExperimentPlayground
        moduleTitle="Exp 14 · Keywords Extraction"
        placeholder="Type or paste any text in English, Hindi, or Marathi to compare keyword extraction algorithms..."
        onAnalyzeComplete={() => {
          if (rawText) {
            setInputText(rawText);
            runExtract(rawText);
          }
        }}
      />

      {/* INPUT AREA */}
      <Card>
        <CardHeader
          title="Input Document & Extraction Controls"
          subtitle="Extract and contrast keywords from any custom text or multilingual samples"
          action={
            <div className="flex items-center gap-2">
              <SecondaryButton onClick={exportJSON} className="text-xs">
                <Download size={13} className="mr-1" />
                JSON
              </SecondaryButton>
              <SecondaryButton onClick={exportCSV} className="text-xs">
                <Download size={13} className="mr-1" />
                CSV
              </SecondaryButton>
            </div>
          }
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Multilingual Presets:</span>
            <button
              type="button"
              onClick={() => handleLoadPreset(SAMPLE_ENGLISH_TEXT)}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              English NLP
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset(SAMPLE_HINDI_TEXT)}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Hindi AI (हिंदी)
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset(SAMPLE_MARATHI_TEXT)}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Marathi Tech (मराठी)
            </button>
          </div>

          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste document text in any language..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words · {inputText.length} characters
            </span>
            {docName && (
              <span className="truncate max-w-xs text-slate-400">
                Active context: {docName}
              </span>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <PrimaryButton onClick={handleExtract} disabled={loading}>
              {loading ? <Spinner size={14} /> : "Extract & Compare Keywords"}
            </PrimaryButton>
            <SecondaryButton onClick={() => setInputText("")}>Clear</SecondaryButton>
          </div>
        </CardBody>
      </Card>

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Analyzed Words" value={result.wordCount} />
        <StatCard label="RAKE Phrases Extracted" value={result.rake.length} tone="indigo" />
        <StatCard label="TF-IDF Keywords" value={result.tfidf.length} tone="violet" />
        <StatCard
          label="Algorithm Agreement"
          value={`${result.agreementScore}%`}
          tone="emerald"
        />
      </div>

      {/* SEARCH FILTER */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter extracted keywords across all 4 algorithms..."
          className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* COMPARATIVE 4-COLUMN GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* RAKE */}
        <Card className="p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">RAKE Algorithm</h3>
            <Badge tone="indigo">Co-occurrence</Badge>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">deg(w)/freq(w) graph score</p>
          <div className="mt-3 space-y-1.5">
            {filteredRake.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="truncate font-medium text-slate-800">{item.phrase}</span>
                <span className="font-mono text-slate-500">{item.score}</span>
              </div>
            ))}
            {filteredRake.length === 0 && (
              <p className="text-xs text-slate-400 italic">No matches.</p>
            )}
          </div>
        </Card>

        {/* TF-IDF */}
        <Card className="p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Sentence TF-IDF</h3>
            <Badge tone="violet">Discriminative</Badge>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">TF * log(N/DF) across sentences</p>
          <div className="mt-3 space-y-1.5">
            {filteredTfidf.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="truncate font-medium text-slate-800">{item.phrase}</span>
                <span className="font-mono text-slate-500">{item.score}</span>
              </div>
            ))}
            {filteredTfidf.length === 0 && (
              <p className="text-xs text-slate-400 italic">No matches.</p>
            )}
          </div>
        </Card>

        {/* NOUN PHRASES */}
        <Card className="p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Noun Phrases</h3>
            <Badge tone="sky">Grammar / POS</Badge>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">&lt;JJ&gt;* &lt;NN+&gt; chunk matches</p>
          <div className="mt-3 space-y-1.5">
            {filteredNoun.length > 0 ? (
              filteredNoun.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="truncate font-medium text-slate-800">{item.phrase}</span>
                  <span className="font-mono text-slate-500">{item.score}x</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No matches.</p>
            )}
          </div>
        </Card>

        {/* TERM FREQUENCY */}
        <Card className="p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Term Frequency</h3>
            <Badge tone="slate">Raw Count</Badge>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Filtered non-stopword occurrence</p>
          <div className="mt-3 space-y-1.5">
            {filteredTf.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="truncate font-medium text-slate-800">{item.phrase}</span>
                <span className="font-mono text-slate-500">{item.score}x</span>
              </div>
            ))}
            {filteredTf.length === 0 && (
              <p className="text-xs text-slate-400 italic">No matches.</p>
            )}
          </div>
        </Card>
      </div>

      {/* EDUCATIONAL EXPLANATIONS */}
      <Card>
        <CardHeader
          title="Algorithm Comparison & Theory"
          subtitle="Why different NLP algorithms return distinct keywords"
        />
        <CardBody className="space-y-3 text-xs text-slate-600">
          <div className="rounded-lg bg-slate-50 p-3 leading-relaxed">
            <span className="font-semibold text-slate-800">Core Comparative Insight: </span>
            {result.explanation.comparisonRationale}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-100 p-3">
              <span className="font-semibold text-indigo-700">RAKE Methodology: </span>
              {result.explanation.rakeExplanation}
            </div>
            <div className="rounded-lg border border-slate-100 p-3">
              <span className="font-semibold text-violet-700">TF-IDF Methodology: </span>
              {result.explanation.tfidfExplanation}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

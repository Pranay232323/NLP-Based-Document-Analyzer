"use client";

import { useState, useEffect } from "react";
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
  runTopicModeling,
  extractParagraphsOrSentences,
  type TopicModelingResult,
} from "@/lib/nlp/topicModeling";
import { AlertCircle, Layers, Info, Download, Sparkles } from "lucide-react";

const SAMPLE_ENGLISH_CORPUS = [
  "Artificial intelligence and deep neural networks are transforming automated language translation and natural language processing.",
  "Computer vision algorithms analyze high-resolution satellite imagery to monitor agricultural crop health and deforestation.",
  "The national parliamentary election witnessed historic voter turnout as citizens debated economic policies and constitutional reform.",
  "Diplomatic negotiations at the global summit focused on international trade treaties and climate change commitments.",
  "Astronomers detected electromagnetic radiation from distant galaxies using advanced radio telescope arrays in Chile.",
  "Molecular biologists investigated enzyme kinetics and CRISPR DNA editing mechanisms to cure hereditary genetic diseases.",
];

const SAMPLE_HINDI_CORPUS = [
  "आर्टिफिशियल इंटेलिजेंस और मशीन लर्निंग आधुनिक कंप्यूटर विज्ञान तथा डेटा विश्लेषण का मुख्य आधार हैं।",
  "प्राकृतिक भाषा प्रसंस्करण के माध्यम से कंप्यूटर मानव भाषा को समझकर स्वचालित अनुवाद करने में सक्षम बनते हैं।",
  "जलवायु परिवर्तन और बढ़ते वैश्विक तापमान से कृषि पैदावार तथा पर्यावरण संतुलन पर गंभीर प्रतिकूल प्रभाव पड़ रहा है।",
  "नवीकरणीय सौर ऊर्जा और पवन ऊर्जा के विस्तार से प्रदूषण कम करने में भारी सहायता मिल रही है।",
  "भारतीय अंतरिक्ष अनुसंधान संगठन (इसरो) ने चंद्रयान और मंगलयान अभियानों के जरिए विश्व भर में ऐतिहासिक सफलता अर्जित की है।",
  "खगोलविदों ने सुदूर अंतरिक्ष में नए तारों और आकाशगंगाओं के रहस्यों को समझने के लिए शक्तिशाली दूरबीनों का उपयोग किया।",
];

const SAMPLE_MARATHI_CORPUS = [
  "नैसर्गिक भाषा प्रक्रिया आणि संगणकीय भाषाशास्त्र मानवी भाषेचे सखोल विश्लेषण करण्यासाठी प्रगत अल्गोरिदम वापरतात.",
  "कृत्रिम बुद्धिमत्ता आणि स्वयंचलित रोबोटिक्स विविध औद्योगिक क्षेत्रांमध्ये उत्पादकता व कार्यक्षमता वेगाने वाढवत आहेत.",
  "हवामान बदल आणि दुष्काळामुळे शेती क्षेत्रात आधुनिक जलसंधारण व तंत्रज्ञानाची तातडीची गरज निर्माण झाली आहे.",
  "पर्यावरण संवर्धन आणि वृक्षारोपण मोहिमांमुळे ग्रामीण भागात जैवविविधता टिकून राहण्यास मोलाची मदत होत आहे.",
  "जागतिक व्यापार करार आणि वित्तीय धोरणे आंतरराष्ट्रीय स्तरावर देशांच्या विकासाला व रोजगाराला नवी दिशा देतात.",
  "अर्थशास्त्रीय सुधारणा आणि बँकिंग क्षेत्रातील डिजिटलायझेशनमुळे सामान्य नागरिकांना पारदर्शक आर्थिक सेवा मिळतात.",
];

export default function TopicModelingPage() {
  const { analysis, rawText, docName } = useDocument();
  const [numTopics, setNumTopics] = useState(3);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<TopicModelingResult>(() => {
    if (analysis?.rawText) {
      const docs = extractParagraphsOrSentences(analysis.rawText);
      if (docs.length >= 2) {
        return runTopicModeling(docs, 3);
      }
    }
    return runTopicModeling(SAMPLE_ENGLISH_CORPUS, 3);
  });

  useEffect(() => {
    if (rawText) {
      const docs = extractParagraphsOrSentences(rawText);
      if (docs.length >= 2) {
        setInputText(rawText);
        setResult(runTopicModeling(docs, numTopics));
        setError(null);
      }
    }
  }, [rawText, numTopics]);

  function handleLoadCorpus(corpus: string[], label: string) {
    setInputText(corpus.join("\n\n"));
    setError(null);
    setResult(runTopicModeling(corpus, numTopics));
  }

  function handleRun() {
    setError(null);
    let docs: string[] = [];
    if (inputText.trim()) {
      docs = extractParagraphsOrSentences(inputText.trim());
    } else if (rawText) {
      docs = extractParagraphsOrSentences(rawText);
    } else {
      docs = SAMPLE_ENGLISH_CORPUS;
    }

    if (docs.length < 2) {
      setError("Please provide at least 2 distinct paragraphs or sentences for topic modeling.");
      return;
    }

    setLoading(true);
    try {
      const res = runTopicModeling(docs, numTopics);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Topic modeling failed.");
    } finally {
      setLoading(false);
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `topic-modeling-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const headers = ["TopicID", "Label", "Coherence", "TopTerms"];
    const rows = result.topics.map((t) => [
      t.id,
      `"${t.label.replace(/"/g, '""')}"`,
      t.coherenceScore,
      `"${t.topTerms.map((item) => `${item.term} (${item.weight})`).join(", ")}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `topics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Advanced NLP Lab · Exp 13"
        title="Unsupervised Topic Modelling"
        description="Discovers latent thematic topics across document paragraphs or multi-domain text collections using TF-IDF co-occurrence factorisation. Computes term weights and document-to-topic distributions in English, Hindi, and Marathi."
      />

      {/* GLOBAL INTERACTIVE PLAYGROUND */}
      <ExperimentPlayground
        moduleTitle="Exp 13 · Topic Modelling"
        placeholder="Paste multiple paragraphs in English, Hindi, or Marathi to discover latent topics..."
        onAnalyzeComplete={() => {
          if (rawText) {
            const docs = extractParagraphsOrSentences(rawText);
            if (docs.length >= 2) {
              setInputText(rawText);
              setResult(runTopicModeling(docs, numTopics));
            }
          }
        }}
      />

      {/* CONTROLS & INPUT */}
      <Card>
        <CardHeader
          title="Topic Discovery Parameters & Corpus"
          subtitle="Configure topic count (K) and provide custom document paragraphs"
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Number of Topics (K):</label>
              <div className="mt-1 flex gap-2">
                {[2, 3, 4, 5].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setNumTopics(k);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      numTopics === k
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    K = {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Multilingual Presets:</span>
              <button
                type="button"
                onClick={() => handleLoadCorpus(SAMPLE_ENGLISH_CORPUS, "English Science & Tech")}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                English Multi-Domain
              </button>
              <button
                type="button"
                onClick={() => handleLoadCorpus(SAMPLE_HINDI_CORPUS, "Hindi Science & Nature")}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                Hindi Thematic (हिंदी)
              </button>
              <button
                type="button"
                onClick={() => handleLoadCorpus(SAMPLE_MARATHI_CORPUS, "Marathi Tech & Economy")}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                Marathi Thematic (मराठी)
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste multiple paragraphs separated by blank lines (or leave blank to use active document)..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {inputText.trim() ? extractParagraphsOrSentences(inputText).length : 0} paragraphs/sentences detected
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
            <PrimaryButton onClick={handleRun} disabled={loading}>
              {loading ? <Spinner size={14} /> : "Run Topic Modelling"}
            </PrimaryButton>
            <SecondaryButton onClick={() => setInputText("")}>Clear</SecondaryButton>
          </div>
        </CardBody>
      </Card>

      {/* RESULTS DISPLAY */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Discovered Topics (K)" value={result.numTopics} tone="indigo" />
            <StatCard label="Analyzed Document Units" value={result.numDocuments} tone="sky" />
            <StatCard label="Vocabulary Features" value={result.vocabularySize} tone="violet" />
          </div>

          {/* TOPIC CARDS GRID */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.topics.map((topic) => (
              <Card key={topic.id} className="p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm font-bold text-slate-900">{topic.label}</span>
                  <Badge tone="indigo">Topic {topic.id}</Badge>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Top Weighted Terms:
                  </p>
                  <div className="space-y-1.5">
                    {topic.topTerms.map((t) => (
                      <div key={t.term} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{t.term}</span>
                        <span className="font-mono text-slate-500">{t.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  Coherence indicator: <span className="font-semibold text-slate-800">{topic.coherenceScore}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* DOCUMENT-TO-TOPIC DISTRIBUTION TABLE */}
          <Card>
            <CardHeader
              title="Document-to-Topic Distributions"
              subtitle="Dominant topic assignments and mixture weights per text unit"
            />
            <CardBody className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-3">Doc #</th>
                    <th className="py-2 pr-4">Snippet Preview</th>
                    <th className="py-2 pr-3">Dominant Topic</th>
                    <th className="py-2 pr-3">Topic Weight</th>
                    <th className="py-2 pr-3">Topic Mixture Breakdown</th>
                  </tr>
                </thead>
                <tbody>
                  {result.documentDistributions.map((doc) => (
                    <tr key={doc.documentIndex} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-2 pr-3 font-semibold text-slate-800">#{doc.documentIndex}</td>
                      <td className="py-2 pr-4 max-w-xs truncate text-slate-600">{doc.snippet}</td>
                      <td className="py-2 pr-3">
                        <Badge tone="indigo">Topic {doc.dominantTopic}</Badge>
                      </td>
                      <td className="py-2 pr-3 font-semibold text-slate-700">
                        {(doc.dominantWeight * 100).toFixed(0)}%
                      </td>
                      <td className="py-2 pr-3 text-slate-500">
                        {doc.distribution
                          .map((d) => `T${d.topicId}: ${(d.weight * 100).toFixed(0)}%`)
                          .join(" · ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>

          {/* EDUCATIONAL DISCLAIMER */}
          <div className="flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs text-indigo-900">
            <Info size={16} className="mt-0.5 shrink-0 text-indigo-600" />
            <div>
              <p className="font-semibold">Educational Interpretation Note:</p>
              <p className="mt-0.5 leading-relaxed text-indigo-800">
                {result.explanation.interpretationNote} Statistical clustering identifies co-occurring terms;
                human domain knowledge is always needed to name and validate real-world semantic concepts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useDocument } from "@/components/document-context";
import { Card, CardBody, CardHeader, SectionHeading, Badge, PrimaryButton, SecondaryButton, Spinner, StatCard } from "@/components/ui/primitives";
import { SAMPLE_DOC_A, SAMPLE_DOC_A_NAME, SAMPLE_DOC_B, SAMPLE_DOC_B_NAME, SAMPLE_HINDI_TEXT, SAMPLE_MARATHI_TEXT } from "@/lib/nlp/sampleData";
import type { SimilarityResult } from "@/lib/nlp/types";
import { Scale, Search, Sparkles, FileText, Download, CheckCircle2, AlertTriangle } from "lucide-react";

const LEVEL_CONFIG = {
  "Highly Similar": { tone: "rose" as const, bg: "bg-rose-50 text-rose-800 border-rose-200" },
  "Moderately Similar": { tone: "amber" as const, bg: "bg-amber-50 text-amber-800 border-amber-200" },
  "Slightly Similar": { tone: "sky" as const, bg: "bg-sky-50 text-sky-800 border-sky-200" },
  "Not Similar": { tone: "emerald" as const, bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
};

const PRESET_COMPARISONS = [
  {
    name: "AI & ML Academic Papers (Related)",
    docAName: SAMPLE_DOC_A_NAME,
    docBName: SAMPLE_DOC_B_NAME,
    docAText: SAMPLE_DOC_A,
    docBText: SAMPLE_DOC_B,
    tag: "English Academic",
  },
  {
    name: "Hindi Academic vs General (हिन्दी)",
    docAName: "Hindi AI Article",
    docBName: "Hindi Motivational Essay",
    docAText: "प्राकृतिक भाषा प्रसंस्करण और मशीन लर्निंग कंप्यूटर विज्ञान की महत्वपूर्ण शाखाएं हैं जो डेटा से ज्ञान निकालती हैं।",
    docBText: SAMPLE_HINDI_TEXT,
    tag: "Hindi (हिन्दी)",
  },
  {
    name: "Marathi Grammar vs Literature (मराठी)",
    docAName: "Marathi NLP Study",
    docBName: "Marathi Cultural Overview",
    docAText: "मराठी भाषेमध्ये व्याकरण आणि शब्दांचे विश्लेषण केले जाते, हे अत्यंत महत्त्वाचे आहे आणि उपयुक्त आहे।",
    docBText: SAMPLE_MARATHI_TEXT,
    tag: "Marathi (मराठी)",
  },
  {
    name: "Completely Unrelated (Sports vs Quantum)",
    docAName: "Football Championship",
    docBName: "Quantum Cryptography",
    docAText: "The soccer team won the tournament final after scoring a penalty shootout in extra time before thousands of fans in the stadium.",
    docBText: "Quantum cryptography relies on the uncertainty principle and photon entanglement to secure communications against eavesdropping attacks.",
    tag: "Opposite Domains",
  },
];

export default function SimilarityPage() {
  const { rawText, docName } = useDocument();
  const [docAName, setDocAName] = useState(SAMPLE_DOC_A_NAME);
  const [docBName, setDocBName] = useState(SAMPLE_DOC_B_NAME);
  const [docAText, setDocAText] = useState(SAMPLE_DOC_A);
  const [docBText, setDocBText] = useState(SAMPLE_DOC_B);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimilarityResult | null>(null);
  const [termSearch, setTermSearch] = useState("");

  async function handleCompare(aText?: string, bText?: string, aName?: string, bName?: string) {
    const textA = (aText ?? docAText).trim();
    const textB = (bText ?? docBText).trim();
    const nameA = aName ?? docAName;
    const nameB = bName ?? docBName;

    setError(null);
    if (!textA || !textB) {
      setError("Please provide text for both documents before comparing.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docAText: textA, docBText: textB, docAName: nameA, docBName: nameB }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-compare initial preset on load
  useEffect(() => {
    handleCompare(SAMPLE_DOC_A, SAMPLE_DOC_B, SAMPLE_DOC_A_NAME, SAMPLE_DOC_B_NAME);
  }, []);

  function loadPreset(preset: typeof PRESET_COMPARISONS[0]) {
    setDocAName(preset.docAName);
    setDocBName(preset.docBName);
    setDocAText(preset.docAText);
    setDocBText(preset.docBText);
    handleCompare(preset.docAText, preset.docBText, preset.docAName, preset.docBName);
  }

  function useActiveDocAsDocA() {
    if (!rawText) return;
    setDocAName(docName || "Active Document");
    setDocAText(rawText);
  }

  const commonTerms = result?.commonTerms ?? [];
  const filteredTerms = commonTerms.filter((t) => {
    if (!termSearch.trim()) return true;
    return t.term.toLowerCase().includes(termSearch.toLowerCase().trim());
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Practical 9 · Core NLP"
        title="Document Similarity Analyzer (TF-IDF & Cosine Similarity)"
        description="Compute high-dimensional vector representations using Term Frequency-Inverse Document Frequency (TF-IDF) and calculate the angular Cosine Distance between texts."
      />

      {/* Preset Pair Selection Bar */}
      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Quick Comparison Presets:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PRESET_COMPARISONS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => loadPreset(p)}
                className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-indigo-400 hover:text-indigo-700"
              >
                {p.name}
              </button>
            ))}
            {rawText && (
              <button
                type="button"
                onClick={useActiveDocAsDocA}
                className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                <FileText className="h-3 w-3 inline mr-1" /> Use Active Doc as A
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Input Editors for Document A & Document B */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={docAName || "Document A"}
            subtitle={`${docAText.length.toLocaleString()} characters · ${docAText.trim() ? docAText.trim().split(/\s+/).length : 0} words`}
            action={
              <input
                value={docAName}
                onChange={(e) => setDocAName(e.target.value)}
                className="rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 focus:bg-white"
                placeholder="Rename Doc A"
              />
            }
          />
          <CardBody>
            <textarea
              value={docAText}
              onChange={(e) => setDocAText(e.target.value)}
              rows={7}
              placeholder="Paste or type Document A text..."
              className="w-full resize-y rounded-xl border border-slate-300 p-3 text-sm text-slate-800 shadow-inner outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={docBName || "Document B"}
            subtitle={`${docBText.length.toLocaleString()} characters · ${docBText.trim() ? docBText.trim().split(/\s+/).length : 0} words`}
            action={
              <input
                value={docBName}
                onChange={(e) => setDocBName(e.target.value)}
                className="rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 focus:bg-white"
                placeholder="Rename Doc B"
              />
            }
          />
          <CardBody>
            <textarea
              value={docBText}
              onChange={(e) => setDocBText(e.target.value)}
              rows={7}
              placeholder="Paste or type Document B text..."
              className="w-full resize-y rounded-xl border border-slate-300 p-3 text-sm text-slate-800 shadow-inner outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
            />
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-center">
        <PrimaryButton onClick={() => handleCompare()} disabled={loading} className="px-8 py-2.5 text-sm">
          {loading ? <Spinner /> : <Scale className="h-4 w-4 inline mr-2" />} Calculate Cosine Similarity
        </PrimaryButton>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-rose-100">{error}</p>}

      {/* Results View */}
      {result && (
        <div className="space-y-6 pt-2">
          {/* Main Similarity Score Display */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">TF-IDF Cosine Metric</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-indigo-700">
                    {result.cosineSimilarity.toFixed(4)}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    ({(result.cosineSimilarity * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(result.cosineSimilarity * 100, 100)}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0.0 (Orthogonal)</span>
                  <span>1.0 (Identical)</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Similarity Classification</p>
                <div className="mt-2">
                  <Badge tone={LEVEL_CONFIG[result.similarityLevel]?.tone ?? "slate"} className="text-sm px-3 py-1">
                    {result.similarityLevel}
                  </Badge>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                {result.similarityLevel === "Highly Similar"
                  ? "High vocabulary overlap: significant shared terminology and conceptual alignment between both documents."
                  : result.similarityLevel === "Moderately Similar"
                  ? "Moderate overlap: documents share key thematic terms but maintain unique vocabulary."
                  : result.similarityLevel === "Slightly Similar"
                  ? "Low overlap: documents have only minor topical intersection or occasional incidental word matches."
                  : "Orthogonal vectors: documents discuss distinct subjects with no shared content words."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Shared Term Vocabulary</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{result.commonTerms.length}</span>
                  <span className="text-xs text-slate-500">shared content terms</span>
                </div>
              </div>
              <div className="rounded-lg bg-amber-50/70 p-2.5 text-[11px] text-amber-900 border border-amber-200/60 leading-normal">
                <AlertTriangle className="h-3.5 w-3.5 inline mr-1 text-amber-700" />
                <strong>Academic Note:</strong> High cosine score indicates textual lexical overlap. It is not conclusive proof of plagiarism.
              </div>
            </div>
          </div>

          {/* Shared Vocabulary Table */}
          <Card>
            <CardHeader
              title="Corpus Common Salient Terms"
              subtitle={`Comparing TF-IDF vector weight contributions across ${filteredTerms.length} common terms`}
            />
            <CardBody className="space-y-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={termSearch}
                  onChange={(e) => setTermSearch(e.target.value)}
                  placeholder="Filter shared terms..."
                  className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[400px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <tr className="border-b border-slate-200">
                      <th className="py-2.5 px-4">Shared Term</th>
                      <th className="py-2.5 px-4">Weight in Doc A ({result.docAName})</th>
                      <th className="py-2.5 px-4">Weight in Doc B ({result.docBName})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredTerms.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-xs text-slate-400">
                          No common terms found matching search.
                        </td>
                      </tr>
                    ) : (
                      filteredTerms.map((t) => (
                        <tr key={t.term} className="hover:bg-slate-50 transition">
                          <td className="py-2 px-4 font-semibold text-slate-900">{t.term}</td>
                          <td className="py-2 px-4 font-mono text-indigo-700">{t.weightA.toFixed(4)}</td>
                          <td className="py-2 px-4 font-mono text-purple-700">{t.weightB.toFixed(4)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

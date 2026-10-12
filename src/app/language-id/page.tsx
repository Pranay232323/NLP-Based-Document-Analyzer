"use client";

import { useState } from "react";
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
import {
  identifyLanguage,
  SAMPLE_LANGUAGE_SNIPPETS,
  type LanguageIdentificationResult,
} from "@/lib/nlp/languageId";
import { AlertCircle, Globe, BookOpen } from "lucide-react";

export default function LanguageIdPage() {
  const { analysis, docName } = useDocument();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<LanguageIdentificationResult>(() => {
    if (analysis?.rawText) {
      return identifyLanguage(analysis.rawText);
    }
    return identifyLanguage(SAMPLE_LANGUAGE_SNIPPETS[0].text);
  });

  function handleUseActiveDoc() {
    if (analysis?.rawText) {
      setInputText(analysis.rawText);
      setResult(identifyLanguage(analysis.rawText));
      setError(null);
    }
  }

  function handleIdentify() {
    const textToUse = inputText.trim() || analysis?.rawText || SAMPLE_LANGUAGE_SNIPPETS[0].text;
    if (!textToUse.trim()) {
      setError("Please provide text for language identification.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResult(identifyLanguage(textToUse));
    } catch {
      setError("Language identification failed.");
    } finally {
      setLoading(false);
    }
  }

  const tone =
    result.detectedLanguage === "English"
      ? "indigo"
      : result.detectedLanguage === "Hindi"
      ? "amber"
      : result.detectedLanguage === "Marathi"
      ? "rose"
      : "slate";

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Advanced NLP Lab"
        title="Language Identification & Script Analysis"
        description="Identifies language (English, Hindi, Marathi) using Unicode script analysis, character n-grams, and grammatical markers. Explains why script detection alone cannot differentiate Devanagari languages."
      />

      {/* INPUT AREA */}
      <Card>
        <CardHeader
          title="Multilingual Text Input"
          subtitle="Paste English or Indic text in Latin or Devanagari script"
          action={
            analysis ? (
              <SecondaryButton onClick={handleUseActiveDoc} className="text-xs">
                Load Active Document ({docName})
              </SecondaryButton>
            ) : null
          }
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Sample Inputs:</span>
            {SAMPLE_LANGUAGE_SNIPPETS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setInputText(sample.text);
                  setResult(identifyLanguage(sample.text));
                  setError(null);
                }}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste English, Hindi (हिन्दी), or Marathi (मराठी) text..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <PrimaryButton onClick={handleIdentify} disabled={loading}>
              {loading ? <Spinner size={14} /> : "Identify Language"}
            </PrimaryButton>
            <SecondaryButton onClick={() => setInputText("")}>Clear</SecondaryButton>
          </div>
        </CardBody>
      </Card>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Detected Language"
          value={result.detectedLanguage}
          tone={tone}
        />
        <StatCard
          label="Certainty Confidence"
          value={`${(result.confidence * 100).toFixed(0)}%`}
          tone="indigo"
        />
        <StatCard
          label="Detected Script"
          value={result.script.scriptName}
          tone="violet"
        />
        <StatCard
          label="Total Alpha Characters"
          value={result.script.totalAlphaChars}
          tone="slate"
        />
      </div>

      {/* SCRIPT & EVIDENCE INSPECTION */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SCRIPT BREAKDOWN */}
        <Card>
          <CardHeader
            title="Unicode Script Analysis"
            subtitle="Character encoding distribution across Unicode blocks"
          />
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Latin Characters</span>
                <span className="font-semibold">
                  {result.script.latinChars} ({(result.script.latinRatio * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  style={{ width: `${result.script.latinRatio * 100}%` }}
                  className="h-2 rounded-full bg-indigo-600"
                />
              </div>

              <div className="flex justify-between text-xs text-slate-600 pt-2">
                <span>Devanagari Characters (U+0900 - U+097F)</span>
                <span className="font-semibold">
                  {result.script.devanagariChars} ({(result.script.devanagariRatio * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  style={{ width: `${result.script.devanagariRatio * 100}%` }}
                  className="h-2 rounded-full bg-amber-500"
                />
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Decision Rationale: </span>
              {result.explanation.decisionRationale}
            </div>
          </CardBody>
        </Card>

        {/* GRAMMATICAL MARKERS DETECTED */}
        <Card>
          <CardHeader
            title="Morphological & Lexical Evidence"
            subtitle="Distinguishing markers matched in input"
            action={
              <Badge tone="indigo">
                {result.markersDetected.length} Evidence Matches
              </Badge>
            }
          />
          <CardBody className="overflow-x-auto">
            {result.markersDetected.length > 0 ? (
              <table className="w-full min-w-[340px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-3">Marker</th>
                    <th className="py-2 pr-3">Target Language</th>
                    <th className="py-2 pr-3">Linguistic Function</th>
                  </tr>
                </thead>
                <tbody>
                  {result.markersDetected.map((m, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-semibold text-slate-800">{m.word}</td>
                      <td className="py-2 pr-3">
                        <Badge
                          tone={
                            m.language === "English"
                              ? "indigo"
                              : m.language === "Hindi"
                              ? "amber"
                              : "rose"
                          }
                        >
                          {m.language}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3 text-slate-600">{m.significance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-4 text-center text-xs text-slate-400 italic">
                No closed-class grammatical markers detected in the sample.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* CRITICAL EDUCATIONAL INSIGHT */}
      <Card>
        <CardHeader
          title="Linguistic Theory: Script vs. Language"
          subtitle="Why Devanagari detection alone cannot differentiate Hindi and Marathi"
        />
        <CardBody className="space-y-3 text-xs text-slate-700">
          <div className="flex items-start gap-3 rounded-xl bg-indigo-50/70 p-4 text-indigo-900">
            <BookOpen size={18} className="mt-0.5 shrink-0 text-indigo-600" />
            <div className="space-y-1.5 leading-relaxed">
              <p className="font-semibold">{result.explanation.linguisticInsight}</p>
              <p className="text-indigo-800">{result.explanation.scriptVsLanguageExplanation}</p>
              <p className="text-[11px] text-indigo-700">
                Key differentiator: Marathi utilizes the retroflex lateral flap consonant &ldquo;ळ&rdquo; (U+0933)
                and agglutinative inflections like &ldquo;च्या, मध्ये, आणि&rdquo;, whereas Hindi uses postpositions like &ldquo;का, के, में, और&rdquo;.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

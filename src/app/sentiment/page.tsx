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
  analyzeSentiment,
  SAMPLE_SENTIMENT_TEXTS,
  type SentimentAnalysisResult,
} from "@/lib/nlp/sentiment";
import { AlertCircle, ThumbsUp, ThumbsDown, MinusCircle, Lightbulb } from "lucide-react";

export default function SentimentPage() {
  const { analysis, docName } = useDocument();
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "sentences" | "tokens">("overview");
  const [result, setResult] = useState<SentimentAnalysisResult | null>(() => {
    if (analysis?.rawText) {
      return analyzeSentiment(analysis.rawText);
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleUseActiveDoc() {
    if (analysis?.rawText) {
      setInputText(analysis.rawText.slice(0, 3000));
      setResult(analyzeSentiment(analysis.rawText.slice(0, 3000)));
      setError(null);
    }
  }

  function handleLoadSample(sampleText: string) {
    setInputText(sampleText);
    setResult(analyzeSentiment(sampleText));
    setError(null);
  }

  function handleAnalyze() {
    setError(null);
    if (!inputText.trim()) {
      setError("Please paste text or load a sample before running sentiment analysis.");
      return;
    }
    setLoading(true);
    try {
      const res = analyzeSentiment(inputText);
      setResult(res);
    } catch {
      setError("Sentiment calculation failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setInputText("");
    setResult(null);
    setError(null);
  }

  const labelTone =
    result?.label === "Positive" ? "emerald" : result?.label === "Negative" ? "rose" : "slate";

  const LabelIcon =
    result?.label === "Positive"
      ? ThumbsUp
      : result?.label === "Negative"
      ? ThumbsDown
      : MinusCircle;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Advanced NLP Lab"
        title="Sentiment Analysis & Polarity Scoring"
        description="Calculates emotional polarity (positive, negative, neutral) and subjectivity scores using an explainable lexicon model with negation detection and intensifier weighting."
      />

      {/* SAMPLE SELECTOR & INPUT AREA */}
      <Card>
        <CardHeader
          title="Experiment Input"
          subtitle="Paste custom academic text or choose an educational test sample"
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
            {SAMPLE_SENTIMENT_TEXTS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleLoadSample(sample.text)}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste student feedback, reviews, or academic critique..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <PrimaryButton onClick={handleAnalyze} disabled={loading}>
              {loading ? <Spinner size={14} /> : "Run Sentiment Analysis"}
            </PrimaryButton>
            <SecondaryButton onClick={handleClear}>Clear</SecondaryButton>
          </div>
        </CardBody>
      </Card>

      {/* RESULTS DISPLAY */}
      {result && (
        <div className="space-y-6">
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Predicted Sentiment"
              value={result.label}
              tone={labelTone}
            />
            <StatCard
              label="Normalized Score"
              value={`${result.normalizedScore > 0 ? "+" : ""}${result.normalizedScore}`}
              tone={result.normalizedScore >= 0 ? "emerald" : "rose"}
            />
            <StatCard
              label="Certainty Confidence"
              value={`${(result.confidence * 100).toFixed(0)}%`}
              tone="indigo"
            />
            <StatCard
              label="Subjectivity Index"
              value={`${(result.subjectivity * 100).toFixed(0)}%`}
              tone="violet"
            />
          </div>

          {/* POLARITY DISTRIBUTION BAR */}
          <Card>
            <CardHeader
              title="Polarity Score Breakdown"
              subtitle={`Total tokens: ${result.positiveTokensCount + result.negativeTokensCount + result.neutralTokensCount} | Comparative polarity: ${result.comparative}`}
              action={
                <Badge tone={labelTone} className="flex items-center gap-1">
                  <LabelIcon size={12} />
                  {result.label}
                </Badge>
              }
            />
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span className="text-emerald-700">Positive Tokens ({result.positiveTokensCount})</span>
                  <span className="text-slate-500">Neutral ({result.neutralTokensCount})</span>
                  <span className="text-rose-700">Negative Tokens ({result.negativeTokensCount})</span>
                </div>
                <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        (result.positiveTokensCount /
                          Math.max(1, result.positiveTokensCount + result.negativeTokensCount + result.neutralTokensCount)) *
                          100
                      )}%`,
                    }}
                    className="bg-emerald-500 transition-all"
                  />
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        (result.neutralTokensCount /
                          Math.max(1, result.positiveTokensCount + result.negativeTokensCount + result.neutralTokensCount)) *
                          100
                      )}%`,
                    }}
                    className="bg-slate-300 transition-all"
                  />
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        (result.negativeTokensCount /
                          Math.max(1, result.positiveTokensCount + result.negativeTokensCount + result.neutralTokensCount)) *
                          100
                      )}%`,
                    }}
                    className="bg-rose-500 transition-all"
                  />
                </div>
              </div>

              {/* TABS FOR DEEP INSPECTION */}
              <div className="flex border-b border-slate-200 text-xs font-medium text-slate-500">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`border-b-2 px-3 py-2 ${
                    activeTab === "overview"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent hover:text-slate-800"
                  }`}
                >
                  Algorithm Pipeline
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("sentences")}
                  className={`border-b-2 px-3 py-2 ${
                    activeTab === "sentences"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent hover:text-slate-800"
                  }`}
                >
                  Sentence Breakdown ({result.sentenceBreakdown.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tokens")}
                  className={`border-b-2 px-3 py-2 ${
                    activeTab === "tokens"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent hover:text-slate-800"
                  }`}
                >
                  Token Contributions ({result.tokenContributions.length})
                </button>
              </div>

              {activeTab === "overview" && (
                <div className="space-y-3 pt-2 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">Processing Steps:</p>
                  <ol className="list-inside list-decimal space-y-1">
                    {result.explanation.preprocessingSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <p className="mt-3 font-semibold text-slate-800">Decision Criterion:</p>
                  <p className="rounded-lg bg-slate-50 p-2 font-mono text-[11px] text-slate-700">
                    {result.explanation.decisionRule}
                  </p>
                </div>
              )}

              {activeTab === "sentences" && (
                <div className="space-y-2 pt-2">
                  {result.sentenceBreakdown.map((s, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-700">Sentence {idx + 1}</span>
                        <Badge
                          tone={
                            s.label === "Positive"
                              ? "emerald"
                              : s.label === "Negative"
                              ? "rose"
                              : "slate"
                          }
                        >
                          {s.label} ({s.score > 0 ? `+${s.score}` : s.score})
                        </Badge>
                      </div>
                      <p className="mt-1 text-slate-600 italic">&ldquo;{s.sentence}&rdquo;</p>
                      {(s.positiveWords.length > 0 || s.negativeWords.length > 0) && (
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                          {s.positiveWords.length > 0 && (
                            <span className="text-emerald-700">
                              Positive: {s.positiveWords.join(", ")}
                            </span>
                          )}
                          {s.negativeWords.length > 0 && (
                            <span className="text-rose-700">
                              Negative: {s.negativeWords.join(", ")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "tokens" && (
                <div className="overflow-x-auto pt-2">
                  <table className="w-full min-w-[500px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-4">Token</th>
                        <th className="py-2 pr-4">Base Lexicon</th>
                        <th className="py-2 pr-4">Multiplier</th>
                        <th className="py-2 pr-4">Final Score</th>
                        <th className="py-2 pr-4">Grammatical Context</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.tokenContributions.map((tc, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="py-2 pr-4 font-semibold text-slate-800">{tc.token}</td>
                          <td className="py-2 pr-4 text-slate-600">{tc.baseScore}</td>
                          <td className="py-2 pr-4 text-slate-600">
                            {tc.multiplier}x {tc.isNegated ? "(Negated)" : ""}
                          </td>
                          <td
                            className={`py-2 pr-4 font-semibold ${
                              tc.finalScore > 0 ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {tc.finalScore > 0 ? `+${tc.finalScore}` : tc.finalScore}
                          </td>
                          <td className="py-2 pr-4 font-mono text-slate-500">{tc.context}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

          {/* EDUCATIONAL LIMITATIONS & METHOD NOTES */}
          <Card>
            <CardHeader
              title="Method Limitations & Academic Notes"
              subtitle="Where lexicon-based sentiment analysis succeeds and fails"
            />
            <CardBody className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2 rounded-lg bg-amber-50/80 p-3 text-amber-900">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold">Why Sentiment Models Can Be Inaccurate:</p>
                  <ul className="mt-1 list-inside list-disc space-y-1">
                    {result.explanation.knownLimitations.map((lim, i) => (
                      <li key={i}>{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

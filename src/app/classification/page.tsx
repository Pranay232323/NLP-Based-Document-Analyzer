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
  DEFAULT_CLASSIFICATION_DATASET,
  trainAndEvaluateClassifier,
  predictText,
  type ClassificationExperimentResult,
  type ClassificationPrediction,
} from "@/lib/nlp/classification";
import { AlertCircle, Sparkles, Database, Download, FileText } from "lucide-react";

const QUICK_TEST_SAMPLES = [
  {
    topic: "Politics",
    text: "The defense attorney presented evidence before the parliamentary supreme court.",
  },
  {
    topic: "Sports",
    text: "The striker sprinted past the goalkeeper to score a dramatic winning goal.",
  },
  {
    topic: "Technology",
    text: "Quantum computers and silicon microchips accelerate algorithmic computations.",
  },
  {
    topic: "Science",
    text: "Astronomers discovered an orbiting exoplanet using spectral telescope cameras.",
  },
  {
    topic: "Hindi (हिंदी)",
    text: "वैज्ञानिकों ने प्रयोगशाला में नए उपग्रह और अंतरिक्ष दूरबीन का सफल परीक्षण किया।",
  },
  {
    topic: "Sports (खेळ)",
    text: "खेळाडूंनी अंतिम सामन्यात उत्कृष्ट खेळ करून विजेतेपद पटकावले.",
  },
];

export default function ClassificationPage() {
  const { rawText, docName } = useDocument();
  const [splitRatio, setSplitRatio] = useState(0.75);
  const [customTestInput, setCustomTestInput] = useState(
    "Researchers developed a novel deep neural network for natural language understanding."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Train initial model
  const [modelState, setModelState] = useState(() => {
    return trainAndEvaluateClassifier(DEFAULT_CLASSIFICATION_DATASET, "Academic Multi-Topic Corpus", 0.75);
  });

  const [prediction, setPrediction] = useState<ClassificationPrediction | null>(() => {
    return predictText(
      "Researchers developed a novel deep neural network for natural language understanding.",
      modelState.model
    );
  });

  const exp: ClassificationExperimentResult = modelState.experiment;

  function handleRetrain(ratio: number) {
    setLoading(true);
    setError(null);
    try {
      const res = trainAndEvaluateClassifier(DEFAULT_CLASSIFICATION_DATASET, "Academic Multi-Topic Corpus", ratio);
      setModelState(res);
      if (customTestInput.trim()) {
        setPrediction(predictText(customTestInput.trim(), res.model));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Training failed.");
    } finally {
      setLoading(false);
    }
  }

  function handlePredict(textToPredict?: string) {
    const text = (textToPredict ?? customTestInput).trim();
    if (!text) {
      setError("Please enter a sentence to classify.");
      return;
    }
    setError(null);
    try {
      const pred = predictText(text, modelState.model);
      setPrediction(pred);
    } catch {
      setError("Inference failed.");
    }
  }

  function handleUseActiveDocExcerpt() {
    if (rawText) {
      const firstSentence = rawText.split(/[.?!।\n]/)[0]?.trim();
      if (firstSentence) {
        setCustomTestInput(firstSentence);
        handlePredict(firstSentence);
      }
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(exp, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `classification-eval-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const headers = ["Category", "Support", "Precision", "Recall", "F1Score"];
    const rows = exp.classMetrics.map((cm) => [
      cm.category,
      cm.support,
      (cm.precision * 100).toFixed(1) + "%",
      (cm.recall * 100).toFixed(1) + "%",
      (cm.f1Score * 100).toFixed(1) + "%",
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `classification-metrics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Advanced NLP Lab · Exp 12"
        title="Supervised Text Classification & Evaluation"
        description="Trains a transparent Multinomial Naive Bayes classifier with TF-IDF features and Laplace smoothing. Evaluates performance using train/test splits, calculates Precision/Recall/F1, and generates a live Confusion Matrix."
      />

      {/* TRAINING CONFIGURATION */}
      <Card>
        <CardHeader
          title="Dataset & Training Configuration"
          subtitle={`Corpus: ${exp.datasetName} | Total samples: ${exp.totalSamples} | Classes: ${exp.classes.join(", ")}`}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Train / Test Split Ratio:</label>
              <div className="mt-2 flex items-center gap-3">
                {[0.6, 0.75, 0.8].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => {
                      setSplitRatio(ratio);
                      handleRetrain(ratio);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      splitRatio === ratio
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {(ratio * 100).toFixed(0)}% Train / {((1 - ratio) * 100).toFixed(0)}% Test
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Partition Counts: </span>
              {exp.trainSamples} training samples · {exp.testSamples} held-out test samples · {exp.vocabularySize} distinct features in vocabulary.
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* EVALUATION METRICS CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Test Accuracy"
          value={`${(exp.accuracy * 100).toFixed(1)}%`}
          tone="emerald"
        />
        <StatCard
          label="Macro Precision"
          value={`${(exp.macroPrecision * 100).toFixed(1)}%`}
          tone="indigo"
        />
        <StatCard
          label="Macro Recall"
          value={`${(exp.macroRecall * 100).toFixed(1)}%`}
          tone="sky"
        />
        <StatCard
          label="Macro F1-Score"
          value={`${(exp.macroF1 * 100).toFixed(1)}%`}
          tone="violet"
        />
      </div>

      {/* CONFUSION MATRIX & PER-CLASS METRICS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CONFUSION MATRIX */}
        <Card>
          <CardHeader
            title="Confusion Matrix"
            subtitle="Rows = Actual Class | Columns = Predicted Class"
          />
          <CardBody className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-center text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 text-left">Actual \ Pred</th>
                  {exp.confusionMatrix.classes.map((c) => (
                    <th key={c} className="py-2 px-2 font-medium">{c.slice(0, 5)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exp.confusionMatrix.classes.map((actualClass, r) => (
                  <tr key={actualClass} className="border-b border-slate-100">
                    <td className="py-2 text-left font-medium text-slate-700">{actualClass}</td>
                    {exp.confusionMatrix.matrix[r].map((count, c) => {
                      const isDiagonal = r === c;
                      return (
                        <td
                          key={c}
                          className={`py-2 px-2 font-semibold ${
                            isDiagonal
                              ? count > 0
                                ? "bg-emerald-50 text-emerald-700 font-bold"
                                : "text-slate-400"
                              : count > 0
                              ? "bg-rose-50 text-rose-700"
                              : "text-slate-400"
                          }`}
                        >
                          {count}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[11px] text-slate-500">
              Green diagonal cells denote True Positives; off-diagonal non-zero cells indicate classification errors.
            </p>
          </CardBody>
        </Card>

        {/* PER-CLASS METRICS TABLE */}
        <Card>
          <CardHeader
            title="Per-Class Performance"
            subtitle="Support, Precision, Recall, and F1 per category"
          />
          <CardBody className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Support</th>
                  <th className="py-2 pr-3">Precision</th>
                  <th className="py-2 pr-3">Recall</th>
                  <th className="py-2 pr-3">F1-Score</th>
                </tr>
              </thead>
              <tbody>
                {exp.classMetrics.map((cm) => (
                  <tr key={cm.category} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-semibold text-slate-800">{cm.category}</td>
                    <td className="py-2 pr-3 text-slate-600">{cm.support}</td>
                    <td className="py-2 pr-3 text-slate-600">{(cm.precision * 100).toFixed(0)}%</td>
                    <td className="py-2 pr-3 text-slate-600">{(cm.recall * 100).toFixed(0)}%</td>
                    <td className="py-2 pr-3 font-semibold text-indigo-600">
                      {(cm.f1Score * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      {/* LIVE INFERENCE / TEST PREDICTION */}
      <Card>
        <CardHeader
          title="Interactive Inference Laboratory"
          subtitle="Test custom text or sentences from your active document against the trained model"
          action={
            rawText ? (
              <SecondaryButton onClick={handleUseActiveDocExcerpt} className="text-xs">
                <FileText size={12} className="mr-1" />
                Use Active Doc Excerpt ({docName || "Active"})
              </SecondaryButton>
            ) : null
          }
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Quick Samples:</span>
            {QUICK_TEST_SAMPLES.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setCustomTestInput(sample.text);
                  handlePredict(sample.text);
                }}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                {sample.topic}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customTestInput}
              onChange={(e) => setCustomTestInput(e.target.value)}
              placeholder="Enter text to classify in any topic..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <PrimaryButton onClick={() => handlePredict()}>Predict</PrimaryButton>
          </div>

          {prediction && (
            <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">
                    Predicted Category
                  </p>
                  <p className="text-xl font-bold text-slate-900">{prediction.predictedClass}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">
                    Confidence
                  </p>
                  <p className="text-xl font-bold text-indigo-600">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* POSTERIOR CLASS PROBABILITIES */}
              <div className="space-y-1.5 pt-2">
                <p className="text-xs font-semibold text-slate-700">Posterior Probability Distribution:</p>
                {prediction.probabilities.map((prob) => (
                  <div key={prob.category} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{prob.category}</span>
                      <span>{(prob.probability * 100).toFixed(2)}% (log: {prob.logProb})</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        style={{ width: `${Math.min(100, Math.max(0, prob.probability * 100))}%` }}
                        className="h-2 rounded-full bg-indigo-600 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* MATCHED FEATURES */}
              {prediction.matchedFeatures.length > 0 && (
                <div className="pt-2 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">Matched Vocabulary Features:</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {prediction.matchedFeatures.map((f) => (
                      <Badge key={f.term} tone="slate">
                        {f.term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

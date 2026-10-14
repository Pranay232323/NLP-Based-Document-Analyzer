// Supervised Text Classification Module (Experiment 12)
// Implements Multinomial Naive Bayes with TF-IDF vectorization,
// reproducible train/test split, strict prevention of data leakage,
// comprehensive evaluation metrics (Confusion Matrix, Precision, Recall, F1),
// and interactive inference for custom user inputs.

import { tokenizeWords } from "./preprocessing";
import { isStopword } from "./stopwords";

export interface DataSample {
  text: string;
  category: string;
}

export interface ClassMetrics {
  category: string;
  support: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface ConfusionMatrix {
  classes: string[];
  matrix: number[][]; // rows: Actual, columns: Predicted
}

export interface ClassificationPrediction {
  predictedClass: string;
  confidence: number;
  probabilities: { category: string; logProb: number; probability: number }[];
  matchedFeatures: { term: string; categoryLikelihoods: Record<string, number> }[];
}

export interface ClassificationExperimentResult {
  datasetName: string;
  totalSamples: number;
  trainSamples: number;
  testSamples: number;
  classes: string[];
  classDistribution: Record<string, number>;
  vocabularySize: number;
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  classMetrics: ClassMetrics[];
  confusionMatrix: ConfusionMatrix;
  explanation: {
    algorithm: string;
    smoothing: string;
    leakagePrevention: string;
    formula: string;
  };
}

export interface TrainedModel {
  classes: string[];
  vocabulary: string[];
  classPriors: Record<string, number>;
  featureLogProbabilities: Record<string, Record<string, number>>; // class -> term -> log P(w|c)
  defaultLogProbabilities: Record<string, number>; // class -> log P(OOV|c)
}

// Built-in academic multiclass dataset (16 samples across 4 domains)
export const DEFAULT_CLASSIFICATION_DATASET: DataSample[] = [
  // Technology
  { text: "Artificial intelligence models and deep neural networks are transforming machine learning applications.", category: "Technology" },
  { text: "The software engineering team deployed a microservices architecture using cloud containers and APIs.", category: "Technology" },
  { text: "Cybersecurity algorithms detect encrypted network malware and prevent unauthorized server intrusions.", category: "Technology" },
  { text: "Quantum computing hardware processes complex cryptographic calculations at revolutionary speed.", category: "Technology" },
  // Sports
  { text: "The football tournament championship match ended with a penalty shootout and triumphant goal.", category: "Sports" },
  { text: "Olympic athletes broke the world record in sprint hurdles and won gold medals for their nation.", category: "Sports" },
  { text: "The basketball team dominated the playoff quarter with tactical defense and high three-point accuracy.", category: "Sports" },
  { text: "Cricket coaches emphasized batting technique, spin bowling strategies, and fielding fitness drills.", category: "Sports" },
  // Politics
  { text: "The parliamentary assembly debated constitutional amendments, electoral policies, and voting reform laws.", category: "Politics" },
  { text: "Diplomats held multilateral summits to negotiate international foreign policy and trade treaties.", category: "Politics" },
  { text: "Citizens cast their ballots in the democratic national election to choose new legislative leaders.", category: "Politics" },
  { text: "The minister addressed journalists regarding parliamentary legislation and municipal budget governance.", category: "Politics" },
  // Science
  { text: "Astrophysicists discovered an exoplanet in the habitable zone using deep space telescope spectroscopy.", category: "Science" },
  { text: "Geneticists analyzed CRISPR DNA sequence mutations to understand molecular cellular biology.", category: "Science" },
  { text: "Climate research scientists measured polar ice sheet melting rates and atmospheric carbon concentrations.", category: "Science" },
  { text: "Biochemical experiments synthesized enzymes to study protein folding kinetics under laboratory pressure.", category: "Science" },
];

function extractCleanTokens(text: string): string[] {
  return tokenizeWords(text)
    .map((w: string) => w.toLowerCase())
    .filter((w: string) =>
      ((/^[a-z]+$/.test(w) && w.length > 2) || (/^[\u0900-\u097F]+$/.test(w) && w.length >= 2)) &&
      !isStopword(w)
    );
}


export function trainAndEvaluateClassifier(
  samples: DataSample[],
  datasetName: string = "Academic Multi-Topic Corpus",
  splitRatio: number = 0.75
): { experiment: ClassificationExperimentResult; model: TrainedModel } {
  if (!samples || samples.length < 4) {
    throw new Error("Dataset must contain at least 4 text samples for classification.");
  }

  // Shuffle reproducibly using pseudo-random linear congruential generator
  const seeded = [...samples];
  let seed = 42;
  for (let i = seeded.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [seeded[i], seeded[j]] = [seeded[j], seeded[i]];
  }

  const splitIdx = Math.max(2, Math.floor(seeded.length * splitRatio));
  const trainData = seeded.slice(0, splitIdx);
  const testData = seeded.slice(splitIdx);

  // Extract unique classes
  const classes = Array.from(new Set(samples.map((s) => s.category))).sort();
  const classDistribution: Record<string, number> = {};
  for (const c of classes) classDistribution[c] = 0;
  for (const s of samples) classDistribution[s.category] = (classDistribution[s.category] || 0) + 1;

  // FIT ONLY ON TRAINING DATA to prevent leakage
  const vocabSet = new Set<string>();
  const classDocs: Record<string, string[][]> = {};
  for (const c of classes) classDocs[c] = [];

  for (const item of trainData) {
    const tokens = extractCleanTokens(item.text);
    classDocs[item.category].push(tokens);
    for (const t of tokens) vocabSet.add(t);
  }

  const vocabulary = Array.from(vocabSet).sort();
  const vocabSize = vocabulary.length;

  // Class priors P(C)
  const classPriors: Record<string, number> = {};
  for (const c of classes) {
    const count = trainData.filter((d) => d.category === c).length;
    classPriors[c] = (count + 1) / (trainData.length + classes.length); // smoothed prior
  }

  // Conditional Likelihoods P(w|c) with Laplace add-1 smoothing
  const featureLogProbabilities: Record<string, Record<string, number>> = {};
  const defaultLogProbabilities: Record<string, number> = {};

  for (const c of classes) {
    featureLogProbabilities[c] = {};
    const docs = classDocs[c];
    const wordCounts: Record<string, number> = {};
    let totalTokensInClass = 0;

    for (const doc of docs) {
      for (const w of doc) {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
        totalTokensInClass++;
      }
    }

    const denominator = totalTokensInClass + vocabSize;
    defaultLogProbabilities[c] = Math.log(1 / denominator);

    for (const term of vocabulary) {
      const count = wordCounts[term] || 0;
      featureLogProbabilities[c][term] = Math.log((count + 1) / denominator);
    }
  }

  const model: TrainedModel = {
    classes,
    vocabulary,
    classPriors,
    featureLogProbabilities,
    defaultLogProbabilities,
  };

  // EVALUATION ON HELD-OUT TEST DATA
  const actuals: string[] = [];
  const preds: string[] = [];

  for (const sample of testData) {
    const pred = predictText(sample.text, model);
    actuals.push(sample.category);
    preds.push(pred.predictedClass);
  }

  // Confusion matrix
  const matrix: number[][] = classes.map(() => classes.map(() => 0));
  for (let i = 0; i < actuals.length; i++) {
    const aIdx = classes.indexOf(actuals[i]);
    const pIdx = classes.indexOf(preds[i]);
    if (aIdx >= 0 && pIdx >= 0) {
      matrix[aIdx][pIdx]++;
    }
  }

  // Per-class metrics
  const classMetrics: ClassMetrics[] = [];
  let totalCorrect = 0;

  for (let i = 0; i < classes.length; i++) {
    const cat = classes[i];
    const truePos = matrix[i][i];
    totalCorrect += truePos;

    let rowSum = 0; // Actuals
    for (let c = 0; c < classes.length; c++) rowSum += matrix[i][c];

    let colSum = 0; // Predictions
    for (let r = 0; r < classes.length; r++) colSum += matrix[r][i];

    const precision = colSum > 0 ? truePos / colSum : 0;
    const recall = rowSum > 0 ? truePos / rowSum : 0;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    classMetrics.push({
      category: cat,
      support: rowSum,
      precision: Number(precision.toFixed(3)),
      recall: Number(recall.toFixed(3)),
      f1Score: Number(f1Score.toFixed(3)),
    });
  }

  const accuracy = testData.length > 0 ? Number((totalCorrect / testData.length).toFixed(3)) : 0;
  const macroPrecision = Number(
    (classMetrics.reduce((sum, m) => sum + m.precision, 0) / classes.length).toFixed(3)
  );
  const macroRecall = Number(
    (classMetrics.reduce((sum, m) => sum + m.recall, 0) / classes.length).toFixed(3)
  );
  const macroF1 = Number(
    (classMetrics.reduce((sum, m) => sum + m.f1Score, 0) / classes.length).toFixed(3)
  );

  const experiment: ClassificationExperimentResult = {
    datasetName,
    totalSamples: samples.length,
    trainSamples: trainData.length,
    testSamples: testData.length,
    classes,
    classDistribution,
    vocabularySize: vocabSize,
    accuracy,
    macroPrecision,
    macroRecall,
    macroF1,
    classMetrics,
    confusionMatrix: {
      classes,
      matrix,
    },
    explanation: {
      algorithm: "Multinomial Naive Bayes with Laplace Add-1 Smoothing",
      smoothing: "P(w|C) = (count(w, C) + 1) / (totalWords(C) + |V|)",
      leakagePrevention: "Vocabulary, priors, and term likelihoods were learned strictly on the training partition.",
      formula: "argmax_C [ log P(C) + sum( log P(w_i | C) ) ]",
    },
  };

  return { experiment, model };
}

export function predictText(text: string, model: TrainedModel): ClassificationPrediction {
  const tokens = extractCleanTokens(text);
  const matchedFeatures: { term: string; categoryLikelihoods: Record<string, number> }[] = [];

  const logScores: Record<string, number> = {};
  for (const c of model.classes) {
    logScores[c] = Math.log(model.classPriors[c]);
  }

  for (const token of tokens) {
    if (model.vocabulary.includes(token)) {
      const likes: Record<string, number> = {};
      for (const c of model.classes) {
        const logProb = model.featureLogProbabilities[c][token] ?? model.defaultLogProbabilities[c];
        logScores[c] += logProb;
        likes[c] = Number(Math.exp(logProb).toFixed(4));
      }
      matchedFeatures.push({ term: token, categoryLikelihoods: likes });
    }
  }

  // Softmax normalization over log-likelihoods to yield valid probabilities
  const maxLog = Math.max(...Object.values(logScores));
  const expScores: Record<string, number> = {};
  let expSum = 0;
  for (const c of model.classes) {
    expScores[c] = Math.exp(logScores[c] - maxLog);
    expSum += expScores[c];
  }

  const probabilities = model.classes.map((c) => ({
    category: c,
    logProb: Number(logScores[c].toFixed(2)),
    probability: Number((expScores[c] / expSum).toFixed(4)),
  })).sort((a, b) => b.probability - a.probability);

  const top = probabilities[0];

  return {
    predictedClass: top.category,
    confidence: top.probability,
    probabilities,
    matchedFeatures: matchedFeatures.slice(0, 15),
  };
}

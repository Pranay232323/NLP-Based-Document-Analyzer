// EXPERIMENT 5: N-Gram Model for Text Prediction and Generation
// A genuine, from-scratch N-Gram language model (unigram/bigram/trigram)
// built directly from the supplied corpus/document text. No external LLM is used.
import type { NGramEntry, NGramGeneration, NGramModelSummary, NGramPrediction } from "./types";

export interface NGramModel {
  n: number;
  /** context (n-1 words joined by a space, "" for unigram) -> next word -> count */
  table: Map<string, Map<string, number>>;
  totalNGrams: number;
}

const LABELS: Record<number, string> = { 1: "Unigram", 2: "Bigram", 3: "Trigram" };

/** Extracts a lowercase sequence of word tokens, preserving natural order (keeps stopwords). */
export function wordSequence(text: string): string[] {
  return (text.match(/[A-Za-z]+(?:'[A-Za-z]+)?|[\u0900-\u097F]+/g) ?? []).map((w) => w.toLowerCase());
}

/** Build an N-Gram frequency model from a token sequence. */
export function buildNGramModel(tokens: string[], n: number): NGramModel {
  const table = new Map<string, Map<string, number>>();
  let totalNGrams = 0;

  for (let i = 0; i <= tokens.length - n; i++) {
    const contextWords = n === 1 ? [] : tokens.slice(i, i + n - 1);
    const nextWord = tokens[i + n - 1];
    const context = contextWords.join(" ");
    if (!table.has(context)) table.set(context, new Map());
    const nextMap = table.get(context)!;
    nextMap.set(nextWord, (nextMap.get(nextWord) ?? 0) + 1);
    totalNGrams++;
  }

  return { n, table, totalNGrams };
}

export function summarizeModel(model: NGramModel, topK = 15): NGramModelSummary {
  const entries: { ngram: string; count: number }[] = [];
  for (const [context, nextMap] of model.table.entries()) {
    for (const [word, count] of nextMap.entries()) {
      const ngramText = context ? `${context} ${word}` : word;
      entries.push({ ngram: ngramText, count });
    }
  }
  entries.sort((a, b) => b.count - a.count);
  const total = model.totalNGrams || 1;
  const topNGrams: NGramEntry[] = entries.slice(0, topK).map((e) => ({
    ngram: e.ngram,
    count: e.count,
    probability: Number((e.count / total).toFixed(4)),
  }));

  return {
    n: model.n,
    label: LABELS[model.n] ?? `${model.n}-gram`,
    totalNGrams: model.totalNGrams,
    uniqueNGrams: entries.length,
    topNGrams,
  };
}

/** Predict the most likely next word(s) given a context, with backoff to lower-order models. */
export function predictNext(
  models: Record<number, NGramModel>,
  context: string,
  n: number,
  topK = 5,
): NGramPrediction {
  const contextWords = wordSequence(context);
  const needed = n - 1;
  const tryContext = contextWords.slice(Math.max(0, contextWords.length - needed)).join(" ");

  const model = models[n];
  const nextMap = model?.table.get(tryContext);

  if (nextMap && nextMap.size > 0) {
    const total = Array.from(nextMap.values()).reduce((a, b) => a + b, 0);
    const predictions = Array.from(nextMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([word, count]) => ({ word, count, probability: Number((count / total).toFixed(4)) }));
    return { context: tryContext, n, found: true, usedBackoff: false, predictions };
  }

  // Backoff: try progressively lower-order models (trigram -> bigram -> unigram).
  for (let backoffN = n - 1; backoffN >= 1; backoffN--) {
    const backoffModel = models[backoffN];
    if (!backoffModel) continue;
    const backoffContextWords = contextWords.slice(Math.max(0, contextWords.length - (backoffN - 1)));
    const backoffContext = backoffContextWords.join(" ");
    const backoffMap = backoffModel.table.get(backoffContext);
    if (backoffMap && backoffMap.size > 0) {
      const total = Array.from(backoffMap.values()).reduce((a, b) => a + b, 0);
      const predictions = Array.from(backoffMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topK)
        .map(([word, count]) => ({ word, count, probability: Number((count / total).toFixed(4)) }));
      return {
        context: backoffContext,
        n,
        found: true,
        usedBackoff: true,
        backoffN,
        predictions,
      };
    }
  }

  return { context: tryContext, n, found: false, usedBackoff: false, predictions: [] };
}

/** Generate text starting from a seed phrase by repeatedly predicting the next word. */
export function generateText(
  models: Record<number, NGramModel>,
  seed: string,
  n: number,
  length: number,
): NGramGeneration {
  const words = wordSequence(seed);
  const steps: { word: string; source: "model" | "backoff" | "random-seed" }[] = [];

  if (words.length === 0) {
    return { seed, n, generated: "", steps: [] };
  }

  for (let i = 0; i < length; i++) {
    const context = words.join(" ");
    const prediction = predictNext(models, context, n, 1);
    if (prediction.found && prediction.predictions.length > 0) {
      const nextWord = prediction.predictions[0].word;
      words.push(nextWord);
      steps.push({ word: nextWord, source: prediction.usedBackoff ? "backoff" : "model" });
    } else {
      break;
    }
  }

  return { seed, n, generated: words.join(" "), steps };
}

/** Build unigram/bigram/trigram models for a document in one call. */
export function buildAllModels(tokens: string[]): Record<number, NGramModel> {
  return {
    1: buildNGramModel(tokens, 1),
    2: buildNGramModel(tokens, 2),
    3: buildNGramModel(tokens, 3),
  };
}

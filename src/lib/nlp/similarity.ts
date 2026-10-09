// EXPERIMENT 9: Academic Text Similarity Analyzer (TF-IDF + Cosine Similarity)
// IMPORTANT: this measures textual similarity only. It is NOT a plagiarism
// detector and should never be presented as conclusive proof of plagiarism.
import { preprocessText } from "./preprocessing";
import type { SimilarityResult } from "./types";

function termFrequencies(words: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const w of words) tf.set(w, (tf.get(w) ?? 0) + 1);
  // Normalise by document length.
  const total = words.length || 1;
  for (const [k, v] of tf) tf.set(k, v / total);
  return tf;
}

function buildVocabulary(a: string[], b: string[]): string[] {
  return Array.from(new Set([...a, ...b]));
}

/** Compute TF-IDF vectors for two documents over their shared vocabulary. */
function tfidfVectors(wordsA: string[], wordsB: string[]) {
  const vocab = buildVocabulary(wordsA, wordsB);
  const tfA = termFrequencies(wordsA);
  const tfB = termFrequencies(wordsB);

  const idf = new Map<string, number>();
  for (const term of vocab) {
    const docsWithTerm = (tfA.has(term) ? 1 : 0) + (tfB.has(term) ? 1 : 0);
    idf.set(term, Math.log(2 / docsWithTerm) + 1); // smoothed idf over 2 "documents"
  }

  const vecA = vocab.map((t) => (tfA.get(t) ?? 0) * idf.get(t)!);
  const vecB = vocab.map((t) => (tfB.get(t) ?? 0) * idf.get(t)!);

  return { vocab, vecA, vecB, tfA, tfB, idf };
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function levelFor(pct: number): SimilarityResult["similarityLevel"] {
  if (pct >= 75) return "Highly Similar";
  if (pct >= 50) return "Moderately Similar";
  if (pct >= 25) return "Slightly Similar";
  return "Not Similar";
}

export function compareDocuments(
  docAText: string,
  docBText: string,
  docAName = "Document A",
  docBName = "Document B",
): SimilarityResult {
  const a = preprocessText(docAText).filteredTokens.map((w) => w.toLowerCase());
  const b = preprocessText(docBText).filteredTokens.map((w) => w.toLowerCase());

  const { vocab, vecA, vecB, tfA, tfB, idf } = tfidfVectors(a, b);
  const similarity = cosineSimilarity(vecA, vecB);
  const percentage = Number((similarity * 100).toFixed(2));

  const weightsA = vocab
    .map((term, i) => ({ term, weight: vecA[i] }))
    .filter((t) => t.weight > 0)
    .sort((x, y) => y.weight - x.weight);
  const weightsB = vocab
    .map((term, i) => ({ term, weight: vecB[i] }))
    .filter((t) => t.weight > 0)
    .sort((x, y) => y.weight - x.weight);

  const commonTerms = vocab
    .filter((t) => tfA.has(t) && tfB.has(t))
    .map((t) => ({ term: t, weightA: Number(((tfA.get(t) ?? 0) * idf.get(t)!).toFixed(4)), weightB: Number(((tfB.get(t) ?? 0) * idf.get(t)!).toFixed(4)) }))
    .sort((x, y) => y.weightA + y.weightB - (x.weightA + x.weightB))
    .slice(0, 20);

  return {
    docAName,
    docBName,
    cosineSimilarity: Number(similarity.toFixed(4)),
    similarityPercentage: percentage,
    similarityLevel: levelFor(percentage),
    commonTerms,
    topTermsA: weightsA.slice(0, 15).map((t) => ({ term: t.term, weight: Number(t.weight.toFixed(4)) })),
    topTermsB: weightsB.slice(0, 15).map((t) => ({ term: t.term, weight: Number(t.weight.toFixed(4)) })),
    vocabSize: vocab.length,
  };
}

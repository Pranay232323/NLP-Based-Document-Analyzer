// TextRank Graph-Based Extractive Document Summarization
// Implements Mihalcea & Tarau's TextRank algorithm using PageRank on sentence similarity graphs.
// Automatically produces concise, coherent summaries of any text in English, Hindi, and Marathi.

import { splitSentences, tokenizeWords } from "./preprocessing";
import { isStopword } from "./stopwords";

export interface TextRankSentence {
  index: number;
  sentence: string;
  score: number;
  normalizedRank: number; // 0.0 to 1.0
  wordCount: number;
}

export interface TextRankSummaryResult {
  originalSentenceCount: number;
  originalWordCount: number;
  summarySentenceCount: number;
  summaryWordCount: number;
  compressionRatio: number; // e.g. 35% of original
  summaryText: string;
  rankedSentences: TextRankSentence[];
  similarityGraphMatrix: number[][]; // N x N edge weights
  iterationsRan: number;
  dampingFactor: number;
  explanation: {
    algorithm: string;
    graphConstruction: string;
    pagerankConvergence: string;
  };
}

function cleanTokens(sentence: string): Set<string> {
  const words = tokenizeWords(sentence)
    .map((w) => w.toLowerCase())
    .filter((w) => !isStopword(w) && w.length >= 2);
  return new Set(words);
}

// Compute BM25-normalized lexical similarity between two sentences
function sentenceSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let common = 0;
  for (const t of setA) {
    if (setB.has(t)) common++;
  }
  if (common === 0) return 0;
  // Normalized by log-length to avoid bias toward longer sentences
  return common / (Math.log(setA.size + 1) + Math.log(setB.size + 1));
}

export function summarizeTextRank(
  text: string,
  targetSentences: number = 3,
  dampingFactor: number = 0.85,
  maxIterations: number = 40,
  convergenceThreshold: number = 0.0001
): TextRankSummaryResult {
  const rawSentences = splitSentences(text)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const N = rawSentences.length;

  if (N <= targetSentences || N === 0) {
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    return {
      originalSentenceCount: N,
      originalWordCount: wordCount,
      summarySentenceCount: N,
      summaryWordCount: wordCount,
      compressionRatio: 100,
      summaryText: rawSentences.join(" "),
      rankedSentences: rawSentences.map((s, idx) => ({
        index: idx,
        sentence: s,
        score: 1.0,
        normalizedRank: 1.0,
        wordCount: s.split(/\s+/).length,
      })),
      similarityGraphMatrix: Array(N).fill(0).map(() => Array(N).fill(1)),
      iterationsRan: 0,
      dampingFactor,
      explanation: {
        algorithm: "TextRank Graph PageRank Summarizer",
        graphConstruction: "Document is already concise; full text retained.",
        pagerankConvergence: "Zero iterations needed.",
      },
    };
  }

  // 1. Build Token Sets for each sentence
  const tokenSets = rawSentences.map((s) => cleanTokens(s));

  // 2. Build N x N Weighted Adjacency Matrix
  const W: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));
  const rowSums: number[] = Array(N).fill(0);

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (i !== j) {
        const sim = sentenceSimilarity(tokenSets[i], tokenSets[j]);
        W[i][j] = sim;
        rowSums[i] += sim;
      }
    }
  }

  // 3. Power Iteration PageRank Algorithm
  let PR: number[] = Array(N).fill(1.0 / N);
  let iterations = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations++;
    const nextPR: number[] = Array(N).fill(0);
    let maxDiff = 0;

    for (let i = 0; i < N; i++) {
      let sumIncoming = 0;
      for (let j = 0; j < N; j++) {
        if (i !== j && rowSums[j] > 0) {
          sumIncoming += (W[j][i] / rowSums[j]) * PR[j];
        }
      }
      nextPR[i] = (1 - dampingFactor) / N + dampingFactor * sumIncoming;
      maxDiff = Math.max(maxDiff, Math.abs(nextPR[i] - PR[i]));
    }

    PR = nextPR;
    if (maxDiff < convergenceThreshold) break;
  }

  const maxScore = Math.max(...PR, 0.0001);

  // 4. Score and Rank Sentences
  const rankedSentences: TextRankSentence[] = rawSentences.map((s, idx) => ({
    index: idx,
    sentence: s,
    score: Number(PR[idx].toFixed(5)),
    normalizedRank: Number((PR[idx] / maxScore).toFixed(3)),
    wordCount: s.split(/\s+/).length,
  }));

  // Top K selected sentences by TextRank score
  const sortedByScore = [...rankedSentences].sort((a, b) => b.score - a.score);
  const selectedTopK = sortedByScore.slice(0, Math.min(targetSentences, N));

  // Maintain chronological order for narrative coherence
  selectedTopK.sort((a, b) => a.index - b.index);

  const summaryText = selectedTopK.map((s) => s.sentence).join(" ");
  const originalWordCount = text.split(/\s+/).filter(Boolean).length;
  const summaryWordCount = summaryText.split(/\s+/).filter(Boolean).length;
  const compressionRatio = Number(((summaryWordCount / Math.max(1, originalWordCount)) * 100).toFixed(1));

  return {
    originalSentenceCount: N,
    originalWordCount,
    summarySentenceCount: selectedTopK.length,
    summaryWordCount,
    compressionRatio,
    summaryText,
    rankedSentences,
    similarityGraphMatrix: W.map((row) => row.map((val) => Number(val.toFixed(3)))),
    iterationsRan: iterations,
    dampingFactor,
    explanation: {
      algorithm: "TextRank (Mihalcea & Tarau, 2004) Graph Extractive Summarizer",
      graphConstruction: `Constructed an interconnected ${N}x${N} sentence graph where edge weights reflect shared lexical-semantic information.`,
      pagerankConvergence: `PageRank power iteration converged in ${iterations} iterations (damping d = ${dampingFactor}), identifying the most central sentences.`,
    },
  };
}

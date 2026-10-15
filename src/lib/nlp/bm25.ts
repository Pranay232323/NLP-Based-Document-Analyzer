// Okapi BM25 Probabilistic Information Retrieval Model
// The modern probabilistic ranking function used in Elasticsearch, Lucene, and search engines.
// Contrasts with raw TF-IDF by incorporating:
// 1. Term frequency saturation (k1 parameter)
// 2. Document length normalization penalty (b parameter)

import { tokenizeWords } from "./preprocessing";
import { isStopword } from "./stopwords";

export interface BM25TermScore {
  term: string;
  tf: number;
  idf: number;
  saturatedTf: number;
  scoreContribution: number;
}

export interface BM25DocResult {
  docId: number;
  name: string;
  snippet: string;
  docLength: number;
  score: number;
  termBreakdown: BM25TermScore[];
}

export interface BM25ComparisonResult {
  query: string;
  queryTerms: string[];
  k1: number;
  b: number;
  avgDocLength: number;
  totalCorpusDocs: number;
  rankedResults: BM25DocResult[];
  explanation: {
    k1Role: string;
    bRole: string;
    advantageOverTfIdf: string;
  };
}

function cleanQueryTerms(query: string): string[] {
  return tokenizeWords(query)
    .map((w) => w.toLowerCase())
    .filter((w) => !isStopword(w) && w.length >= 2);
}

export function rankDocumentsBM25(
  corpus: { id: number; name: string; text: string }[],
  query: string,
  k1: number = 1.5,
  b: number = 0.75
): BM25ComparisonResult {
  const queryTerms = cleanQueryTerms(query);
  const N = Math.max(1, corpus.length);

  // Pre-tokenize corpus docs
  const docTokensList = corpus.map((doc) => {
    const tokens = tokenizeWords(doc.text)
      .map((w) => w.toLowerCase())
      .filter((w) => !isStopword(w) && w.length >= 2);
    return {
      doc,
      tokens,
      length: tokens.length,
      tfMap: tokens.reduce((acc, t) => {
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  });

  const totalLength = docTokensList.reduce((sum, d) => sum + d.length, 0);
  const avgdl = totalLength / N || 1;

  // Calculate Document Frequencies (DF) for query terms
  const dfMap: Record<string, number> = {};
  for (const q of queryTerms) {
    let df = 0;
    for (const d of docTokensList) {
      if (d.tfMap[q] && d.tfMap[q] > 0) df++;
    }
    dfMap[q] = df;
  }

  // Calculate IDF for each query term with Robertson-Spärck Jones formula
  const idfMap: Record<string, number> = {};
  for (const q of queryTerms) {
    const df = dfMap[q] || 0;
    // Standard Okapi IDF with smoothing: ln(1 + (N - df + 0.5) / (df + 0.5))
    idfMap[q] = Math.max(0, Math.log(1 + (N - df + 0.5) / (df + 0.5)));
  }

  // Score each document
  const results: BM25DocResult[] = docTokensList.map((d) => {
    let totalScore = 0;
    const termBreakdown: BM25TermScore[] = [];

    for (const q of queryTerms) {
      const tf = d.tfMap[q] || 0;
      const idf = idfMap[q] || 0;

      // BM25 saturation term: (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLength / avgdl)))
      const lenNorm = 1 - b + b * (d.length / avgdl);
      const denominator = tf + k1 * lenNorm;
      const saturatedTf = denominator > 0 ? (tf * (k1 + 1)) / denominator : 0;
      const termScore = idf * saturatedTf;

      totalScore += termScore;
      if (tf > 0) {
        termBreakdown.push({
          term: q,
          tf,
          idf: Number(idf.toFixed(3)),
          saturatedTf: Number(saturatedTf.toFixed(3)),
          scoreContribution: Number(termScore.toFixed(3)),
        });
      }
    }

    const snippet = d.doc.text.slice(0, 160) + (d.doc.text.length > 160 ? "..." : "");

    return {
      docId: d.doc.id,
      name: d.doc.name,
      snippet,
      docLength: d.length,
      score: Number(totalScore.toFixed(4)),
      termBreakdown,
    };
  });

  // Sort by highest BM25 score
  results.sort((a, b) => b.score - a.score);

  return {
    query,
    queryTerms,
    k1,
    b,
    avgDocLength: Number(avgdl.toFixed(1)),
    totalCorpusDocs: N,
    rankedResults: results,
    explanation: {
      k1Role: `k1 = ${k1} controls Term Frequency saturation. As TF increases, score asymptotes toward (k1 + 1) * IDF instead of growing linearly like naive TF.`,
      bRole: `b = ${b} scales document length penalization. If b=1.0, length is fully normalized; if b=0.0, document length is ignored.`,
      advantageOverTfIdf: "BM25 prevents extremely long repetitive documents from dominating search results, providing far superior relevance for real-world queries.",
    },
  };
}

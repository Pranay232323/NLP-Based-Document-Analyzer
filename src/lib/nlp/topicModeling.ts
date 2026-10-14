// Unsupervised Topic Modelling Module (Experiment 13)
// Implements an explainable local Latent Topic Discovery algorithm using
// TF-IDF Term-Document Co-occurrence Matrix Decomposition (NMF-inspired).
// Discovers K topics across document paragraphs or input texts.

import { splitSentences, tokenizeWords } from "./preprocessing";
import { isStopword } from "./stopwords";

export interface TopicTerm {
  term: string;
  weight: number;
}

export interface DiscoveredTopic {
  id: number;
  label: string;
  topTerms: TopicTerm[];
  coherenceScore: number;
}

export interface DocumentTopicDistribution {
  documentIndex: number;
  snippet: string;
  dominantTopic: number;
  dominantWeight: number;
  distribution: { topicId: number; weight: number }[];
}

export interface TopicModelingResult {
  numTopics: number;
  numDocuments: number;
  vocabularySize: number;
  topics: DiscoveredTopic[];
  documentDistributions: DocumentTopicDistribution[];
  explanation: {
    method: string;
    interpretationNote: string;
    parameters: string;
  };
}

export function extractParagraphsOrSentences(text: string): string[] {
  // Try split by double newline first (paragraphs)
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);

  if (paragraphs.length >= 3) {
    return paragraphs;
  }

  // Fallback to grouping sentences (3 sentences per pseudo-document)
  const sentences = splitSentences(text);
  if (sentences.length <= 4) return sentences;

  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    chunks.push(sentences.slice(i, i + 2).join(" "));
  }
  return chunks;
}

export function runTopicModeling(
  documents: string[],
  requestedTopics: number = 3,
  topTermsPerTopic: number = 6
): TopicModelingResult {
  const cleanDocs = documents
    .map((d) => d.trim())
    .filter((d) => d.length > 10);

  if (cleanDocs.length === 0) {
    throw new Error("No valid text documents available for topic modelling.");
  }

  const k = Math.min(Math.max(2, requestedTopics), Math.min(6, cleanDocs.length));

  // Build document-term frequency matrix
  const docTokens = cleanDocs.map((doc) =>
    tokenizeWords(doc)
      .map((w: string) => w.toLowerCase())
      .filter((w: string) =>
        ((/^[a-z]+$/.test(w) && w.length > 2) || (/^[\u0900-\u097F]+$/.test(w) && w.length >= 2)) &&
        !isStopword(w)
      )
  );

  // Term vocabulary and Document Frequencies
  const dfMap = new Map<string, number>();
  for (const tokens of docTokens) {
    const unique = new Set<string>(tokens);
    for (const t of unique) {
      dfMap.set(t, (dfMap.get(t) || 0) + 1);
    }
  }


  // Filter terms that appear at least once
  const vocabulary = Array.from(dfMap.entries())
    .filter(([_, df]) => df >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([term]) => term);

  const V = vocabulary.length;
  const N = cleanDocs.length;

  if (V === 0) {
    throw new Error("Text contains insufficient non-stopword vocabulary to discover topics.");
  }

  // Compute TF-IDF Matrix X: (N docs x V terms)
  const X: number[][] = [];
  for (let d = 0; d < N; d++) {
    const tokens = docTokens[d];
    const tfMap = new Map<string, number>();
    for (const t of tokens) tfMap.set(t, (tfMap.get(t) || 0) + 1);

    const row: number[] = [];
    for (let j = 0; j < V; j++) {
      const term = vocabulary[j];
      const count = tfMap.get(term) || 0;
      const tf = count / Math.max(tokens.length, 1);
      const idf = Math.log((N + 1) / ((dfMap.get(term) || 1) + 0.5)) + 1;
      row.push(tf * idf);
    }
    // L2 Normalize row
    const norm = Math.sqrt(row.reduce((acc, val) => acc + val * val, 0)) || 1;
    X.push(row.map((val) => val / norm));
  }

  // Seed K centroids across document space using K-Means++ initialization
  const centroids: number[][] = [];
  centroids.push([...X[0]]);

  for (let c = 1; c < k; c++) {
    let maxDist = -1;
    let bestDocIdx = 0;
    for (let d = 0; d < N; d++) {
      // Find min distance to existing centroids
      let minDist = Infinity;
      for (const cent of centroids) {
        let dot = 0;
        for (let j = 0; j < V; j++) dot += X[d][j] * cent[j];
        const dist = 1 - dot; // Cosine distance
        if (dist < minDist) minDist = dist;
      }
      if (minDist > maxDist) {
        maxDist = minDist;
        bestDocIdx = d;
      }
    }
    centroids.push([...X[bestDocIdx]]);
  }

  // Run 10 iterations of spherical k-means / NMF clustering
  const assignments: number[] = new Array(N).fill(0);
  for (let iter = 0; iter < 10; iter++) {
    // Expectation: assign documents to closest topic centroid
    for (let d = 0; d < N; d++) {
      let maxSim = -Infinity;
      let bestTopic = 0;
      for (let t = 0; t < k; t++) {
        let dot = 0;
        for (let j = 0; j < V; j++) dot += X[d][j] * centroids[t][j];
        if (dot > maxSim) {
          maxSim = dot;
          bestTopic = t;
        }
      }
      assignments[d] = bestTopic;
    }

    // Maximization: recalculate centroids
    for (let t = 0; t < k; t++) {
      const clusterDocs = X.filter((_, idx) => assignments[idx] === t);
      if (clusterDocs.length > 0) {
        const newCent: number[] = new Array(V).fill(0);
        for (const doc of clusterDocs) {
          for (let j = 0; j < V; j++) newCent[j] += doc[j];
        }
        const norm = Math.sqrt(newCent.reduce((acc, v) => acc + v * v, 0)) || 1;
        centroids[t] = newCent.map((v) => v / norm);
      }
    }
  }

  // Format Discovered Topics
  const topics: DiscoveredTopic[] = centroids.map((cent, tId) => {
    const termWeights: TopicTerm[] = vocabulary.map((term, j) => ({
      term,
      weight: Number(cent[j].toFixed(4)),
    }));

    termWeights.sort((a, b) => b.weight - a.weight);
    const topTerms = termWeights.slice(0, topTermsPerTopic);
    const label = `Topic ${tId + 1}: ${topTerms.slice(0, 3).map((t) => t.term).join(" / ")}`;

    const avgWeight = topTerms.reduce((sum, t) => sum + t.weight, 0) / Math.max(topTerms.length, 1);
    const coherenceScore = Number(avgWeight.toFixed(3));

    return {
      id: tId + 1,
      label,
      topTerms,
      coherenceScore,
    };
  });

  // Calculate Document-Topic Distributions
  const documentDistributions: DocumentTopicDistribution[] = cleanDocs.map((doc, dIdx) => {
    const rawDist = centroids.map((cent, tId) => {
      let dot = 0;
      for (let j = 0; j < V; j++) dot += X[dIdx][j] * cent[j];
      return { topicId: tId + 1, weight: Math.max(0, dot) };
    });

    const sumWeights = rawDist.reduce((acc, r) => acc + r.weight, 0) || 1;
    const normDist = rawDist.map((r) => ({
      topicId: r.topicId,
      weight: Number((r.weight / sumWeights).toFixed(3)),
    }));

    normDist.sort((a, b) => b.weight - a.weight);
    const dominant = normDist[0];

    const snippet = doc.length > 120 ? doc.slice(0, 120) + "..." : doc;

    return {
      documentIndex: dIdx + 1,
      snippet,
      dominantTopic: dominant.topicId,
      dominantWeight: dominant.weight,
      distribution: normDist,
    };
  });

  return {
    numTopics: k,
    numDocuments: N,
    vocabularySize: V,
    topics,
    documentDistributions,
    explanation: {
      method: "Latent Topic Decomposition via Spherical TF-IDF Document-Term Clustering",
      interpretationNote: "Topic titles are mathematical word clusters based on co-occurrence, not verified human semantic classifications.",
      parameters: `K = ${k} topics, V = ${V} vocabulary features across ${N} text units.`,
    },
  };
}

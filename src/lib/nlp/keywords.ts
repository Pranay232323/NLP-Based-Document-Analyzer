// Advanced Keyword & Keyphrase Extraction Module (Experiment 14)
// Implements 4 distinct extraction algorithms for comparative evaluation:
// 1. Raw Term Frequency (TF)
// 2. Sentence-level TF-IDF
// 3. RAKE (Rapid Automatic Keyword Extraction)
// 4. Syntactic Noun Phrase keyphrases via POS chunking

import { splitSentences, tokenizeWords } from "./preprocessing";
import { isStopword } from "./stopwords";
import { posTagTokens } from "./winkEngine";

export interface KeywordItem {
  phrase: string;
  score: number;
  method: "Term Frequency" | "TF-IDF" | "RAKE" | "Noun Phrase";
  details?: string;
}

export interface KeywordExtractionComparison {
  text: string;
  wordCount: number;
  termFrequency: KeywordItem[];
  tfidf: KeywordItem[];
  rake: KeywordItem[];
  nounPhrases: KeywordItem[];
  agreementScore: number; // percentage of top RAKE keywords also found in TF-IDF
  explanation: {
    comparisonRationale: string;
    rakeExplanation: string;
    tfidfExplanation: string;
  };
}

// RAKE Algorithm Implementation
export function extractRAKE(text: string, topK: number = 10): KeywordItem[] {
  // 1. Split text into candidate phrases using punctuation and stopwords as delimiters
  const rawSentences = text.split(/[.!?,;:()\n\[\]"]/);
  const candidatePhrases: string[][] = [];

  for (const sentence of rawSentences) {
    const words = tokenizeWords(sentence);
    let currentPhrase: string[] = [];

    for (const w of words) {
      const lower = w.toLowerCase();
      if (/^[a-z]+$/.test(lower) && !isStopword(lower) && lower.length > 2) {
        currentPhrase.push(lower);
      } else {
        if (currentPhrase.length > 0) {
          candidatePhrases.push(currentPhrase);
          currentPhrase = [];
        }
      }
    }
    if (currentPhrase.length > 0) {
      candidatePhrases.push(currentPhrase);
    }
  }

  if (candidatePhrases.length === 0) return [];

  // 2. Word Frequency and Degree Graph
  const wordFreq = new Map<string, number>();
  const wordDegree = new Map<string, number>();

  for (const phrase of candidatePhrases) {
    const phraseDegree = phrase.length - 1;
    for (const word of phrase) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      wordDegree.set(word, (wordDegree.get(word) || 0) + phraseDegree);
    }
  }

  // 3. Word Score = deg(w) / freq(w)
  const wordScores = new Map<string, number>();
  for (const [w, freq] of wordFreq.entries()) {
    const deg = (wordDegree.get(w) || 0) + freq;
    wordScores.set(w, deg / freq);
  }

  // 4. Candidate Phrase Scores = sum of constituent word scores
  const phraseScoreMap = new Map<string, number>();
  for (const phrase of candidatePhrases) {
    const key = phrase.join(" ");
    let pScore = 0;
    for (const w of phrase) {
      pScore += wordScores.get(w) || 0;
    }
    phraseScoreMap.set(key, Math.max(phraseScoreMap.get(key) || 0, pScore));
  }

  return Array.from(phraseScoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([phrase, score]) => ({
      phrase,
      score: Number(score.toFixed(2)),
      method: "RAKE" as const,
      details: `deg(w)/freq(w) co-occurrence graph score`,
    }));
}

// Sentence-level TF-IDF
export function extractTFIDF(text: string, topK: number = 10): KeywordItem[] {
  const sentences = splitSentences(text).filter((s) => s.length > 15);
  if (sentences.length === 0) return [];

  const N = sentences.length;
  const sentenceTokens = sentences.map((s) =>
    tokenizeWords(s)
      .map((w: string) => w.toLowerCase())
      .filter((w: string) => w.length > 2 && !isStopword(w) && /^[a-z]+$/.test(w))
  );

  const dfMap = new Map<string, number>();
  for (const tokens of sentenceTokens) {
    const set = new Set<string>(tokens);
    for (const t of set) dfMap.set(t, (dfMap.get(t) || 0) + 1);
  }

  const allTokens = sentenceTokens.flat();
  const totalTokens = Math.max(allTokens.length, 1);
  const tfMap = new Map<string, number>();
  for (const t of allTokens) tfMap.set(t, (tfMap.get(t) || 0) + 1);

  const tfidfScores: { phrase: string; score: number }[] = [];
  for (const [term, count] of tfMap.entries()) {
    const tf = count / totalTokens;
    const df = dfMap.get(term) || 1;
    const idf = Math.log((N + 1) / df) + 1;
    tfidfScores.push({ phrase: term, score: tf * idf });
  }

  return tfidfScores
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => ({
      phrase: item.phrase,
      score: Number((item.score * 100).toFixed(2)),
      method: "TF-IDF" as const,
      details: `Normalized TF * log(N/DF) across sentences`,
    }));
}

// Pure Term Frequency
export function extractTermFrequency(text: string, topK: number = 10): KeywordItem[] {
  const words = tokenizeWords(text)
    .map((w: string) => w.toLowerCase())
    .filter((w: string) => w.length > 2 && !isStopword(w) && /^[a-z]+$/.test(w));

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);


  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([phrase, count]) => ({
      phrase,
      score: count,
      method: "Term Frequency" as const,
      details: `${count} occurrences in document`,
    }));
}

// Noun Phrase Keyphrases via POS
export function extractNounPhraseKeywords(text: string, topK: number = 10): KeywordItem[] {
  const sentences = splitSentences(text);
  const phraseCounts = new Map<string, number>();

  for (const s of sentences) {
    const tokens = posTagTokens(s);
    let currentNP: string[] = [];

    for (const t of tokens) {
      const isAdjective = t.pos.startsWith("JJ");
      const isNoun = t.pos.startsWith("NN");
      if (isAdjective || isNoun) {
        if (!isStopword(t.value.toLowerCase())) {
          currentNP.push(t.value.toLowerCase());
        }
      } else {
        if (currentNP.length >= 2) {
          const phrase = currentNP.join(" ");
          phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
        }
        currentNP = [];
      }
    }
    if (currentNP.length >= 2) {
      const phrase = currentNP.join(" ");
      phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
    }
  }

  return Array.from(phraseCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([phrase, count]) => ({
      phrase,
      score: count,
      method: "Noun Phrase" as const,
      details: `POS pattern: <JJ>* <NN+> (${count}x)`,
    }));
}

export function compareKeywordMethods(text: string): KeywordExtractionComparison {
  const words = tokenizeWords(text);
  const termFrequency = extractTermFrequency(text, 10);
  const tfidf = extractTFIDF(text, 10);
  const rake = extractRAKE(text, 10);
  const nounPhrases = extractNounPhraseKeywords(text, 10);

  // Measure top-5 overlap between RAKE and TF-IDF
  const tfidfTerms = new Set(tfidf.map((t) => t.phrase.toLowerCase()));
  let matchCount = 0;
  for (const r of rake.slice(0, 5)) {
    const wordsInPhrase = r.phrase.split(" ");
    if (wordsInPhrase.some((w) => tfidfTerms.has(w))) {
      matchCount++;
    }
  }
  const agreementScore = Number(((matchCount / Math.max(1, Math.min(5, rake.length))) * 100).toFixed(1));

  return {
    text,
    wordCount: words.length,
    termFrequency,
    tfidf,
    rake,
    nounPhrases,
    agreementScore,
    explanation: {
      comparisonRationale:
        "Term Frequency surfaces dominant words but biases towards repeated general terms. TF-IDF penalizes terms common across all sentences. RAKE builds a co-occurrence graph to find multi-word cohesive concepts without training. Noun phrase chunking leverages grammatical syntax.",
      rakeExplanation:
        "RAKE scores candidate phrases by summing each word's degree/frequency ratio (deg(w)/freq(w)), favoring words that appear frequently inside longer phrases rather than isolated stop-contexts.",
      tfidfExplanation:
        "Sentence-level TF-IDF treats each sentence as a mini-document; words appearing in only a few key sentences receive elevated discriminatory weights.",
    },
  };
}

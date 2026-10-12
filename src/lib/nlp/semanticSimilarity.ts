// Advanced Semantic Similarity Module (Experiment 16)
// Provides multi-dimensional similarity analysis across:
// 1. Lexical TF-IDF Vector Cosine Similarity
// 2. Token Jaccard Similarity (Set Intersection over Union)
// 3. Sub-word Character Tri-gram Dice Similarity (morphological/spelling overlap)
// 4. Soft-Lemma Semantic Alignment (matches lemmas and inflections)
// With clear educational explanations contrasting lexical vs semantic similarity.

import { tokenizeWords } from "./preprocessing";
import { isStopword } from "./stopwords";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const winkLemmatizer = require("wink-lemmatizer");

export interface TokenAlignment {
  tokenA: string;
  matchedTokenB: string | null;
  matchType: "Exact" | "Lemma Match" | "Sub-word / Fuzzy" | "No Match";
  score: number;
}

export interface MultiMetricSimilarityResult {
  textA: string;
  textB: string;
  metrics: {
    lexicalCosine: number;      // 0.0 to 1.0 (TF-IDF vector space)
    tokenJaccard: number;       // 0.0 to 1.0 (Set IOU)
    charNgramDice: number;      // 0.0 to 1.0 (Character 3-gram Dice)
    softSemanticScore: number;  // 0.0 to 1.0 (Lemmatized soft alignment)
    compositeScore: number;     // Balanced weighted composite (0.0 to 1.0)
  };
  interpretation: {
    level: "Identical or Near-Identical" | "High Semantic Overlap" | "Moderate Topical Overlap" | "Low / Divergent";
    lexicalVsSemanticInsight: string;
    plagiarismDisclaimer: string;
  };
  tokenAlignments: TokenAlignment[];
  commonKeywords: string[];
  vocabularyA: string[];
  vocabularyB: string[];
}

function cleanTokens(text: string): string[] {
  return tokenizeWords(text)
    .map((w: string) => w.toLowerCase())
    .filter((w: string) => w.length > 1 && /^[a-z]+$/.test(w));
}

function filterContentTokens(tokens: string[]): string[] {
  return tokens.filter((t) => !isStopword(t) && t.length > 2);
}

function lemmatizeToken(word: string): string {
  const lower = word.toLowerCase();
  return (
    winkLemmatizer.noun(lower) ||
    winkLemmatizer.verb(lower) ||
    winkLemmatizer.adjective(lower) ||
    lower
  );
}



function computeCharTriGrams(str: string): Set<string> {
  const padded = `  ${str.toLowerCase()}  `;
  const ngrams = new Set<string>();
  for (let i = 0; i <= padded.length - 3; i++) {
    ngrams.add(padded.slice(i, i + 3));
  }
  return ngrams;
}

export function computeMultiMetricSimilarity(textA: string, textB: string): MultiMetricSimilarityResult {
  const rawTokensA = cleanTokens(textA);
  const rawTokensB = cleanTokens(textB);

  const contentA = filterContentTokens(rawTokensA);
  const contentB = filterContentTokens(rawTokensB);

  const setA = new Set(contentA);
  const setB = new Set(contentB);

  // 1. Jaccard Similarity (Intersection over Union)
  const intersection: string[] = [];
  for (const t of setA) {
    if (setB.has(t)) intersection.push(t);
  }
  const union = new Set([...setA, ...setB]);
  const tokenJaccard = union.size > 0 ? Number((intersection.length / union.size).toFixed(3)) : 0;

  // 2. Character Tri-gram Dice Similarity (morphological & fuzzy overlap)
  const ngramsA = computeCharTriGrams(textA);
  const ngramsB = computeCharTriGrams(textB);
  let sharedNgrams = 0;
  for (const ng of ngramsA) {
    if (ngramsB.has(ng)) sharedNgrams++;
  }
  const charNgramDice =
    ngramsA.size + ngramsB.size > 0
      ? Number(((2 * sharedNgrams) / (ngramsA.size + ngramsB.size)).toFixed(3))
      : 0;

  // 3. TF-IDF Cosine Vector Similarity
  const allVocab = Array.from(union);
  const tfA = new Map<string, number>();
  const tfB = new Map<string, number>();
  for (const t of contentA) tfA.set(t, (tfA.get(t) || 0) + 1);
  for (const t of contentB) tfB.set(t, (tfB.get(t) || 0) + 1);

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const term of allVocab) {
    const valA = (tfA.get(term) || 0) / Math.max(contentA.length, 1);
    const valB = (tfB.get(term) || 0) / Math.max(contentB.length, 1);
    dotProduct += valA * valB;
    magA += valA * valA;
    magB += valB * valB;
  }

  const lexicalCosine =
    magA > 0 && magB > 0 ? Number((dotProduct / (Math.sqrt(magA) * Math.sqrt(magB))).toFixed(3)) : 0;

  // 4. Soft-Semantic Lemmatized Token Alignment
  const lemmasB = contentB.map((t) => ({ raw: t, lemma: lemmatizeToken(t) }));
  const tokenAlignments: TokenAlignment[] = [];
  let softMatchScoreSum = 0;

  for (const token of contentA) {
    const lemmaA = lemmatizeToken(token);
    let bestMatch: TokenAlignment = {
      tokenA: token,
      matchedTokenB: null,
      matchType: "No Match",
      score: 0,
    };

    for (const b of lemmasB) {
      if (token === b.raw) {
        bestMatch = { tokenA: token, matchedTokenB: b.raw, matchType: "Exact", score: 1.0 };
        break;
      } else if (lemmaA === b.lemma) {
        bestMatch = { tokenA: token, matchedTokenB: b.raw, matchType: "Lemma Match", score: 0.85 };
      } else if (bestMatch.score < 0.5) {
        // Character overlap check
        const triA = computeCharTriGrams(token);
        const triB = computeCharTriGrams(b.raw);
        let shared = 0;
        for (const t of triA) if (triB.has(t)) shared++;
        const dice = (2 * shared) / (triA.size + triB.size);
        if (dice > 0.65) {
          bestMatch = {
            tokenA: token,
            matchedTokenB: b.raw,
            matchType: "Sub-word / Fuzzy",
            score: Number((dice * 0.7).toFixed(2)),
          };
        }
      }
    }

    tokenAlignments.push(bestMatch);
    softMatchScoreSum += bestMatch.score;
  }

  const softSemanticScore =
    contentA.length > 0 ? Number((softMatchScoreSum / contentA.length).toFixed(3)) : 0;

  // Weighted composite score: 35% Cosine, 20% Jaccard, 15% CharDice, 30% SoftSemantic
  const compositeScore = Number(
    (
      lexicalCosine * 0.35 +
      tokenJaccard * 0.2 +
      charNgramDice * 0.15 +
      softSemanticScore * 0.3
    ).toFixed(3)
  );

  let level: MultiMetricSimilarityResult["interpretation"]["level"] = "Low / Divergent";
  if (compositeScore >= 0.8) level = "Identical or Near-Identical";
  else if (compositeScore >= 0.5) level = "High Semantic Overlap";
  else if (compositeScore >= 0.25) level = "Moderate Topical Overlap";

  return {
    textA,
    textB,
    metrics: {
      lexicalCosine,
      tokenJaccard,
      charNgramDice,
      softSemanticScore,
      compositeScore,
    },
    interpretation: {
      level,
      lexicalVsSemanticInsight:
        lexicalCosine > softSemanticScore + 0.15
          ? "High exact lexical matching: the texts share verbatim vocabulary, though sentence structures may differ."
          : softSemanticScore > lexicalCosine + 0.15
          ? "Semantic paraphrase detected: different morphological inflections or near-synonyms were used to express related content."
          : "Lexical and semantic metrics are well aligned.",
      plagiarismDisclaimer:
        "IMPORTANT ACADEMIC NOTE: Similarity scores measure textual or lexical overlap. A high score is NOT proof of academic plagiarism, as citations, definitions, and standard domain terminology naturally generate elevated scores.",
    },
    tokenAlignments: tokenAlignments.slice(0, 20),
    commonKeywords: intersection.slice(0, 15),
    vocabularyA: Array.from(setA).slice(0, 15),
    vocabularyB: Array.from(setB).slice(0, 15),
  };
}

export const SAMPLE_SIMILARITY_PAIRS = [
  {
    label: "Paraphrased Sentences (Semantic Match)",
    textA: "The software engineering student implemented a machine learning algorithm to classify research articles.",
    textB: "A computer science scholar developed an ML model for categorizing scientific papers.",
  },
  {
    label: "Near-Duplicate Academic Paragraphs",
    textA: "Natural language processing combines computational linguistics with statistical models to process unstructured text documents efficiently.",
    textB: "Natural language processing utilizes computational linguistics and statistical models to analyze unstructured documents with high efficiency.",
  },
  {
    label: "Completely Unrelated Topics",
    textA: "The soccer team won the tournament final after scoring a penalty shootout in extra time.",
    textB: "Quantum cryptography relies on the uncertainty principle to secure communications against eavesdropping.",
  },
];

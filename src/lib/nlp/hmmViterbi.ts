// Hidden Markov Model (HMM) & Viterbi Dynamic Programming Algorithm
// The foundational probabilistic sequence labeling model in NLP syllabi.
// Computes:
// 1. State Transition Matrix A: P(tag_j | tag_i)
// 2. Emission Matrix B: P(word_k | tag_j)
// 3. Viterbi Trellis Matrix DP table: v_t(j) = max_i [v_{t-1}(i) * A_ij] * B_j(w_t)
// 4. Backpointer matrix and globally optimal tag path

import { tokenizeWords } from "./preprocessing";

export interface ViterbiCell {
  tag: string;
  logProb: number;
  prob: number;
  backpointerTag: string | null;
  transitionScore: number;
  emissionScore: number;
}

export interface ViterbiColumn {
  tokenIndex: number;
  token: string;
  cells: Record<string, ViterbiCell>;
  bestTag: string;
}

export interface HMMViterbiResult {
  tokens: string[];
  states: string[];
  optimalPath: { token: string; tag: string; confidence: number }[];
  trellis: ViterbiColumn[];
  transitionMatrix: { fromTag: string; toTag: string; prob: number }[];
  emissionMatrix: { tag: string; word: string; prob: number }[];
  totalLogLikelihood: number;
  explanation: {
    modelType: string;
    viterbiFormula: string;
    academicSignificance: string;
  };
}

// Canonical Penn Treebank tag states for educational modeling
export const HMM_STATES = ["NN", "VB", "JJ", "DT", "RB", "IN"];

// Representative empirical transition probabilities P(t_j | t_i)
const TRANSITIONS: Record<string, Record<string, number>> = {
  START: { DT: 0.40, NN: 0.30, JJ: 0.15, RB: 0.08, VB: 0.05, IN: 0.02 },
  DT:    { NN: 0.65, JJ: 0.25, RB: 0.05, VB: 0.03, DT: 0.01, IN: 0.01 },
  JJ:    { NN: 0.70, JJ: 0.15, VB: 0.08, IN: 0.05, DT: 0.01, RB: 0.01 },
  NN:    { VB: 0.45, IN: 0.25, NN: 0.15, RB: 0.08, DT: 0.04, JJ: 0.03 },
  VB:    { DT: 0.35, NN: 0.25, JJ: 0.15, RB: 0.12, IN: 0.10, VB: 0.03 },
  RB:    { VB: 0.50, JJ: 0.30, RB: 0.10, IN: 0.05, NN: 0.03, DT: 0.02 },
  IN:    { DT: 0.45, NN: 0.35, JJ: 0.12, RB: 0.04, IN: 0.02, VB: 0.02 },
};

// Heuristic emission probabilities P(w | t) with Laplace smoothing
function getEmissionProbability(word: string, tag: string): number {
  const lower = word.toLowerCase();

  const DT_WORDS = new Set(["the", "a", "an", "this", "that", "these", "those", "every"]);
  const IN_WORDS = new Set(["in", "on", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "over"]);
  const RB_WORDS = new Set(["not", "very", "quickly", "clearly", "well", "slowly", "never", "always", "often", "completely", "really"]);
  const NN_WORDS = new Set(["fox", "dog", "cat", "student", "college", "model", "computer", "system", "language", "speech", "text"]);
  const JJ_WORDS = new Set(["quick", "brown", "lazy", "hard", "smart", "natural", "good", "bad", "new"]);
  const VB_WORDS = new Set(["jumps", "studies", "process", "run", "runs", "is", "are", "have", "has"]);

  if (DT_WORDS.has(lower)) return tag === "DT" ? 0.85 : 0.01;
  if (IN_WORDS.has(lower)) return tag === "IN" ? 0.80 : 0.01;
  if (RB_WORDS.has(lower) || lower.endsWith("ly")) return tag === "RB" ? 0.75 : 0.02;
  if (NN_WORDS.has(lower)) return tag === "NN" ? 0.85 : 0.02;
  if (JJ_WORDS.has(lower)) return tag === "JJ" ? 0.80 : 0.02;
  if (VB_WORDS.has(lower)) return tag === "VB" ? 0.80 : 0.02;

  // Suffix morphological clues for verbs and adjectives
  if (/ing$/i.test(lower) || /ed$/i.test(lower) || /ize$/i.test(lower) || /ate$/i.test(lower)) {
    return tag === "VB" ? 0.65 : tag === "JJ" ? 0.20 : 0.03;
  }
  if (/able$/i.test(lower) || /ous$/i.test(lower) || /ive$/i.test(lower) || /ful$/i.test(lower) || /less$/i.test(lower)) {
    return tag === "JJ" ? 0.75 : tag === "NN" ? 0.10 : 0.02;
  }
  if (/tion$/i.test(lower) || /ment$/i.test(lower) || /ness$/i.test(lower) || /ity$/i.test(lower)) {
    return tag === "NN" ? 0.80 : 0.02;
  }

  // Devanagari function markers
  if (/^(का|के|की|में|से|को|पर|च्या|ची|चे|चा|मध्ये)$/.test(word)) {
    return tag === "IN" ? 0.85 : 0.01;
  }
  if (/^(है|हैं|था|थी|आहे|होते|आहेत|नाही)$/.test(word)) {
    return tag === "VB" ? 0.85 : 0.01;
  }

  // Baseline distribution
  if (tag === "NN") return 0.40;
  if (tag === "JJ") return 0.25;
  if (tag === "VB") return 0.20;
  if (tag === "RB") return 0.08;
  if (tag === "IN") return 0.05;
  return 0.02;
}

export function runHMMViterbi(text: string): HMMViterbiResult {
  const tokens = tokenizeWords(text).slice(0, 10);
  const T = tokens.length;

  if (T === 0) {
    return {
      tokens: [],
      states: HMM_STATES,
      optimalPath: [],
      trellis: [],
      transitionMatrix: [],
      emissionMatrix: [],
      totalLogLikelihood: 0,
      explanation: {
        modelType: "First-Order Bigram Hidden Markov Model",
        viterbiFormula: "v_t(j) = max_i [ v_{t-1}(i) * A_{ij} ] * B_j(w_t)",
        academicSignificance: "Please provide a sentence to compute the Viterbi trellis dynamic programming table.",
      },
    };
  }

  const trellis: ViterbiColumn[] = [];

  // Step 1: Initialization (t = 0)
  const firstWord = tokens[0];
  const col0: Record<string, ViterbiCell> = {};

  for (const tag of HMM_STATES) {
    const startTrans = TRANSITIONS.START[tag] || 0.01;
    const emit = getEmissionProbability(firstWord, tag);
    const prob = startTrans * emit;
    col0[tag] = {
      tag,
      prob,
      logProb: Math.log(Math.max(1e-12, prob)),
      backpointerTag: "START",
      transitionScore: Number(startTrans.toFixed(3)),
      emissionScore: Number(emit.toFixed(3)),
    };
  }

  let bestTag0 = HMM_STATES[0];
  let maxP0 = -Infinity;
  for (const tag of HMM_STATES) {
    if (col0[tag].prob > maxP0) {
      maxP0 = col0[tag].prob;
      bestTag0 = tag;
    }
  }

  trellis.push({ tokenIndex: 0, token: firstWord, cells: col0, bestTag: bestTag0 });

  // Step 2: Recursion (t = 1 to T - 1)
  for (let t = 1; t < T; t++) {
    const word = tokens[t];
    const prevCol = trellis[t - 1].cells;
    const currentCells: Record<string, ViterbiCell> = {};

    let colBestTag = HMM_STATES[0];
    let colMaxProb = -Infinity;

    for (const currTag of HMM_STATES) {
      const emit = getEmissionProbability(word, currTag);
      let maxPrevScore = -Infinity;
      let bestBackpointer = HMM_STATES[0];
      let bestTrans = 0.01;

      for (const prevTag of HMM_STATES) {
        const trans = TRANSITIONS[prevTag]?.[currTag] || 0.01;
        const candidateScore = prevCol[prevTag].prob * trans;
        if (candidateScore > maxPrevScore) {
          maxPrevScore = candidateScore;
          bestBackpointer = prevTag;
          bestTrans = trans;
        }
      }

      const cellProb = maxPrevScore * emit;
      currentCells[currTag] = {
        tag: currTag,
        prob: cellProb,
        logProb: Math.log(Math.max(1e-15, cellProb)),
        backpointerTag: bestBackpointer,
        transitionScore: Number(bestTrans.toFixed(3)),
        emissionScore: Number(emit.toFixed(3)),
      };

      if (cellProb > colMaxProb) {
        colMaxProb = cellProb;
        colBestTag = currTag;
      }
    }

    trellis.push({ tokenIndex: t, token: word, cells: currentCells, bestTag: colBestTag });
  }

  // Step 3: Backtracking to recover optimal path
  const optimalPath: { token: string; tag: string; confidence: number }[] = Array(T);

  // Find best final state
  const lastCol = trellis[T - 1].cells;
  let bestFinalTag = HMM_STATES[0];
  let maxFinalProb = -Infinity;
  for (const tag of HMM_STATES) {
    if (lastCol[tag].prob > maxFinalProb) {
      maxFinalProb = lastCol[tag].prob;
      bestFinalTag = tag;
    }
  }

  let currTag = bestFinalTag;
  for (let t = T - 1; t >= 0; t--) {
    const cell = trellis[t].cells[currTag];
    optimalPath[t] = {
      token: tokens[t],
      tag: currTag,
      confidence: Number(Math.min(0.99, Math.max(0.4, cell.emissionScore * 0.8 + 0.2)).toFixed(2)),
    };
    currTag = cell.backpointerTag && cell.backpointerTag !== "START" ? cell.backpointerTag : HMM_STATES[0];
  }

  // Flatten sample transitions and emissions for educational table view
  const transitionMatrix: { fromTag: string; toTag: string; prob: number }[] = [];
  for (const fromTag of HMM_STATES) {
    for (const toTag of HMM_STATES) {
      transitionMatrix.push({
        fromTag,
        toTag,
        prob: Number((TRANSITIONS[fromTag]?.[toTag] || 0.01).toFixed(3)),
      });
    }
  }

  const emissionMatrix: { tag: string; word: string; prob: number }[] = [];
  for (const w of tokens) {
    for (const tag of HMM_STATES) {
      emissionMatrix.push({
        tag,
        word: w,
        prob: Number(getEmissionProbability(w, tag).toFixed(3)),
      });
    }
  }

  const totalLogLikelihood = Number(trellis[T - 1].cells[bestFinalTag].logProb.toFixed(2));

  return {
    tokens,
    states: HMM_STATES,
    optimalPath,
    trellis,
    transitionMatrix,
    emissionMatrix,
    totalLogLikelihood,
    explanation: {
      modelType: "First-Order Bigram Hidden Markov Model (HMM)",
      viterbiFormula: "v_t(j) = max_i [ v_{t-1}(i) * P(t_j | t_i) ] * P(w_t | t_j)",
      academicSignificance: "The Viterbi algorithm uses dynamic programming to find the globally optimal tag sequence in O(T * |S|^2) time instead of exponential O(|S|^T) brute-force time.",
    },
  };
}

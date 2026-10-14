// Orchestrates every NLP module (Experiments 2-8, 10) into one AnalysisResult
// that powers the Dashboard, individual experiment pages and the final report.
import { preprocessText, splitSentences, computeTextStatistics } from "./preprocessing";
import { buildStemLemmaTable } from "./stemLemma";
import { analyzeMorphologyBatch, generateWordForms } from "./morphology";
import { posTagDocument, winkSentences } from "./winkEngine";
import { describeTag, isPunctuationTag } from "./posTags";
import { chunkDocument } from "./chunking";
import { extractEntities } from "./ner";
import { wordSequence, buildAllModels, summarizeModel } from "./ngram";
import { wordFrequencies } from "./wordStats";
import { analyzeSentiment } from "./sentiment";
import { identifyLanguage } from "./languageId";
import { compareKeywordMethods } from "./keywords";
import type { AnalysisResult, POSRow } from "./types";


export function analyzeDocument(text: string, docName: string): AnalysisResult {
  const sentences = winkSentences(text).length ? winkSentences(text) : splitSentences(text);
  const preprocessing = preprocessText(text);
  const stats = computeTextStatistics(text, preprocessing.wordTokens, sentences);

  // POS tagging (Experiment 6) over the whole document.
  const taggedTokens = posTagDocument(text);
  const wordTagged = taggedTokens.filter((t) => /^[A-Za-z]+(?:'[A-Za-z]+)?$/.test(t.value) || /^[\u0900-\u097F]+$/.test(t.value));
  const pos: POSRow[] = taggedTokens
    .filter((t) => !isPunctuationTag(t.pos))
    .map((t) => ({ word: t.value, tag: t.pos, description: describeTag(t.pos) }));

  const posDistMap = new Map<string, number>();
  for (const row of pos) posDistMap.set(row.tag, (posDistMap.get(row.tag) ?? 0) + 1);
  const posDistribution = Array.from(posDistMap.entries())
    .map(([tag, count]) => ({ tag, description: describeTag(tag), count }))
    .sort((a, b) => b.count - a.count);

  // Stemming + Lemmatization (Experiment 3) using POS hints where available.
  const posByWord = new Map<string, string>();
  for (const t of wordTagged) {
    if (!posByWord.has(t.value.toLowerCase())) posByWord.set(t.value.toLowerCase(), t.pos);
  }
  const stemLemma = buildStemLemmaTable(preprocessing.filteredTokens, posByWord);

  // Morphology (Experiment 4) over the most frequent meaningful words.
  const freq = new Map<string, number>();
  for (const w of preprocessing.filteredTokens) freq.set(w.toLowerCase(), (freq.get(w.toLowerCase()) ?? 0) + 1);
  const topWords = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([w]) => w);
  const morphology = analyzeMorphologyBatch(topWords.length ? topWords : preprocessing.filteredTokens.slice(0, 15));
  const wordGenerationSample = generateWordForms(topWords[0] ?? preprocessing.filteredTokens[0] ?? "play");

  // Chunking (Experiment 7).
  const chunks = chunkDocument(text);

  // Named Entity Recognition (Experiment 8).
  const entities = extractEntities(text);

  // N-Gram models (Experiment 5) - build once so the report can show stats
  // immediately; the dedicated N-Gram Lab page builds live predictions too.
  const sequence = wordSequence(text);
  const models = buildAllModels(sequence);
  const ngramSummaries = [1, 2, 3].map((n) => summarizeModel(models[n]));

  // Word frequency / EDA (Experiment 10).
  const keywords = wordFrequencies(text, 40);

  // Advanced Experiments integrated for immediate inspection & report inclusion
  const sentiment = analyzeSentiment(text);
  const languageIdentification = identifyLanguage(text);
  const keywordComparison = compareKeywordMethods(text);

  return {
    meta: { docName, stats, scriptValidation: preprocessing.scriptValidation },
    sentences,
    preprocessing,
    stemLemma,
    morphology,
    wordGenerationSample,
    pos,
    posDistribution,
    chunks,
    entities,
    ngramSummaries,
    keywords,
    rawText: text,
    sentiment,
    languageIdentification,
    keywordComparison,
  };
}


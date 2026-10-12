// Shared TypeScript types for the NLP Intelligence Platform.
// Every NLP module returns plain JSON-serialisable objects so results can be
// cached on the client (React context + localStorage) and reused across pages.

export interface ScriptValidation {
  isValid: boolean;
  label: "Valid Latin Script" | "Invalid or Mixed Script";
  latinChars: number;
  nonLatinChars: number;
  totalAlphaChars: number;
  latinRatio: number;
}

export interface PreprocessingResult {
  originalText: string;
  rawTokens: string[];
  wordTokens: string[];
  filteredTokens: string[];
  removedStopwords: string[];
  removedNumeric: string[];
  removedPunctuation: string[];
  scriptValidation: ScriptValidation;
}

export interface StemLemmaRow {
  word: string;
  stemmed: string;
  lemmatized: string;
  pos: string;
}

export interface MorphologyBreakdown {
  word: string;
  prefix: string | null;
  root: string;
  suffix: string | null;
  notes: string;
}

export interface WordGeneration {
  base: string;
  variants: string[];
}

export interface NGramEntry {
  ngram: string;
  count: number;
  probability: number;
}

export interface NGramModelSummary {
  n: number;
  label: string;
  totalNGrams: number;
  uniqueNGrams: number;
  topNGrams: NGramEntry[];
}

export interface NGramPrediction {
  context: string;
  n: number;
  found: boolean;
  usedBackoff: boolean;
  backoffN?: number;
  predictions: { word: string; count: number; probability: number }[];
}

export interface NGramGeneration {
  seed: string;
  n: number;
  generated: string;
  steps: { word: string; source: "model" | "backoff" | "random-seed" }[];
}

export interface POSRow {
  word: string;
  tag: string;
  description: string;
}

export interface ChunkResult {
  type: "NP" | "VP" | "PP";
  text: string;
  sentenceIndex: number;
  pattern: string;
}

export interface EntityResult {
  text: string;
  type: string;
  category: "Person/Org/Place" | "Numeric/Temporal" | "Other";
  start: number;
  end: number;
}

export interface KeywordFrequency {
  word: string;
  count: number;
  percentage: number;
}

export interface TextStatistics {
  charCount: number;
  charCountNoSpaces: number;
  wordCount: number;
  uniqueWordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  avgWordLength: number;
  lexicalDiversity: number;
}

export interface DocumentMeta {
  docName: string;
  stats: TextStatistics;
  scriptValidation: ScriptValidation;
}

// Re-export advanced experiment types for unified platform consumption
export type { SentimentAnalysisResult } from "./sentiment";
export type { ClassificationExperimentResult, ClassificationPrediction } from "./classification";
export type { TopicModelingResult } from "./topicModeling";
export type { KeywordExtractionComparison } from "./keywords";
export type { LanguageIdentificationResult } from "./languageId";
export type { MultiMetricSimilarityResult } from "./semanticSimilarity";

import type { SentimentAnalysisResult } from "./sentiment";
import type { TopicModelingResult } from "./topicModeling";
import type { KeywordExtractionComparison } from "./keywords";
import type { LanguageIdentificationResult } from "./languageId";

export interface AnalysisResult {
  meta: DocumentMeta;
  sentences: string[];
  preprocessing: PreprocessingResult;
  stemLemma: StemLemmaRow[];
  morphology: MorphologyBreakdown[];
  wordGenerationSample: WordGeneration;
  pos: POSRow[];
  posDistribution: { tag: string; description: string; count: number }[];
  chunks: ChunkResult[];
  entities: EntityResult[];
  ngramSummaries: NGramModelSummary[];
  keywords: KeywordFrequency[];
  rawText: string;
  // Advanced NLP module results (computed or cached)
  sentiment?: SentimentAnalysisResult;
  topics?: TopicModelingResult;
  keywordComparison?: KeywordExtractionComparison;
  languageIdentification?: LanguageIdentificationResult;
}

export interface SimilarityResult {
  docAName: string;
  docBName: string;
  cosineSimilarity: number;
  similarityPercentage: number;
  similarityLevel: "Highly Similar" | "Moderately Similar" | "Slightly Similar" | "Not Similar";
  commonTerms: { term: string; weightA: number; weightB: number }[];
  topTermsA: { term: string; weight: number }[];
  topTermsB: { term: string; weight: number }[];
  vocabSize: number;
}


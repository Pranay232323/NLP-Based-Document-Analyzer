// EXPERIMENT 2: Text Pre-processing - Tokenization, Filtration & Script Validation
import { isStopword } from "./stopwords";
import type { PreprocessingResult, ScriptValidation, TextStatistics } from "./types";

/** Split raw sentences using punctuation-aware boundaries (. ! ?) */
export function splitSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  // Split on sentence terminators while keeping reasonable abbreviation handling simple.
  const parts = cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'“])/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [cleaned];
}

/** Tokenization: break text into raw tokens (words, numbers, punctuation). */
export function tokenize(text: string): string[] {
  const matches = text.match(/[A-Za-z]+(?:'[A-Za-z]+)?|\d+(?:\.\d+)?|[^\sA-Za-z0-9]/g);
  return matches ?? [];
}

export function isWordToken(token: string): boolean {
  return /^[A-Za-z]+(?:'[A-Za-z]+)?$/.test(token);
}

export function isNumericToken(token: string): boolean {
  return /^\d+(?:\.\d+)?$/.test(token);
}

export function isPunctuationToken(token: string): boolean {
  return /^[^\sA-Za-z0-9]+$/.test(token);
}

/** Script validation: check whether the text is predominantly Latin/English script. */
export function validateScript(text: string): ScriptValidation {
  const alphaChars = text.match(/\p{L}/gu) ?? [];
  const latinChars = text.match(/[A-Za-z]/g) ?? [];
  const totalAlphaChars = alphaChars.length;
  const latinCount = latinChars.length;
  const nonLatinChars = totalAlphaChars - latinCount;
  const latinRatio = totalAlphaChars === 0 ? 1 : latinCount / totalAlphaChars;
  const isValid = totalAlphaChars === 0 ? true : latinRatio >= 0.9;

  return {
    isValid,
    label: isValid ? "Valid Latin Script" : "Invalid or Mixed Script",
    latinChars: latinCount,
    nonLatinChars,
    totalAlphaChars,
    latinRatio: Number((latinRatio * 100).toFixed(2)),
  };
}

/** Full preprocessing pipeline: tokenization -> filtration -> script validation. */
export function preprocessText(text: string): PreprocessingResult {
  const rawTokens = tokenize(text);
  const wordTokens = rawTokens.filter(isWordToken);
  const removedNumeric = rawTokens.filter(isNumericToken);
  const removedPunctuation = rawTokens.filter(isPunctuationToken);

  const removedStopwords: string[] = [];
  const filteredTokens: string[] = [];

  for (const token of wordTokens) {
    const lower = token.toLowerCase();
    if (isStopword(lower) || lower.length <= 1) {
      removedStopwords.push(token);
    } else {
      filteredTokens.push(token);
    }
  }

  return {
    originalText: text,
    rawTokens,
    wordTokens,
    filteredTokens,
    removedStopwords,
    removedNumeric,
    removedPunctuation,
    scriptValidation: validateScript(text),
  };
}

export function computeTextStatistics(text: string, wordTokens: string[], sentences: string[]): TextStatistics {
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, "").length;
  const wordCount = wordTokens.length;
  const uniqueWordCount = new Set(wordTokens.map((w) => w.toLowerCase())).size;
  const sentenceCount = sentences.length || 1;
  const avgSentenceLength = wordCount / sentenceCount;
  const totalWordLength = wordTokens.reduce((sum, w) => sum + w.length, 0);
  const avgWordLength = wordCount === 0 ? 0 : totalWordLength / wordCount;
  const lexicalDiversity = wordCount === 0 ? 0 : uniqueWordCount / wordCount;

  return {
    charCount,
    charCountNoSpaces,
    wordCount,
    uniqueWordCount,
    sentenceCount,
    avgSentenceLength: Number(avgSentenceLength.toFixed(2)),
    avgWordLength: Number(avgWordLength.toFixed(2)),
    lexicalDiversity: Number(lexicalDiversity.toFixed(3)),
  };
}

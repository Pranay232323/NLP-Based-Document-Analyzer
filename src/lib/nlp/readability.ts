// Psycholinguistic Readability & Text Complexity Models
// Calculates:
// 1. Flesch Reading Ease (0 to 100 scale)
// 2. Flesch-Kincaid Grade Level
// 3. Gunning Fog Index
// 4. Coleman-Liau Index
// 5. Lexical Density (Content Words vs Total Words)
// 6. Polysyllabic Word Distribution

import { splitSentences, tokenizeWords } from "./preprocessing";
import { isStopword } from "./stopwords";

export interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschReadingEaseLabel: string;
  fleschKincaidGrade: number;
  gunningFogIndex: number;
  colemanLiauIndex: number;
  lexicalDensity: number; // percentage of content words
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  complexWordCount: number; // words with >= 3 syllables
  avgSentenceLength: number; // words per sentence
  avgSyllablesPerWord: number;
  interpretation: {
    targetAudience: string;
    readingDifficulty: "Very Easy" | "Easy" | "Standard / Conversational" | "Difficult / Academic" | "Very Difficult / Research Paper";
    summary: string;
  };
}

/** Counts syllables in an English or phonetic word */
export function countSyllables(wordRaw: string): number {
  const word = wordRaw.toLowerCase().replace(/[^a-z\u0900-\u097F]/g, "");
  if (!word) return 1;

  // Devanagari (Hindi/Marathi): Each akshara / vowel diacritic represents a syllable
  if (/[\u0900-\u097F]/.test(word)) {
    const vowelSigns = word.match(/[\u0904-\u0914\u093E-\u094C\u0902\u0903]/g);
    const consonants = word.match(/[\u0915-\u0939]/g);
    return Math.max(1, (vowelSigns?.length ?? 0) + Math.ceil((consonants?.length ?? 0) * 0.7));
  }

  // English syllable counting heuristics
  if (word.length <= 3) return 1;

  let cleaned = word.replace(/(?:[^laeiouy]|ed|es|e)$/, "");
  cleaned = cleaned.replace(/^y/, "");
  const vowelMatches = cleaned.match(/[aeiouy]{1,2}/g);
  return vowelMatches ? Math.max(1, vowelMatches.length) : 1;
}

export function computeReadability(text: string): ReadabilityMetrics {
  const cleanText = text.trim();
  if (!cleanText) {
    return {
      fleschReadingEase: 0,
      fleschReadingEaseLabel: "No Text",
      fleschKincaidGrade: 0,
      gunningFogIndex: 0,
      colemanLiauIndex: 0,
      lexicalDensity: 0,
      wordCount: 0,
      sentenceCount: 0,
      syllableCount: 0,
      complexWordCount: 0,
      avgSentenceLength: 0,
      avgSyllablesPerWord: 0,
      interpretation: {
        targetAudience: "None",
        readingDifficulty: "Standard / Conversational",
        summary: "Please provide text to calculate readability metrics.",
      },
    };
  }

  const sentences = splitSentences(cleanText).filter((s) => s.trim().length > 0);
  const words = tokenizeWords(cleanText).filter((w) => /[A-Za-z\u0900-\u097F]/.test(w));

  const totalSentences = Math.max(1, sentences.length);
  const totalWords = Math.max(1, words.length);

  let totalSyllables = 0;
  let complexWords = 0;
  let contentWords = 0;
  let totalLetters = 0;

  for (const w of words) {
    const syl = countSyllables(w);
    totalSyllables += syl;
    if (syl >= 3) complexWords++;
    if (!isStopword(w.toLowerCase())) contentWords++;
    totalLetters += w.replace(/[^A-Za-z\u0900-\u097F]/g, "").length;
  }

  const ASL = totalWords / totalSentences; // Average Sentence Length
  const ASW = totalSyllables / totalWords; // Average Syllables per Word
  const percentComplex = (complexWords / totalWords) * 100;

  // 1. Flesch Reading Ease Formula
  // 206.835 - (1.015 * ASL) - (84.6 * ASW)
  let fre = 206.835 - 1.015 * ASL - 84.6 * ASW;
  fre = Math.min(100, Math.max(0, Number(fre.toFixed(1))));

  // 2. Flesch-Kincaid Grade Level Formula
  // 0.39 * ASL + 11.8 * ASW - 15.59
  let fkg = 0.39 * ASL + 11.8 * ASW - 15.59;
  fkg = Math.max(1, Number(fkg.toFixed(1)));

  // 3. Gunning Fog Index Formula
  // 0.4 * (ASL + percentage of complex words)
  let fog = 0.4 * (ASL + percentComplex);
  fog = Math.max(1, Number(fog.toFixed(1)));

  // 4. Coleman-Liau Index Formula
  // 0.0588 * L - 0.296 * S - 15.8 (L = letters/100 words, S = sentences/100 words)
  const L = (totalLetters / totalWords) * 100;
  const S = (totalSentences / totalWords) * 100;
  let cli = 0.0588 * L - 0.296 * S - 15.8;
  cli = Math.max(1, Number(cli.toFixed(1)));

  // 5. Lexical Density
  const lexicalDensity = Number(((contentWords / totalWords) * 100).toFixed(1));

  let readingDifficulty: ReadabilityMetrics["interpretation"]["readingDifficulty"] = "Standard / Conversational";
  let freLabel = "Standard";
  let targetAudience = "High school or general adult readers";

  if (fre >= 80) {
    readingDifficulty = "Very Easy";
    freLabel = "Very Easy / 5th-6th Grade";
    targetAudience = "Elementary school readers, conversational dialogues";
  } else if (fre >= 65) {
    readingDifficulty = "Easy";
    freLabel = "Easy / 7th-8th Grade";
    targetAudience = "General public, consumer news, standard documentation";
  } else if (fre >= 50) {
    readingDifficulty = "Standard / Conversational";
    freLabel = "Standard / High School";
    targetAudience = "High school students, academic essays, magazines";
  } else if (fre >= 30) {
    readingDifficulty = "Difficult / Academic";
    freLabel = "Difficult / College Level";
    targetAudience = "Undergraduate scholars, technical manuals, college textbooks";
  } else {
    readingDifficulty = "Very Difficult / Research Paper";
    freLabel = "Very Confusing / Postgraduate";
    targetAudience = "Postgraduate research papers, legal statutes, complex academic treatises";
  }

  return {
    fleschReadingEase: fre,
    fleschReadingEaseLabel: freLabel,
    fleschKincaidGrade: fkg,
    gunningFogIndex: fog,
    colemanLiauIndex: cli,
    lexicalDensity,
    wordCount: totalWords,
    sentenceCount: totalSentences,
    syllableCount: totalSyllables,
    complexWordCount: complexWords,
    avgSentenceLength: Number(ASL.toFixed(1)),
    avgSyllablesPerWord: Number(ASW.toFixed(2)),
    interpretation: {
      targetAudience,
      readingDifficulty,
      summary: `Score of ${fre}/100 places this document at roughly Grade ${Math.round(fkg)} reading comprehension with ${lexicalDensity}% lexical content density.`,
    },
  };
}

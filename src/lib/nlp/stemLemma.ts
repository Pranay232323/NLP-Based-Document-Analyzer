// EXPERIMENT 3: Stop Word Removal, Stemming and Lemmatization
import natural from "natural";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const lemmatizer = require("wink-lemmatizer");
import { isNounTag, isVerbTag, isAdjectiveTag } from "./posTags";
import type { StemLemmaRow } from "./types";

/** Porter stemming (Experiment 3) */
export function stemWord(word: string): string {
  return natural.PorterStemmer.stem(word.toLowerCase());
}

/**
 * WordNet-style lemmatization using wink-lemmatizer. When a POS tag is known
 * we route the word to the matching lemmatizer (noun/verb/adjective) for a
 * linguistically accurate base form, mirroring how NLTK's WordNetLemmatizer
 * uses a POS hint.
 */
export function lemmatizeWord(word: string, posTag?: string): string {
  const lower = word.toLowerCase();
  if (posTag) {
    if (isVerbTag(posTag)) return lemmatizer.verb(lower);
    if (isNounTag(posTag)) return lemmatizer.noun(lower);
    if (isAdjectiveTag(posTag)) return lemmatizer.adjective(lower);
    return lower;
  }
  // No POS hint: try verb -> noun -> adjective, keep the first form that changed.
  const asVerb = lemmatizer.verb(lower);
  if (asVerb !== lower) return asVerb;
  const asNoun = lemmatizer.noun(lower);
  if (asNoun !== lower) return asNoun;
  const asAdj = lemmatizer.adjective(lower);
  if (asAdj !== lower) return asAdj;
  return lower;
}

/** Builds the comparison table: Word | Stemmed Form | Lemmatized Form */
export function buildStemLemmaTable(
  words: string[],
  posByWord?: Map<string, string>,
): StemLemmaRow[] {
  const seen = new Set<string>();
  const rows: StemLemmaRow[] = [];
  for (const raw of words) {
    const word = raw.toLowerCase();
    if (seen.has(word)) continue;
    seen.add(word);
    const pos = posByWord?.get(word) ?? "";
    rows.push({
      word,
      stemmed: stemWord(word),
      lemmatized: lemmatizeWord(word, pos),
      pos,
    });
  }
  return rows;
}

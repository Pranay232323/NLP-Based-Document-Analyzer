// Shared NLP engine wrappers.
//  - winkNLP: sentence boundary detection + statistical entity recognition
//    (DATE, MONEY, CARDINAL, PERCENT, TIME, DURATION, etc.)
//  - wink-pos-tagger: genuine Penn-Treebank style POS tagging (NN, VBZ, DT, ...)
//    with ~93% accuracy, trained using Eric Brill's transformation-based
//    learning approach. This also powers the Chunking module (Experiment 7).
import winkNLP from "wink-nlp";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const model = require("wink-eng-lite-web-model");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const posTaggerFactory = require("wink-pos-tagger");

export const nlp = winkNLP(model);
export const its = nlp.its;
export const as = nlp.as;

const tagger = posTaggerFactory();

export interface WinkToken {
  value: string;
  pos: string;
}

/** Sentence boundary detection using winkNLP. */
export function winkSentences(text: string): string[] {
  if (!text.trim()) return [];
  const doc = nlp.readDoc(text);
  const sentences = doc.sentences().out() as string[];
  return sentences.length ? sentences : [text];
}

/** Penn-Treebank style POS tagging (Experiment 6) using wink-pos-tagger. */
export function posTagTokens(text: string): WinkToken[] {
  if (!text.trim()) return [];
  const tagged = tagger.tagSentence(text) as { value: string; tag: string; pos: string }[];
  return tagged.map((t) => ({ value: t.value, pos: t.pos }));
}

/** POS tagging across a whole document, sentence by sentence (more accurate than one giant pass). */
export function posTagDocument(text: string): WinkToken[] {
  const sentences = winkSentences(text);
  if (sentences.length === 0) return [];
  return sentences.flatMap((s) => posTagTokens(s));
}

export interface WinkEntity {
  value: string;
  type: string;
}

/** Statistical entities winkNLP can reliably detect: DATE, MONEY, CARDINAL... */
export function winkEntities(text: string): WinkEntity[] {
  if (!text.trim()) return [];
  const doc = nlp.readDoc(text);
  return doc.entities().out(its.detail) as WinkEntity[];
}

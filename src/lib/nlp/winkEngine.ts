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

const INDIC_PRONOUNS = new Set([
  "मी", "आम्ही", "तू", "तुम्ही", "आपण", "तो", "ती", "ते", "त्या", "हा", "ही", "हे", "ह्या",
  "मला", "त्याला", "तिला", "आमचे", "माझे", "स्वतः", "कोणाला", "कोणी", "काय", "कोण",
  "मैं", "हम", "तू", "तुम", "आप", "वह", "वे", "यह", "ये", "उसे", "उन्हें", "मेरा", "हमारा",
  "अपना", "किसका", "किसी", "कोई", "सब", "मुझे", "हमें", "किसे", "किसने",
]);

const INDIC_CONJUNCTIONS = new Set([
  "आणि", "व", "किंवा", "अथवा", "पण", "परंतु", "तथापि", "कारण", "म्हणजे", "जर", "तर", "म्हणून", "की",
  "और", "तथा", "एवं", "या", "अथवा", "लेकिन", "किन्तु", "परन्तु", "मगर", "क्योंकि", "ताकि", "यदि",
]);

const INDIC_POSTPOSITIONS = new Set([
  "च्या", "ची", "चे", "चा", "मध्ये", "तून", "हून", "मुळे", "साठी", "कडे", "वरून", "वर", "खाली",
  "सोबत", "विना", "पर्यंत", "बद्दल", "समोर", "मागे",
  "का", "के", "की", "में", "से", "को", "पर", "द्वारा", "तक", "बिना", "साथ", "पीछे", "आगे", "बीच", "अंदर",
]);

const INDIC_VERBS = new Set([
  "आहे", "आहेत", "नाही", "नाहीत", "होता", "होती", "होते", "होतील", "असेल", "असावे", "झाला", "झाली",
  "झाले", "केले", "केली", "केलो", "करणे", "करतो", "करते", "करतात", "करू", "शकत", "शकतो", "शकते",
  "शकतात", "जाणे", "जातो", "जाते", "जातात", "येणे", "येतो", "येते", "येतात", "पाहिले", "वाचले",
  "लिहिले", "सांगणे", "होणे", "घेणे", "देणे",
  "है", "हैं", "नहीं", "था", "थी", "थे", "होगा", "होगी", "होंगे", "रहा", "रही", "रहे", "सकना",
  "सकता", "सकती", "सकते", "पाना", "पाया", "गया", "गई", "गए", "किया", "किए", "करना", "करने",
  "करता", "करती", "करते", "होना", "होने", "होता", "होती", "होते", "देखना", "पढ़ना", "लिखना",
]);

const INDIC_ADJECTIVES = new Set([
  "मोठा", "मोठी", "मोठे", "लहान", "नवीन", "जुना", "जुनी", "जुने", "चांगला", "चांगली", "चांगले",
  "वाईट", "सुंदर", "महत्त्वाचा", "महत्त्वाची", "महत्त्वाचे", "मुख्य", "पहिला", "पहिली", "पहिले",
  "दुसरी", "दुसरा", "भारी", "उत्कृष्ट", "छान", "योग्य",
  "बड़ा", "बड़ी", "बड़े", "छोटा", "छोटी", "छोटे", "नया", "नई", "नए", "पुराना", "अच्छा", "अच्छी",
  "अच्छे", "बुरा", "सुंदर", "महत्वपूर्ण", "मुख्य", "पहला", "दूसरा", "तीसरा", "श्रेष्ठ", "उत्तम", "कठिन",
]);

const INDIC_ADVERBS = new Set([
  "खूप", "फार", "जास्त", "कमी", "हळू", "लवकर", "नेहमी", "कधी", "येथे", "तिथे", "आता", "तेव्हा",
  "आज", "उद्या", "नक्की", "कदाचित", "पुन्हा",
  "बहुत", "ज्यादा", "कम", "धीरे", "जल्दी", "हमेशा", "कभी", "यहाँ", "वहाँ", "अब", "तब", "आज", "कल", "अवश्य", "शायद",
]);

function tagIndicToken(token: string): string {
  if (/^[.!?।॥]$/.test(token)) return ".";
  if (/^[,;:()[\]"']$/.test(token)) return ",";
  if (/^[०-९\d]+(?:\.[०-९\d]+)?$/.test(token)) return "CD";
  if (INDIC_PRONOUNS.has(token)) return "PRP";
  if (INDIC_CONJUNCTIONS.has(token)) return "CC";
  if (INDIC_POSTPOSITIONS.has(token)) return "IN";
  if (INDIC_VERBS.has(token)) return "VB";
  if (INDIC_ADJECTIVES.has(token)) return "JJ";
  if (INDIC_ADVERBS.has(token)) return "RB";
  return "NN";
}

/** Sentence boundary detection using winkNLP (English) and Devanagari rules (Hindi/Marathi). */
export function winkSentences(text: string): string[] {
  if (!text.trim()) return [];
  if (/[\u0900-\u097F]/.test(text)) {
    const cleaned = text.replace(/\s+/g, " ").trim();
    const parts = cleaned
      .split(/(?<=[.!?।॥])\s+(?=[A-Z0-9"'“\u0900-\u097F])/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length ? parts : [cleaned];
  }
  const doc = nlp.readDoc(text);
  const sentences = doc.sentences().out() as string[];
  return sentences.length ? sentences : [text];
}

/** Penn-Treebank style POS tagging (Experiment 6) using wink-pos-tagger for English and Indic rules for Hindi/Marathi. */
export function posTagTokens(text: string): WinkToken[] {
  if (!text.trim()) return [];
  if (/[\u0900-\u097F]/.test(text)) {
    const rawTokens = text.match(/[A-Za-z]+(?:'[A-Za-z]+)?|[\u0900-\u097F]+|\d+(?:\.\d+)?|[०-९]+|[^\sA-Za-z0-9\u0900-\u097F]/g) ?? [];
    return rawTokens.map((tok) => {
      if (/[\u0900-\u097F]/.test(tok) || /^[.!?।॥,;:]$/.test(tok)) {
        return { value: tok, pos: tagIndicToken(tok) };
      }
      const tagged = tagger.tagSentence(tok) as { value: string; pos: string }[];
      return { value: tok, pos: tagged[0]?.pos ?? "NN" };
    });
  }
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

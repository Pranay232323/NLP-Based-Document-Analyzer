// EXPERIMENT 3: Stop Word Removal, Stemming and Lemmatization
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PorterStemmer = require("natural/lib/natural/stemmers/porter_stemmer");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const lemmatizer = require("wink-lemmatizer");
import { isNounTag, isVerbTag, isAdjectiveTag } from "./posTags";
import type { StemLemmaRow } from "./types";

// Hindi inflectional suffixes sorted by length descending
const HINDI_SUFFIXES = [
  "ात्मक", "पूर्वक", "करके", "ियां", "िया", "ाएं", "यों", "कार", "ीय", "ाओ", "िए", "कर",
  "ता", "ती", "ते", "ना", "ने", "नी", "ों", "ा", "े", "ी", "ूं", "ें",
];

// Marathi inflectional / vibhakti suffixes sorted by length descending
const MARATHI_SUFFIXES = [
  "प्रमाणे", "विरुद्ध", "बरोबर", "सारखा", "सारखी", "सारखे", "बद्दल", "विषयी", "मधील",
  "वरून", "तून", "हून", "मुळे", "साठी", "कडे", "च्या", "तील", "णारे", "णारा", "णारी",
  "तात", "तोय", "तेय", "णे", "चे", "ची", "चा", "ला", "ना", "नी", "ने", "तो", "ते", "ली", "ले", "लो",
];

// Common Hindi canonical base mappings
const HINDI_LEMMAS: Record<string, string> = {
  करता: "करना", करती: "करना", करते: "करना", किया: "करना", किए: "करना", करेगा: "करना", करेंगे: "करना", करने: "करना",
  जाता: "जाना", जाती: "जाना", जाते: "जाना", गया: "जाना", गई: "जाना", गए: "जाना", जाएगा: "जाना", जाएगी: "जाना", जाने: "जाना",
  देता: "देना", देती: "देना", देते: "देना", दिया: "देना", दिए: "देना", देगा: "देना", देंगे: "देना", देने: "देना",
  लेता: "लेना", लेती: "लेना", लेते: "लेना", लिया: "लेना", लिए: "लेना", लेगा: "लेना", लेंगे: "लेना", लेने: "लेना",
  होता: "होना", होती: "होना", होते: "होना", हुआ: "होना", हुई: "होना", हुए: "होना", होगा: "होना", होगी: "होना", होने: "होना",
  आता: "आना", आती: "आना", आते: "आना", आया: "आना", आई: "आना", आए: "आना", आएगा: "आना", आने: "आना",
  पढ़ता: "पढ़ना", पढ़ती: "पढ़ना", पढ़ते: "पढ़ना", पढ़ा: "पढ़ना", पढ़ी: "पढ़ना", पढ़े: "पढ़ना", पढ़ने: "पढ़ना",
  लिखता: "लिखना", लिखती: "लिखना", लिखते: "लिखना", लिखा: "लिखना", लिखी: "लिखना", लिखे: "लिखना", लिखने: "लिखना",
  बोलता: "बोलना", बोलती: "बोलना", बोलते: "बोलना", बोला: "बोलना", बोली: "बोलना", बोले: "बोलना", बोलने: "बोलना",
  सकता: "सकना", सकती: "सकना", सकते: "सकना", सका: "सकना", सकी: "सकना", सके: "सकना",
  पुस्तकों: "पुस्तक", पुस्तकें: "पुस्तक",
  भाषाओं: "भाषा", भाषाएं: "भाषा",
  लड़कों: "लड़का", लड़के: "लड़का",
  लड़कियों: "लड़की", लड़कियां: "लड़की",
  विद्यार्थियों: "विद्यार्थी",
};

// Common Marathi canonical base mappings
const MARATHI_LEMMAS: Record<string, string> = {
  करतो: "करणे", करते: "करणे", करतात: "करणे", केले: "करणे", केली: "करणे", केला: "करणे", करणार: "करणे", करू: "करणे",
  जातो: "जाणे", जाते: "जाणे", जातात: "जाणे", गेला: "जाणे", गेली: "जाणे", गेले: "जाणे", जाणार: "जाणे",
  येतो: "येणे", येते: "येणे", येतात: "येणे", आला: "येणे", आली: "येणे", आले: "येणे", येणार: "येणे",
  देतो: "देणे", देते: "देणे", देतात: "देणे", दिला: "देणे", दिली: "देणे", दिले: "देणे", देणार: "देणे",
  घेतो: "घेणे", घेते: "घेणे", घेतात: "घेणे", घेतला: "घेणे", घेतली: "घेणे", घेतले: "घेणे", घेणार: "देणे",
  होतो: "होणे", होते: "होणे", होतात: "होणे", झाला: "होणे", झाली: "होणे", झाले: "होणे", होणार: "होणे",
  वाचतो: "वाचणे", वाचते: "वाचणे", वाचतात: "वाचणे", वाचले: "वाचणे", वाचली: "वाचणे", वाचला: "वाचणे",
  लिहितो: "लिहिणे", लिहिते: "लिहिणे", लिहितात: "लिहिणे", लिहिले: "लिहिणे", लिहिली: "लिहिणे", लिहिला: "लिहिणे",
  सांगतो: "सांगणे", सांगते: "सांगणे", सांगतात: "सांगणे", सांगितले: "सांगणे", सांगणार: "सांगणे",
  पाहतो: "पाहणे", पाहते: "पाहणे", पाहतात: "पाहणे", पाहिले: "पाहणे", पाहिली: "पाहणे", पाहणार: "पाहणे",
  शकतो: "शकणे", शकते: "शकणे", शकतात: "शकणे", शकला: "शकणे", शकली: "शकणे", शकले: "शकणे",
  पुस्तके: "पुस्तक", पुस्तकांत: "पुस्तक", पुस्तकांची: "पुस्तक", पुस्तकातील: "पुस्तक",
  भाषांचे: "भाषा", भाषांमधील: "भाषा", भाषांना: "भाषा",
  विद्यार्थ्यांचे: "विद्यार्थी", विद्यार्थ्यांना: "विद्यार्थी", विद्यार्थ्यांचा: "विद्यार्थी",
  शहरांमधील: "शहर", शहरात: "शहर", शहराचे: "शहर",
  शाळांमध्ये: "शाळा", शाळेत: "शाळा", शाळेचे: "शाळा",
};

function isDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

function stemDevanagariWord(word: string): string {
  if (word.length <= 2) return word;
  const isMarathi = word.includes("ळ") || MARATHI_SUFFIXES.some((s) => word.endsWith(s) && word.length - s.length >= 2);
  const suffixes = isMarathi ? MARATHI_SUFFIXES : HINDI_SUFFIXES;
  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 2) {
      return word.slice(0, word.length - suffix.length);
    }
  }
  return word;
}

function lemmatizeDevanagariWord(word: string): string {
  if (HINDI_LEMMAS[word]) return HINDI_LEMMAS[word];
  if (MARATHI_LEMMAS[word]) return MARATHI_LEMMAS[word];
  const stem = stemDevanagariWord(word);
  return stem;
}

/** Porter stemming for English, Rule-based inflection stripper for Indic (Hindi/Marathi) */
export function stemWord(word: string): string {
  if (isDevanagari(word)) {
    return stemDevanagariWord(word.trim());
  }
  return PorterStemmer.stem(word.toLowerCase());
}

/**
 * WordNet-style lemmatization using wink-lemmatizer for English.
 * Indic canonical base mapping for Hindi and Marathi.
 */
export function lemmatizeWord(word: string, posTag?: string): string {
  const lower = word.toLowerCase();
  if (isDevanagari(word)) {
    return lemmatizeDevanagariWord(word.trim());
  }

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

// Penn-Treebank style POS tag descriptions used by winkNLP's English model.
export const POS_TAG_DESCRIPTIONS: Record<string, string> = {
  CC: "Coordinating conjunction",
  CD: "Cardinal number",
  DT: "Determiner",
  EX: "Existential there",
  FW: "Foreign word",
  IN: "Preposition / subordinating conjunction",
  JJ: "Adjective",
  JJR: "Adjective, comparative",
  JJS: "Adjective, superlative",
  LS: "List item marker",
  MD: "Modal",
  NN: "Noun, singular or mass",
  NNS: "Noun, plural",
  NNP: "Proper noun, singular",
  NNPS: "Proper noun, plural",
  PDT: "Predeterminer",
  POS: "Possessive ending",
  PRP: "Personal pronoun",
  "PRP$": "Possessive pronoun",
  RB: "Adverb",
  RBR: "Adverb, comparative",
  RBS: "Adverb, superlative",
  RP: "Particle",
  SYM: "Symbol",
  TO: "'to'",
  UH: "Interjection",
  VB: "Verb, base form",
  VBD: "Verb, past tense",
  VBG: "Verb, gerund / present participle",
  VBN: "Verb, past participle",
  VBP: "Verb, non-3rd person singular present",
  VBZ: "Verb, 3rd person singular present",
  WDT: "Wh-determiner",
  WP: "Wh-pronoun",
  "WP$": "Possessive wh-pronoun",
  WRB: "Wh-adverb",
  HYPH: "Hyphen",
  AFX: "Affix",
  XX: "Unknown",
  ADD: "Email/URL",
  NFP: "Superfluous punctuation",
  ".": "Sentence terminator",
  ",": "Comma",
  ":": "Colon / punctuation",
  "``": "Opening quotation mark",
  "''": "Closing quotation mark",
  "-LRB-": "Opening bracket",
  "-RRB-": "Closing bracket",
  $: "Currency symbol",
};

export function describeTag(tag: string): string {
  return POS_TAG_DESCRIPTIONS[tag] ?? "Punctuation / Other";
}

export function isNounTag(tag: string): boolean {
  return tag.startsWith("NN");
}

export function isVerbTag(tag: string): boolean {
  return tag.startsWith("VB");
}

export function isAdjectiveTag(tag: string): boolean {
  return tag.startsWith("JJ");
}

const PUNCT_TAGS = new Set([".", ",", ":", "``", "''", "-LRB-", "-RRB-", "HYPH", "NFP", "$"]);

export function isPunctuationTag(tag: string): boolean {
  return PUNCT_TAGS.has(tag) || !/^[A-Za-z]/.test(tag);
}

// Registry of language capabilities for the NLP Intelligence Platform.
// Provides structured metadata on script requirements, tokenizer methods,
// supported experiments, and limitations for undergraduate NLP labs and future expansion.

export interface LanguageCapability {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  unicodeRange: string;
  status: "Fully Supported" | "Partially Supported" | "Experimental / Roadmap";
  tokenizationMethod: string;
  stopwordSupport: boolean;
  stemmingLemmatizationSupport: boolean;
  posTaggingSupport: boolean;
  nerSupport: boolean;
  sentimentSupport: boolean;
  supportedExperiments: number[]; // e.g. [1, 2, 3, 5, 9, 10, ...]
  requiredResources: string[];
  knownLimitations: string[];
}

export const LANGUAGE_REGISTRY: Record<string, LanguageCapability> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    script: "Latin",
    unicodeRange: "U+0000 - U+007F, U+0080 - U+00FF",
    status: "Fully Supported",
    tokenizationMethod: "Regex regex-word + winkNLP tokenizer",
    stopwordSupport: true,
    stemmingLemmatizationSupport: true,
    posTaggingSupport: true,
    nerSupport: true,
    sentimentSupport: true,
    supportedExperiments: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    requiredResources: ["natural PorterStemmer", "wink-lemmatizer", "wink-eng-lite-web-model", "AFINN lexicon"],
    knownLimitations: [
      "Idiomatic expressions may lose meaning during stemming",
      "Sarcasm in sentiment analysis requires contextual embeddings",
      "Informal slang and contractions may cause POS misclassification",
    ],
  },
  hi: {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    script: "Devanagari",
    unicodeRange: "U+0900 - U+097F",
    status: "Partially Supported",
    tokenizationMethod: "Unicode Devanagari whitespace & punctuation tokenizer + Nukta normalization",
    stopwordSupport: true,
    stemmingLemmatizationSupport: false,
    posTaggingSupport: false,
    nerSupport: false,
    sentimentSupport: true,
    supportedExperiments: [1, 2, 5, 9, 10, 14, 15],
    requiredResources: ["Indic Devanagari Normalizer", "Hindi Stopword Lexicon", "Hindi Sentiment Seed Words"],
    knownLimitations: [
      "English POS taggers and Porter Stemmer must NOT be applied to Hindi text",
      "Rich inflectional morphology requires specialized Indic NLP stemmer/lemmatizer",
      "Compound conjuncts (Yuktakshar) require unicode normalization (NFC/NFD)",
      "Shares Devanagari script with Marathi and Sanskrit, requiring vocabulary heuristics for script-level differentiation",
    ],
  },
  mr: {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    script: "Devanagari",
    unicodeRange: "U+0900 - U+097F (Includes Marathi-specific retroflex lateral 'ळ' U+0933)",
    status: "Partially Supported",
    tokenizationMethod: "Devanagari character segmentation + Marathi marker detection",
    stopwordSupport: true,
    stemmingLemmatizationSupport: false,
    posTaggingSupport: false,
    nerSupport: false,
    sentimentSupport: true,
    supportedExperiments: [1, 2, 5, 9, 10, 14, 15],
    requiredResources: ["Marathi Stopword Lexicon", "Marathi Marker Dictionary"],
    knownLimitations: [
      "Extremely rich agglutinative morphology with postpositions attached to stems (विभक्ती प्रत्यय)",
      "Requires language-specific stemmer (English algorithms will corrupt Marathi roots)",
      "High overlap with Hindi in Devanagari characters requires marker-based lexical discrimination",
    ],
  },
};

export function getSupportedLanguages(): LanguageCapability[] {
  return Object.values(LANGUAGE_REGISTRY);
}

export function getLanguageByCode(code: string): LanguageCapability | undefined {
  return LANGUAGE_REGISTRY[code.toLowerCase()];
}

// Language Identification & Script Analysis Module (Experiment 15)
// Detects English, Hindi, Marathi, or flags Ambiguous/Unknown.
// Explains the critical linguistic distinction between script detection (Devanagari)
// and language discrimination (Hindi vs Marathi via morphology and marker lexicons).

export interface MarkerMatch {
  word: string;
  language: "Hindi" | "Marathi" | "English";
  significance: string;
}

export interface ScriptBreakdown {
  scriptName: "Latin" | "Devanagari" | "Mixed / Other";
  latinChars: number;
  devanagariChars: number;
  otherChars: number;
  totalAlphaChars: number;
  latinRatio: number;
  devanagariRatio: number;
}

export interface LanguageIdentificationResult {
  text: string;
  detectedLanguage: "English" | "Hindi" | "Marathi" | "Ambiguous / Insufficient Evidence" | "Unknown Script";
  languageCode: "en" | "hi" | "mr" | "und";
  confidence: number; // 0.0 to 1.0
  script: ScriptBreakdown;
  markersDetected: MarkerMatch[];
  hindiEvidenceScore: number;
  marathiEvidenceScore: number;
  englishEvidenceScore: number;
  explanation: {
    linguisticInsight: string;
    scriptVsLanguageExplanation: string;
    decisionRationale: string;
  };
}

// Characteristic function words for Hindi
const HINDI_MARKERS: Record<string, string> = {
  है: "Present copula (is)",
  हैं: "Plural copula (are)",
  नहीं: "Negation marker (not)",
  और: "Coordinating conjunction (and)",
  का: "Genitive postposition (masculine)",
  के: "Genitive postposition (inflected/plural)",
  की: "Genitive postposition (feminine)",
  था: "Past tense copula (was)",
  थी: "Past tense copula (was - fem)",
  थे: "Past tense copula (were)",
  में: "Locative postposition (in)",
  से: "Ablative/instrumental postposition (from/with)",
  को: "Accusative/dative postposition (to)",
  किया: "Past verbal auxiliary (did/done)",
  होता: "Habitual auxiliary (happens/is)",
};

// Characteristic function words and letters for Marathi
const MARATHI_MARKERS: Record<string, string> = {
  आहे: "Present copula (is)",
  नाही: "Negation marker (not)",
  आणि: "Coordinating conjunction (and)",
  च्या: "Genitive postposition (of)",
  मध्ये: "Locative postposition (in/inside)",
  झाला: "Past tense aspect (became/happened)",
  होता: "Past tense copula (was)",
  करून: "Conjunctive participle (having done)",
  एक: "Numeral quantifier (one)",
  व: "Formal conjunction (and)",
  हे: "Proximal demonstrative pronoun (this)",
  त्या: "Distal oblique demonstrative (that)",
  तर: "Conditional connective (then)",
  पण: "Adversative conjunction (but)",
};

const ENGLISH_CLOSED_CLASS = new Set([
  "the", "is", "are", "and", "of", "to", "in", "that", "it", "with",
  "as", "for", "was", "on", "at", "by", "this", "from", "they", "an",
  "be", "which", "or", "have", "has", "not", "but", "we", "can", "all",
]);

export function identifyLanguage(text: string): LanguageIdentificationResult {
  const trimmed = text.trim();

  // 1. Script Breakdown via Unicode code points
  let latinChars = 0;
  let devanagariChars = 0;
  let otherChars = 0;

  for (const ch of trimmed) {
    const code = ch.charCodeAt(0);
    // Latin: A-Z, a-z, and extended Latin
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 192 && code <= 591)) {
      latinChars++;
    } else if (code >= 0x0900 && code <= 0x097f) {
      devanagariChars++;
    } else if (/^\p{L}$/u.test(ch)) {
      otherChars++;
    }
  }

  const totalAlphaChars = latinChars + devanagariChars + otherChars;
  const latinRatio = totalAlphaChars > 0 ? Number((latinChars / totalAlphaChars).toFixed(3)) : 0;
  const devanagariRatio = totalAlphaChars > 0 ? Number((devanagariChars / totalAlphaChars).toFixed(3)) : 0;

  let scriptName: ScriptBreakdown["scriptName"] = "Mixed / Other";
  if (latinRatio > 0.7) scriptName = "Latin";
  else if (devanagariRatio > 0.7) scriptName = "Devanagari";

  const script: ScriptBreakdown = {
    scriptName,
    latinChars,
    devanagariChars,
    otherChars,
    totalAlphaChars,
    latinRatio,
    devanagariRatio,
  };

  // If text is very short or no alphabetic characters
  if (totalAlphaChars < 6) {
    return {
      text,
      detectedLanguage: "Ambiguous / Insufficient Evidence",
      languageCode: "und",
      confidence: 0.1,
      script,
      markersDetected: [],
      hindiEvidenceScore: 0,
      marathiEvidenceScore: 0,
      englishEvidenceScore: 0,
      explanation: {
        linguisticInsight: "Text length is too brief (< 6 characters) for reliable statistical discrimination.",
        scriptVsLanguageExplanation: "Language identification requires sufficient lexical and functional markers.",
        decisionRationale: "Flagged as Ambiguous to avoid false certainty on micro-snippets.",
      },
    };
  }

  // Tokenize words
  const words = trimmed.split(/[\s,.;:!?।()\[\]"'/]+/).filter((w) => w.length > 0);
  const markersDetected: MarkerMatch[] = [];

  let hindiScore = 0;
  let marathiScore = 0;
  let englishScore = 0;

  // Check for Marathi-specific letter 'ळ' (U+0933) which does not exist in standard Hindi
  if (trimmed.includes("ळ")) {
    marathiScore += 5;
    markersDetected.push({
      word: "ळ (U+0933)",
      language: "Marathi",
      significance: "Retroflex lateral approximant; definitive Marathi orthographic marker absent in standard Hindi",
    });
  }

  for (const word of words) {
    const clean = word.toLowerCase();

    // Check English
    if (ENGLISH_CLOSED_CLASS.has(clean)) {
      englishScore += 1;
      if (markersDetected.length < 8) {
        markersDetected.push({ word: clean, language: "English", significance: "English closed-class function word" });
      }
    }

    // Check Hindi
    if (HINDI_MARKERS[word]) {
      hindiScore += 2;
      markersDetected.push({ word, language: "Hindi", significance: HINDI_MARKERS[word] });
    }

    // Check Marathi
    if (MARATHI_MARKERS[word]) {
      marathiScore += 2;
      markersDetected.push({ word, language: "Marathi", significance: MARATHI_MARKERS[word] });
    }
  }

  let detectedLanguage: LanguageIdentificationResult["detectedLanguage"] = "Ambiguous / Insufficient Evidence";
  let languageCode: LanguageIdentificationResult["languageCode"] = "und";
  let confidence = 0.5;
  let decisionRationale = "";

  if (latinRatio > 0.75) {
    detectedLanguage = "English";
    languageCode = "en";
    confidence = Math.min(0.99, 0.7 + (englishScore > 2 ? 0.25 : 0.1));
    decisionRationale = `High Latin script prevalence (${(latinRatio * 100).toFixed(0)}%) with ${englishScore} English function markers.`;
  } else if (devanagariRatio > 0.7) {
    // Discriminate between Hindi and Marathi in Devanagari
    if (marathiScore > hindiScore) {
      detectedLanguage = "Marathi";
      languageCode = "mr";
      const margin = marathiScore - hindiScore;
      confidence = Math.min(0.96, 0.65 + margin * 0.08);
      decisionRationale = `Devanagari script with dominant Marathi grammatical markers (${marathiScore} pts vs Hindi ${hindiScore} pts).`;
    } else if (hindiScore > marathiScore) {
      detectedLanguage = "Hindi";
      languageCode = "hi";
      const margin = hindiScore - marathiScore;
      confidence = Math.min(0.96, 0.65 + margin * 0.08);
      decisionRationale = `Devanagari script with dominant Hindi grammatical markers (${hindiScore} pts vs Marathi ${marathiScore} pts).`;
    } else {
      detectedLanguage = "Ambiguous / Insufficient Evidence";
      languageCode = "und";
      confidence = 0.45;
      decisionRationale = "Devanagari script detected, but lexical markers were tied or absent. Both Hindi and Marathi are possible.";
    }
  } else {
    detectedLanguage = "Unknown Script";
    languageCode = "und";
    confidence = 0.3;
    decisionRationale = "Mixed or unsupported Unicode script representation.";
  }

  return {
    text,
    detectedLanguage,
    languageCode,
    confidence: Number(confidence.toFixed(2)),
    script,
    markersDetected: markersDetected.slice(0, 12),
    hindiEvidenceScore: hindiScore,
    marathiEvidenceScore: marathiScore,
    englishEvidenceScore: englishScore,
    explanation: {
      linguisticInsight:
        "Hindi and Marathi both use the Devanagari writing system (Unicode block U+0900–U+097F). Therefore, script detection alone is completely inadequate to distinguish them.",
      scriptVsLanguageExplanation:
        "A script is an orthographic writing system; a language is a distinct syntactic and lexical system. Hindi is Indo-Aryan with postpositions like 'का, के, में', while Marathi is highly agglutinative with markers like 'च्या, मध्ये, आणि' and the unique consonant 'ळ'.",
      decisionRationale,
    },
  };
}

export const SAMPLE_LANGUAGE_SNIPPETS = [
  {
    language: "English",
    label: "English Academic Snippet",
    text: "Natural language processing combines computational linguistics with statistical machine learning to analyze textual documents.",
  },
  {
    language: "Hindi",
    label: "Hindi News Snippet",
    text: "प्राकृतिक भाषा प्रसंस्करण कंप्यूटर विज्ञान और कृत्रिम बुद्धिमत्ता का एक महत्वपूर्ण क्षेत्र है। इसमें विभिन्न एल्गोरिदम का उपयोग होता है।",
  },
  {
    language: "Marathi",
    label: "Marathi Literature Snippet",
    text: "नैसर्गिक भाषा प्रक्रिया हा संगणक शास्त्रातील एक अत्यंत महत्त्वाचा भाग आहे. या प्रणालीमध्ये मराठी भाषेचे व्याकरण आणि शब्दांचे विश्लेषण केले जाते.",
  },
  {
    language: "Ambiguous Devanagari",
    label: "Short Ambiguous Devanagari (Shared Lexicon)",
    text: "भारत देश",
  },
];

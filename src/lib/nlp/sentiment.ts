// Advanced Sentiment Analysis Module (Experiment 11)
// Uses an explainable lexicon-based polarity analyzer with negation detection,
// intensifier multipliers, sentence-level breakdown, and subjectivity estimation.

import { splitSentences, tokenizeWords } from "./preprocessing";

export interface SentimentTokenContribution {
  token: string;
  baseScore: number;
  multiplier: number;
  finalScore: number;
  isNegated: boolean;
  context: string;
}

export interface SentenceSentiment {
  sentence: string;
  score: number;
  comparative: number;
  label: "Positive" | "Negative" | "Neutral";
  positiveWords: string[];
  negativeWords: string[];
}

export interface SentimentAnalysisResult {
  text: string;
  score: number;             // Total raw score
  normalizedScore: number;   // -1.0 to +1.0
  comparative: number;       // Score divided by word count
  label: "Positive" | "Negative" | "Neutral";
  confidence: number;        // Meaningful certainty score based on polarity margin (0.0 - 1.0)
  subjectivity: number;      // 0.0 (strictly objective) to 1.0 (highly subjective)
  positiveTokensCount: number;
  negativeTokensCount: number;
  neutralTokensCount: number;
  tokenContributions: SentimentTokenContribution[];
  sentenceBreakdown: SentenceSentiment[];
  explanation: {
    method: string;
    preprocessingSteps: string[];
    decisionRule: string;
    knownLimitations: string[];
  };
}

// Curated sentiment polarity dictionary (AFINN baseline)
const SENTIMENT_LEXICON: Record<string, number> = {
  // Positive
  good: 2, great: 3, excellent: 4, amazing: 4, wonderful: 4, fantastic: 4, best: 3, better: 2,
  love: 3, loved: 3, likes: 2, like: 2, liked: 2, enjoy: 2, enjoyed: 2, happy: 3, pleasant: 2,
  effective: 2, efficient: 2, fast: 1, clean: 2, brilliant: 4, impressive: 3, superior: 3,
  recommend: 2, recommended: 2, perfect: 4, perfectly: 3, insightful: 3, valuable: 2, clear: 1,
  beneficial: 2, intuitive: 2, helpful: 2, beautiful: 3, robust: 2, innovative: 3, friendly: 2,
  satisfied: 2, outstanding: 4, superb: 4, awesome: 4, reliable: 2, praise: 2, success: 3,
  successful: 3, accurately: 2, accurate: 2, neat: 2, ideal: 3, flawless: 4, fine: 1,
  // Negative
  bad: -2, terrible: -3, horrible: -4, awful: -4, poor: -2, poorly: -2, worse: -3, worst: -4,
  hate: -3, hated: -3, dislike: -2, disliked: -2, unhappy: -3, sad: -2, slow: -2, broken: -3,
  bug: -2, bugs: -2, crash: -3, crashes: -3, crashed: -3, failure: -3, failed: -3, fail: -2,
  difficult: -1, hard: -1, confusing: -2, confused: -2, frustrating: -3, frustrated: -3,
  annoying: -2, annoyed: -2, terriblely: -3, defect: -3, error: -2, errors: -2, flawed: -3,
  worthless: -4, waste: -3, useless: -3, disappoint: -2, disappointed: -3, disappointing: -3,
  disappointment: -3, unreliable: -3, messy: -2, complex: -1, sluggish: -2, corrupt: -3,
  // Indic positive/negative markers (Devanagari Hindi & Marathi)
  // Positive
  accha: 2, badiya: 3, sundar: 2, uttam: 3, shandar: 4,
  अच्छा: 2, अच्छे: 2, अच्छी: 2, सुंदर: 2, उत्कृष्ट: 4, श्रेष्ठ: 3, उत्तम: 3, बेहतरीन: 4, शानदार: 4, बढ़िया: 3,
  पसंद: 2, उपयोगी: 2, सहायक: 2, सफल: 3, सफलता: 3, लाभ: 2, महत्वपूर्ण: 2, प्रशंसा: 3, खुशी: 3, आनंद: 3,
  छान: 3, चांगले: 2, चांगला: 2, चांगली: 2, अप्रतिम: 4, भारी: 3, आवडले: 3, आवडतो: 2, उपयुक्त: 2, मदत: 2,
  यश: 3, यशस्वी: 3, फायदा: 2, समाधान: 3, कौतुक: 3, योग्य: 2,
  // Negative
  kharab: -2, bekar: -3, ganda: -2, bura: -2,
  बुरा: -2, बुरे: -2, बुरी: -2, खराब: -3, बेकार: -3, घटिया: -3, गलत: -2, गलती: -2, समस्या: -2,
  नुकसान: -2, असफलता: -3, दुख: -2, परेशानी: -2, निराशा: -3, कठिन: -1, धीमा: -2, टूटा: -3, व्यर्थ: -3,
  वाईट: -3, बकवास: -4, चूक: -2, त्रुटी: -2, तोटा: -2, अपयश: -3, त्रास: -3, मंद: -2, खंडित: -3, त्रासदायक: -3,
};

const NEGATION_WORDS = new Set([
  "not", "never", "no", "neither", "nor", "hardly", "scarcely", "barely",
  "wasnt", "wasn't", "isnt", "isn't", "arent", "aren't", "wont", "won't",
  "cant", "can't", "cannot", "dont", "don't", "didnt", "didn't", "without",
  // Indic negation markers
  "नहीं", "न", "मत", "बिना", "नाही", "नको", "नका", "नव्हते", "नव्हता", "नव्हती", "नसून",
]);

const INTENSIFIERS: Record<string, number> = {
  very: 1.5,
  extremely: 2.0,
  incredibly: 2.0,
  really: 1.4,
  exceptionally: 1.8,
  super: 1.5,
  quite: 1.2,
  somewhat: 0.8,
  barely: 0.5,
  hardly: 0.4,
  // Indic intensifiers
  बहुत: 1.5,
  ज्यादा: 1.4,
  अत्यंत: 1.8,
  अतिशय: 1.8,
  काफी: 1.3,
  खूप: 1.5,
  फार: 1.5,
  प्रचंड: 1.8,
};

export function analyzeSentiment(text: string): SentimentAnalysisResult {
  const sentences = splitSentences(text);
  const words = tokenizeWords(text);

  const tokenContributions: SentimentTokenContribution[] = [];
  const sentenceBreakdown: SentenceSentiment[] = [];

  let totalRawScore = 0;
  let positiveTokensCount = 0;
  let negativeTokensCount = 0;
  let sentimentBearingTokens = 0;

  for (const sentence of sentences) {
    const sTokens = tokenizeWords(sentence);
    let sScore = 0;
    const sPosWords: string[] = [];
    const sNegWords: string[] = [];

    for (let i = 0; i < sTokens.length; i++) {
      const lower = sTokens[i].toLowerCase();
      const baseScore = SENTIMENT_LEXICON[lower];

      if (baseScore !== undefined) {
        sentimentBearingTokens++;
        let multiplier = 1.0;
        let isNegated = false;

        // Check preceding 2 tokens for negation or intensifier
        const prev1 = i > 0 ? sTokens[i - 1].toLowerCase() : "";
        const prev2 = i > 1 ? sTokens[i - 2].toLowerCase() : "";

        if (NEGATION_WORDS.has(prev1) || NEGATION_WORDS.has(prev2)) {
          isNegated = true;
          multiplier = -0.8; // Invert and slightly soften
        }

        if (INTENSIFIERS[prev1]) {
          multiplier *= INTENSIFIERS[prev1];
        }

        const finalScore = baseScore * multiplier;
        sScore += finalScore;
        totalRawScore += finalScore;

        if (finalScore > 0) {
          positiveTokensCount++;
          sPosWords.push(sTokens[i]);
        } else if (finalScore < 0) {
          negativeTokensCount++;
          sNegWords.push(sTokens[i]);
        }

        tokenContributions.push({
          token: sTokens[i],
          baseScore,
          multiplier: Number(multiplier.toFixed(2)),
          finalScore: Number(finalScore.toFixed(2)),
          isNegated,
          context: [prev2, prev1, sTokens[i]].filter(Boolean).join(" "),
        });
      }
    }

    const sComparative = sTokens.length > 0 ? sScore / sTokens.length : 0;
    sentenceBreakdown.push({
      sentence,
      score: Number(sScore.toFixed(2)),
      comparative: Number(sComparative.toFixed(3)),
      label: sScore > 0.5 ? "Positive" : sScore < -0.5 ? "Negative" : "Neutral",
      positiveWords: sPosWords,
      negativeWords: sNegWords,
    });
  }

  const wordCount = Math.max(words.length, 1);
  const comparative = Number((totalRawScore / wordCount).toFixed(4));
  // Normalized score mapped asymptotically to [-1.0, 1.0]
  const normalizedScore = Number((Math.tanh(comparative * 4)).toFixed(3));

  let label: "Positive" | "Negative" | "Neutral" = "Neutral";
  if (normalizedScore > 0.15) {
    label = "Positive";
  } else if (normalizedScore < -0.15) {
    label = "Negative";
  }

  const subjectivity = Number(
    Math.min(1, (sentimentBearingTokens * 3) / wordCount).toFixed(3)
  );

  // Confidence based on polarity magnitude and sample size
  const confidence = Number(
    Math.min(0.98, Math.max(0.4, Math.abs(normalizedScore) * 0.7 + (sentimentBearingTokens > 2 ? 0.25 : 0.1))).toFixed(2)
  );

  const neutralTokensCount = Math.max(0, words.length - positiveTokensCount - negativeTokensCount);

  return {
    text,
    score: Number(totalRawScore.toFixed(2)),
    normalizedScore,
    comparative,
    label,
    confidence,
    subjectivity,
    positiveTokensCount,
    negativeTokensCount,
    neutralTokensCount,
    tokenContributions: tokenContributions.slice(0, 30),
    sentenceBreakdown,
    explanation: {
      method: "Explainable Lexicon Scoring with Negation & Intensifier Window Parsing",
      preprocessingSteps: [
        "Sentence boundary detection & punctuation removal",
        "Case-folding and tokenisation",
        "Sliding window check for grammatical negations (not, never, isn't)",
        "Intensifier multiplier application (very, extremely, barely)",
        "Hyperbolic tangent normalization to [-1.0, 1.0]",
      ],
      decisionRule: "Score > +0.15 -> Positive; Score < -0.15 -> Negative; otherwise Neutral.",
      knownLimitations: [
        "Sarcasm ('Oh brilliant, another system crash') is misclassified due to literal word meaning.",
        "Domain-specific adjectives (e.g. 'unpredictable plot' in movies is positive, in software is negative).",
        "Implicit sentiment without emotional keywords ('They took my money and didn't answer').",
      ],
    },
  };
}

export const SAMPLE_SENTIMENT_TEXTS = [
  {
    label: "Positive Student Feedback (English)",
    text: "The professor delivered an excellent lecture with clear explanations and very helpful examples. The interactive laboratory exercises were brilliant, and I really enjoyed the natural language processing experiments.",
  },
  {
    label: "Constructive Mixed Critique (English)",
    text: "The user interface looks clean and modern, but the file upload was somewhat slow. Although the POS tagger works well, the initial documentation was confusing and frustrating.",
  },
  {
    label: "Negative System Review (English)",
    text: "The application had terrible performance and crashed frequently. The dataset importer failed with horrible errors, and I found the entire experience completely disappointing and useless.",
  },
  {
    label: "Sarcastic Edge Case (English)",
    text: "Oh fantastic, another mysterious runtime crash right before my project deadline! Just wonderful how reliably this platform breaks when I need it most.",
  },
  {
    label: "Hindi Positive (सकारात्मक)",
    text: "यह शैक्षणिक व्याख्यान बहुत ही सुंदर, ज्ञानवर्धक और उत्कृष्ट था। प्रोफेसर ने जटिल विषयों को बहुत अच्छी तरह समझाया और सभी छात्रों ने इसका आनंद लिया।",
  },
  {
    label: "Hindi Negative (नकारात्मक)",
    text: "यह सॉफ्टवेयर बहुत धीमा है और बार-बार खराब हो जाता है। इसमें बहुत सारी गलतियां और गंभीर समस्याएं हैं जो बेहद निराशाजनक और बेकार हैं।",
  },
  {
    label: "Marathi Positive (सकारात्मक)",
    text: "हा प्रकल्प खूप चांगला, सुंदर आणि अत्यंत उपयुक्त आहे. सर्व वैशिष्ट्ये उत्कृष्ट आणि सुरळीतपणे काम करतात. मला हा प्रयोग फार आवडला आणि समाधान वाटले.",
  },
  {
    label: "Marathi Negative (नकारात्मक)",
    text: "हा अनुप्रयोग फार मंद आहे आणि वारंवार खंडित होतो. यातील त्रुटींमुळे खूप त्रास झाला आणि निकाल वाईट आले.",
  },
];


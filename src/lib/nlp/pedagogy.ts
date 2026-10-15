// Pedagogical Knowledge Base & University Exam Primers for NLP Experiments
// Provides:
// 1. Viva Voce questions with model examiner answers and pitfall tips
// 2. Curated linguistic demo presets (garden path, polysemy, negation flips, Devanagari inflections)
// 3. Interactive concept self-check quizzes with explanations
// 4. University-standard laboratory practical journal templates (Aim, Theory, Algorithm, Conclusion)

export interface VivaQuestion {
  question: string;
  answer: string;
  tip?: string;
  category: "Foundations" | "Mathematical" | "Implementation" | "Evaluation";
}

export interface LinguisticPreset {
  label: string;
  text: string;
  language: "English" | "Hindi" | "Marathi";
  teachingPoint: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LabManualFormat {
  experimentNumber: number;
  title: string;
  aim: string;
  theory: string;
  algorithm: string[];
  vivaHighlights: string[];
  conclusionTemplate: string;
}

export interface ExperimentPedagogy {
  id: string;
  title: string;
  practicalNumber: number;
  complexity: {
    time: string;
    space: string;
  };
  vivaQuestions: VivaQuestion[];
  linguisticPresets: LinguisticPreset[];
  quiz: QuizQuestion[];
  labManual: LabManualFormat;
}

export const PEDAGOGY_REGISTRY: Record<string, ExperimentPedagogy> = {
  // =========================================================================
  // PRACTICAL 2: Preprocessing, Tokenization, Filtration & Readability
  // =========================================================================
  "preprocessing": {
    id: "preprocessing",
    practicalNumber: 2,
    title: "Tokenization, Filtration, Script Validation & Readability",
    complexity: {
      time: "O(N) where N is character length",
      space: "O(W) where W is number of word tokens",
    },
    vivaQuestions: [
      {
        question: "What is the key difference between word tokenization and sentence segmentation?",
        answer: "Word tokenization breaks a character sequence into atomic lexical units (tokens), while sentence segmentation determines sentence boundaries using period, question mark, or Devanagari Danda (।), handling abbreviation edge cases like 'Dr.' or 'U.S.A.'.",
        tip: "Remember that punctuation attached to words must be detached so 'word.' becomes ['word', '.']",
        category: "Foundations",
      },
      {
        question: "Why can't we simply use split(' ') for tokenization in real NLP systems?",
        answer: "Splitting on whitespace fails on punctuation attached to words ('hello,'), contractions ('don't' -> 'do' + 'n't'), hyphenated compounds ('state-of-the-art'), and non-spaced languages (Thai/Chinese) or Devanagari virama ligatures.",
        tip: "Mention regex and deterministic finite automata (DFA) tokenizers.",
        category: "Implementation",
      },
      {
        question: "What is Lexical Density and how does Flesch Reading Ease utilize it?",
        answer: "Lexical density is the ratio of content words (nouns, verbs, adjectives, adverbs) to total words. Flesch Reading Ease uses average sentence length and syllables-per-word to quantify how difficult text is for human comprehension.",
        tip: "Flesch scale ranges 0-100; scores > 60 are conversational, while scores < 30 are academic/research papers.",
        category: "Mathematical",
      },
    ],
    linguisticPresets: [
      {
        label: "Contractions & Punctuation Edge Case",
        text: "Dr. Smith doesn't believe in state-of-the-art solutions without empirical evidence from the U.S.A.",
        language: "English",
        teachingPoint: "Demonstrates title abbreviation handling ('Dr.'), contraction detachment ('doesn't' -> 'does', 'n't'), and acronym preservation ('U.S.A.').",
      },
      {
        label: "Devanagari Danda & Nukta (हिन्दी)",
        text: "डॉ. शर्मा ने कहा कि प्राकृतिक भाषा प्रसंस्करण एक रोचक विषय है। क्या आप सहमत हैं?",
        language: "Hindi",
        teachingPoint: "Demonstrates Devanagari abbreviation ('डॉ.'), Danda (।) sentence boundary splitting, and interrogative punctuation.",
      },
      {
        label: "Marathi Compound & Conjunction (मराठी)",
        text: "संगणकीय भाषाशास्त्र आणि कृत्रिम बुद्धिमत्ता हे अत्यंत महत्त्वाचे विषय आहेत; यावर सखोल संशोधन सुरू आहे.",
        language: "Marathi",
        teachingPoint: "Tests semicolon sentence boundaries and Marathi-specific conjunction and postposition filtering.",
      },
    ],
    quiz: [
      {
        id: "prep-q1",
        question: "Why should stop words be removed in topic classification but retained in sentiment analysis?",
        options: [
          "Stop words carry no meaning in any linguistic task",
          "Words like 'not', 'no', or 'never' are stop words but completely invert sentiment polarity",
          "Stop words consume too much GPU memory in all models",
          "Stop words only exist in English, not in Indian languages",
        ],
        correctIndex: 1,
        explanation: "In sentiment analysis, stop words include negation markers ('not', 'neither', 'hardly') which flip emotional valence from positive to negative.",
      },
      {
        id: "prep-q2",
        question: "In Devanagari script (Hindi/Marathi), what indicates an end-of-sentence boundary equivalent to an English full stop?",
        options: [
          "Devanagari Virama (्)",
          "Devanagari Danda (। - U+0964)",
          "Anusvara (ं)",
          "Visarga (ः)",
        ],
        correctIndex: 1,
        explanation: "The Devanagari Purna Viram / Danda (।) signifies sentence termination across Sanskrit-derived Indic scripts.",
      },
    ],
    labManual: {
      experimentNumber: 2,
      title: "Text Preprocessing, Tokenization, Filtration & Psycholinguistic Readability",
      aim: "To implement an automated preprocessing pipeline that performs sentence segmentation, word tokenization, stop-word filtration, script validation, and psycholinguistic readability scoring on multilingual corpora.",
      theory: "Text preprocessing transforms unstructured human language into clean discrete symbols. It eliminates morphological noise, strips non-informative grammatical particles, checks Unicode script blocks, and evaluates cognitive reading complexity using Flesch and Gunning Fog indices.",
      algorithm: [
        "1. Ingest raw text and validate Unicode code-point blocks (Latin U+0020-U+007F vs Devanagari U+0900-U+097F).",
        "2. Segment text into sentences using terminal punctuation and Devanagari Danda (।).",
        "3. Tokenize sentences into discrete words and strip extraneous punctuation.",
        "4. Filter out language-specific stopwords using hash set lookup O(1).",
        "5. Count syllables and aksharas to compute Flesch Reading Ease = 206.835 - 1.015*(ASL) - 84.6*(ASW).",
      ],
      vivaHighlights: [
        "Definition of token, type, and vocabulary (TTR ratio).",
        "Regex patterns for contraction splitting vs abbreviations.",
        "Role of stop words in Information Retrieval vs Machine Translation.",
      ],
      conclusionTemplate: "The text preprocessing and readability pipeline successfully segmented and tokenized the corpus into discrete units with 0% data loss, verified script integrity, filtered non-salient grammatical particles, and computed reading complexity.",
    },
  },

  // =========================================================================
  // PRACTICAL 3: Stemming vs Lemmatization
  // =========================================================================
  "stemlemma": {
    id: "stemlemma",
    practicalNumber: 3,
    title: "Morphological Normalization: Stemming vs POS-Aware Lemmatization",
    complexity: {
      time: "Stemming: O(L) rule-based; Lemmatization: O(L + dictionary lookup)",
      space: "O(V) unique vocabulary mapping",
    },
    vivaQuestions: [
      {
        question: "What is the fundamental difference between Stemming and Lemmatization?",
        answer: "Stemming applies heuristic rule-based suffix slicing (e.g. Porter, Lovins) without knowing grammar, often creating non-words like 'studi' from 'studying'. Lemmatization uses morphological dictionaries and Part-of-Speech context to reduce inflected forms to their valid dictionary base lemma (e.g., 'better' -> 'good', 'saw' (noun) -> 'saw', 'saw' (verb) -> 'see').",
        tip: "Always emphasize that lemmatization produces valid dictionary lemmas while stemming produces crude stems.",
        category: "Foundations",
      },
      {
        question: "What is Over-stemming and Under-stemming? Give examples.",
        answer: "Over-stemming occurs when two semantically different words are conflated to the same stem (e.g., 'universal', 'universe', and 'university' all stemmed to 'univers'). Under-stemming occurs when morphological variants of the same concept fail to reduce to the same stem (e.g., 'alumnus' and 'alumni').",
        tip: "External examiners frequently ask for concrete word pairs demonstrating both failure modes.",
        category: "Evaluation",
      },
      {
        question: "Why does Lemmatization require Part-of-Speech (POS) tags to be accurate?",
        answer: "The same surface form can have different lemmas depending on syntactic category. For example, 'meeting' as a Noun has lemma 'meeting', but as a Verb ('they are meeting') has lemma 'meet'. 'Saw' as a noun is 'saw'; as a verb is 'see'.",
        tip: "State that lemmatization without POS defaults to noun reduction and causes semantic errors.",
        category: "Implementation",
      },
    ],
    linguisticPresets: [
      {
        label: "Stemming Non-Words vs Lemmatization",
        text: "The universities were studying universal organizations and running computational experiments.",
        language: "English",
        teachingPoint: "Notice how Porter reduces 'universities' to 'universi' and 'studying' to 'studi' (non-words), while lemmatization yields 'university' and 'study'.",
      },
      {
        label: "Irregular Inflections (Good -> Better, Saw)",
        text: "The best students saw better results after they had eaten their meals.",
        language: "English",
        teachingPoint: "Irregulars like 'saw' -> 'see', 'better' -> 'good', and 'eaten' -> 'eat' can ONLY be solved by lemmatizers, not heuristic stemmers.",
      },
      {
        label: "Hindi Verbal Inflections (हिन्दी)",
        text: "बच्चे मैदान में खेलेंगे और प्रतिदिन खेलते हैं।",
        language: "Hindi",
        teachingPoint: "Demonstrates Hindi tense inflections: 'खेलेंगे' (future) and 'खेलते' (present) both lemmatize to base infinitive 'खेलना'.",
      },
    ],
    quiz: [
      {
        id: "stem-q1",
        question: "What is the primary algorithmic limitation of the Porter Stemmer?",
        options: [
          "It is too slow to execute in modern computer systems",
          "It relies purely on suffix-stripping heuristic rules without consulting a dictionary",
          "It only works on Devanagari script",
          "It requires GPU acceleration to compute",
        ],
        correctIndex: 1,
        explanation: "The Porter Stemmer applies 5 sequential rule conditions (like -sses -> -ss) without verifying whether the resulting stem is an actual dictionary word.",
      },
      {
        id: "stem-q2",
        question: "If the word 'ran' is processed, what will a POS-aware lemmatizer output?",
        options: [
          "ran",
          "run",
          "running",
          "r",
        ],
        correctIndex: 1,
        explanation: "'Ran' is an irregular past tense verb form whose base citation form (lemma) in English dictionaries is 'run'.",
      },
    ],
    labManual: {
      experimentNumber: 3,
      title: "Comparative Study of Heuristic Stemming and POS-Aware Lemmatization",
      aim: "To design, implement, and compare heuristic rule-based stemming (Porter algorithm) and lexicon-driven Part-of-Speech aware lemmatization across English and Indic text corpora.",
      theory: "Vocabulary explosion is a major hurdle in text processing. Morphological normalization collapses inflectional and derivationally related forms into a single root representation. Stemming uses greedy suffix peeling, whereas Lemmatization looks up the canonical citation form (lemma) using lexical knowledge.",
      algorithm: [
        "1. Extract unique words from corpus vocabulary.",
        "2. Pass tokens through Porter Stemmer suffix-reduction step conditions.",
        "3. Compute POS tags for sentence context to disambiguate verbal vs nominal uses.",
        "4. Query the morphological lemma mapping table for irregular forms (ran -> run, better -> good).",
        "5. Quantify modification rates and dictionary validity ratios between stemmer and lemmatizer.",
      ],
      vivaHighlights: [
        "Porter Stemmer measure (m) and consonant/vowel sequencing: [C](VC)^m[V].",
        "Trade-off: Stemming is fast O(1); Lemmatization is accurate but computationally heavier.",
        "Impact on search recall vs search precision in Information Retrieval.",
      ],
      conclusionTemplate: "Heuristic stemming modified the highest percentage of words through suffix truncation but produced non-dictionary stems; POS-aware lemmatization yielded valid dictionary headwords preserving full semantic integrity.",
    },
  },

  // =========================================================================
  // PRACTICAL 5: N-Gram Language Modeling
  // =========================================================================
  "ngram": {
    id: "ngram",
    practicalNumber: 5,
    title: "Statistical N-Gram Language Modeling & Probability Smoothing",
    complexity: {
      time: "Training: O(N) linear text scan; Query: O(1) hash map lookup",
      space: "O(V^N) theoretical maximum, sparse hash map in practice",
    },
    vivaQuestions: [
      {
        question: "What is the Markov Assumption in N-Gram Language Models?",
        answer: "The Markov Assumption states that the probability of the upcoming word depends only on the preceding (N - 1) words, rather than the entire arbitrary history of the discourse: P(w_n | w_1...w_{n-1}) ≈ P(w_n | w_{n-N+1}...w_{n-1}).",
        tip: "A bigram model uses 1st order Markov; a trigram model uses 2nd order Markov.",
        category: "Mathematical",
      },
      {
        question: "What is the Zero-Probability Problem and how is Smoothing used to solve it?",
        answer: "If an N-Gram was never observed during training, its Maximum Likelihood Estimate (MLE) count is zero, causing the entire sequence probability to collapse to 0 (P(W) = 0). Smoothing (such as Laplace Add-1, Add-k, or Good-Turing) reallocates probability mass from frequent events to unseen N-Grams.",
        tip: "Laplace formula: P_Laplace(w_n | w_{n-1}) = (Count(w_{n-1}, w_n) + 1) / (Count(w_{n-1}) + V).",
        category: "Mathematical",
      },
      {
        question: "What is Perplexity and how is it used to evaluate Language Models?",
        answer: "Perplexity (PP) is the inverse probability of the test set normalized by the number of words: PP(W) = P(w_1, ..., w_N)^(-1/N). A lower perplexity indicates the language model is less surprised by the test sentences and predicts the text better.",
        tip: "Perplexity can also be viewed as the weighted average branching factor of the language.",
        category: "Evaluation",
      },
    ],
    linguisticPresets: [
      {
        label: "Repetitive Bigram Context",
        text: "natural language processing enables natural language understanding and natural language generation",
        language: "English",
        teachingPoint: "Observe how P('processing' | 'natural language') vs P('understanding' | 'natural language') demonstrates conditional probability distribution.",
      },
      {
        label: "Classic Academic Trigram Corpus",
        text: "The student studied computer science in college. The student studied natural language processing in college.",
        language: "English",
        teachingPoint: "Demonstrates 2-word history conditioning: P('computer' | 'student studied') = 0.5 and P('natural' | 'student studied') = 0.5.",
      },
      {
        label: "Hindi Indic N-Gram Chain (हिन्दी)",
        text: "भारत सरकार ने नई शिक्षा नीति की घोषणा की। सरकार ने विज्ञान और अनुसंधान पर बल दिया।",
        language: "Hindi",
        teachingPoint: "Demonstrates bigram transition P('सरकार' | 'भारत') and P('नीति' | 'शिक्षा') in official Devanagari text.",
      },
    ],
    quiz: [
      {
        id: "ngram-q1",
        question: "In a Bigram model with vocabulary size V = 10,000, what is the maximum number of potential bigram parameters?",
        options: [
          "20,000",
          "10,000",
          "100,000,000 (V^2)",
          "1,000,000,000,000 (V^3)",
        ],
        correctIndex: 2,
        explanation: "A bigram model conditions on 1 previous word, requiring a V x V transition probability matrix, giving V^2 = 10,000^2 = 100,000,000 parameters.",
      },
      {
        id: "ngram-q2",
        question: "Why does multiplying raw probabilities in a language model cause arithmetic underflow in computers?",
        options: [
          "Probabilities are greater than 1",
          "Multiplying many fractions between 0 and 1 approaches 0 and exceeds double-precision floating point limits",
          "Computers cannot divide numbers",
          "Language models only accept integer inputs",
        ],
        correctIndex: 1,
        explanation: "Multiplying fractions like 0.001 * 0.0004 quickly underflows to 0. Real NLP models compute the sum of log probabilities: log P(W) = Σ log P(w_i | history).",
      },
    ],
    labManual: {
      experimentNumber: 5,
      title: "Statistical N-Gram Language Modeling & Next-Word Prediction",
      aim: "To build Unigram, Bigram, and Trigram language models, compute Maximum Likelihood Estimates (MLE), apply Laplace smoothing, and evaluate next-word predictive probabilities.",
      theory: "Language models compute the probability distribution over word sequences P(w_1, ..., w_m). By applying the chain rule of probability alongside the Markov assumption, an N-Gram model approximates the context using the previous N-1 tokens.",
      algorithm: [
        "1. Tokenize corpus text and append start/end sequence boundary markers (<s>, </s>).",
        "2. Construct frequency count hash tables for unigrams C(w_i), bigrams C(w_{i-1}, w_i), and trigrams.",
        "3. Compute Maximum Likelihood Probabilities: P_MLE(w_i | w_{i-1}) = C(w_{i-1}, w_i) / C(w_{i-1}).",
        "4. Implement Laplace Add-1 smoothing to assign non-zero probability mass to unobserved combinations.",
        "5. Given a prompt history, sort candidate vocabulary by conditional probability for next-word generation.",
      ],
      vivaHighlights: [
        "Chain rule of probability: P(w_1...w_n) = Π P(w_i | w_1...w_{i-1}).",
        "Tradeoff between N size: Higher N gives more context but severe data sparsity; lower N is robust but lacks context.",
        "Log-space probability arithmetic: log(P_1 * P_2) = log(P_1) + log(P_2).",
      ],
      conclusionTemplate: "The statistical N-Gram model demonstrated that increasing context length from Unigram to Trigram significantly refined predictive probability distributions while necessitating smoothing for unseen word combinations.",
    },
  },

  // =========================================================================
  // PRACTICAL 6: Part-of-Speech Tagging & Hidden Markov Models (HMM)
  // =========================================================================
  "pos": {
    id: "pos",
    practicalNumber: 6,
    title: "Part-of-Speech Tagging, Penn Treebank & Hidden Markov Model (HMM)",
    complexity: {
      time: "Viterbi DP: O(T · |S|^2); Brute Force: O(|S|^T)",
      space: "O(T · |S|) Trellis Matrix",
    },
    vivaQuestions: [
      {
        question: "Why is POS tagging framed as a sequence labeling task rather than independent classification?",
        answer: "Words are syntactically interdependent. For example, in 'the bank can guarantee the loan', 'can' is a modal auxiliary verb (MD) because it follows the noun 'bank' and precedes the base verb 'guarantee'. In 'a can of soda', 'can' is a singular noun (NN). Sequence models consider transition probabilities between tags P(t_i | t_{i-1}).",
        tip: "Contrast isolated dictionary lookup with sequence models like HMM, MEMM, and CRF.",
        category: "Foundations",
      },
      {
        question: "State the Viterbi Dynamic Programming recurrence relation.",
        answer: "v_t(j) = max_i [ v_{t-1}(i) * A_{ij} ] * B_j(w_t), where v_t(j) is the maximum probability of state j at step t, A_{ij} is the transition probability from state i to state j, and B_j(w_t) is the emission probability of word w_t from state j.",
        tip: "Be ready to explain that the backpointer records argmax_i to reconstruct the path backwards.",
        category: "Mathematical",
      },
      {
        question: "Why is brute-force decoding impractical for POS tagging in HMMs?",
        answer: "With T tokens and |S| possible POS tags, there are |S|^T possible tag sequences. For a 10-word sentence with 36 Penn Treebank tags, |S|^T = 36^10 ≈ 3.65 x 10^15 combinations (impossible in real time). Viterbi reduces this to polynomial time O(T · |S|^2).",
        tip: "Mention that Viterbi achieves this speedup by pruning sub-optimal paths through dynamic programming memoization.",
        category: "Mathematical",
      },
    ],
    linguisticPresets: [
      {
        label: "Classic Polysemy & Syntactic Ambiguity",
        text: "Time flies like an arrow, but fruit flies like a banana.",
        language: "English",
        teachingPoint: "Examiner classic! In clause 1: 'Time' is NN, 'flies' is VBZ. In clause 2: 'fruit' is NN, 'flies' is NNS (noun plural), 'like' is VBP (verb).",
      },
      {
        label: "Modal vs Noun vs Verb ('Can')",
        text: "They can can the beans in a can.",
        language: "English",
        teachingPoint: "Demonstrates 3 different tags for the word 'can': Modal verb (MD), Transitive action verb (VB), and Concrete object noun (NN).",
      },
      {
        label: "Devanagari Subject-Object-Verb (SOV) Syntax",
        text: "विद्यार्थी ग्रंथालयात पुस्तक वाचत आहे।",
        language: "Marathi",
        teachingPoint: "Demonstrates SOV syntactic word order in Indic languages: Subject ('विद्यार्थी'), Locative ('ग्रंथालयात'), Object ('पुस्तक'), and Verb phrase ('वाचत आहे').",
      },
    ],
    quiz: [
      {
        id: "pos-q1",
        question: "In the Penn Treebank POS tagset, what do the tags 'NN', 'NNP', and 'NNS' represent?",
        options: [
          "Noun singular, Proper noun singular, Noun plural",
          "Adjective, Adverb, Conjunction",
          "Verb base, Verb past, Verb gerund",
          "Number, Negation, Nominalizer",
        ],
        correctIndex: 0,
        explanation: "NN = singular common noun (cat), NNP = proper noun (Delhi, Google), NNS = plural common noun (cats).",
      },
      {
        id: "pos-q2",
        question: "What does the Emission Probability B_j(w_t) in an HMM represent?",
        options: [
          "The probability of transitioning from tag j to tag i",
          "The probability of the sentence beginning with word w_t",
          "The probability that hidden state tag j emits/generates observation word w_t",
          "The count of words in the corpus",
        ],
        correctIndex: 2,
        explanation: "Emission probability P(word | tag) represents how likely a specific surface word is given the underlying grammatical hidden state.",
      },
    ],
    labManual: {
      experimentNumber: 6,
      title: "Part-of-Speech Tagging and Hidden Markov Model (HMM) Viterbi Decoding",
      aim: "To assign Penn Treebank grammatical category tags to continuous text and implement the first-order HMM Viterbi dynamic programming trellis algorithm.",
      theory: "Part-of-Speech tagging disambiguates lexical category by evaluating both contextual transition probabilities between grammatical states and lexical emission probabilities from states to words.",
      algorithm: [
        "1. Tokenize input sequence into observation tokens w_1, w_2, ..., w_T.",
        "2. Initialize Trellis column 0: v_0(j) = π_j * B_j(w_0) for all hidden states j ∈ S.",
        "3. Recursively compute Trellis cells for t = 1 to T-1: v_t(j) = max_i [ v_{t-1}(i) * A_{ij} ] * B_j(w_t).",
        "4. Store the maximizing predecessor state in backpointer matrix: bp_t(j) = argmax_i [ v_{t-1}(i) * A_{ij} ].",
        "5. Identify best final state at step T-1 and backtrack through bp to recover the globally optimal tag sequence.",
      ],
      vivaHighlights: [
        "Hidden state (POS tag) vs Observation (surface word).",
        "Difference between generative models (HMM) and discriminative models (MEMM, CRF).",
        "Penn Treebank tagset (36 main POS tags + punctuation tags).",
      ],
      conclusionTemplate: "The HMM Viterbi algorithm successfully resolved syntactic ambiguities across observation sequences in polynomial time O(T·|S|²), producing the globally optimal state sequence.",
    },
  },

  // =========================================================================
  // PRACTICAL 8: Named Entity Recognition (NER)
  // =========================================================================
  "ner": {
    id: "ner",
    practicalNumber: 8,
    title: "Named Entity Recognition (NER) & IOB Sequence Modeling",
    complexity: {
      time: "Rule-based/Gazetteer: O(N); CRF/Neural: O(T · |E|^2)",
      space: "O(K) extracted entities",
    },
    vivaQuestions: [
      {
        question: "What is the IOB (Inside-Outside-Beginning) tagging format in NER?",
        answer: "IOB tagging handles multi-word named entity spans. 'B-ORG' marks the beginning of an organization name, 'I-ORG' marks continuation tokens inside the organization name, and 'O' marks tokens that are outside any named entity. For example: 'Indian' (B-ORG), 'Space' (I-ORG), 'Research' (I-ORG), 'Organisation' (I-ORG).",
        tip: "Explain that without B- and I- prefixes, two adjacent entities of the same type cannot be separated.",
        category: "Foundations",
      },
      {
        question: "Why should standalone fragments like Devanagari 'मे' NOT be classified as DATE?",
        answer: "In Devanagari script, 'मे' is commonly a standalone fragment or typo for the locative postposition 'में' (in/at), not a date. True dates consist of calendar numbers alongside explicit Hindi months ('14 अक्टूबर 2026') or relative temporal markers ('कल', 'सोमवार'). Postprocessing rules or morphological filters must prevent single postposition tokens from misclassification as DATE.",
        tip: "Cite the university rule: DATE = '14 अक्टूबर 2026, कल, सोमवार'; O = 'मे' standalone fragment.",
        category: "Implementation",
      },
      {
        question: "What is the difference between Named Entity Recognition (NER) and Entity Linking?",
        answer: "NER detects entity boundaries and classifies their semantic type (Person, Organization, Location, Date). Entity Linking maps the extracted textual mention to a unique canonical entry in a knowledge base (such as Wikipedia or Wikidata) to resolve ambiguity (e.g. linking 'Apple' to the corporation vs the fruit).",
        tip: "Mention coreference resolution as an auxiliary step.",
        category: "Foundations",
      },
    ],
    linguisticPresets: [
      {
        label: "Multilingual Official Government & Dates (हिन्दी)",
        text: "14 अक्टूबर 2026 को भारत सरकार और इसरो ने नई दिल्ली में चंद्रयान मिशन की घोषणा की।",
        language: "Hindi",
        teachingPoint: "Tests university NER rules: '14 अक्टूबर 2026' (DATE), 'भारत सरकार' & 'इसरो' (ORG), 'नई दिल्ली' (GPE), and verifies 'में' is treated as O (postposition).",
      },
      {
        label: "Multi-Word Entity Span (IOB Test)",
        text: "Sundar Pichai visited Google headquarters in Mountain View on Monday.",
        language: "English",
        teachingPoint: "Sundar (B-PER) Pichai (I-PER), Google (B-ORG), Mountain (B-GPE) View (I-GPE), Monday (B-DATE).",
      },
      {
        label: "Historical Figures & Cities (मराठी)",
        text: "छत्रपती शिवाजी महाराज यांनी रायगड येथे राजधानी स्थापन केली आणि पुणे येथे स्वराज्य वाढवले.",
        language: "Marathi",
        teachingPoint: "Demonstrates Marathi PERSON entity ('छत्रपती शिवाजी महाराज') and GPE/Locations ('रायगड', 'पुणे').",
      },
    ],
    quiz: [
      {
        id: "ner-q1",
        question: "In the sentence 'New York University was founded in New York', what are the respective entity types?",
        options: [
          "'New York University' is ORGANIZATION, and 'New York' is LOCATION (GPE)",
          "Both instances are LOCATION (GPE)",
          "Both instances are ORGANIZATION",
          "Neither is an entity",
        ],
        correctIndex: 0,
        explanation: "Contextual named entity recognition correctly identifies that the first span refers to an educational institution (ORG) while the second refers to the geographic city/state (GPE/LOC).",
      },
      {
        id: "ner-q2",
        question: "What entity tag should be assigned to the standalone Hindi word 'मे'?",
        options: [
          "DATE",
          "ORGANIZATION",
          "O (Outside - Not an entity)",
          "LOCATION",
        ],
        correctIndex: 2,
        explanation: "'मे' is a postposition / grammatical fragment, not a date or proper entity. It must receive the 'O' tag.",
      },
    ],
    labManual: {
      experimentNumber: 8,
      title: "Named Entity Recognition (NER) & Information Extraction",
      aim: "To identify, classify, and extract named entities (PERSON, ORGANIZATION, GPE/LOCATION, DATE) from multilingual unstructured text corpora using IOB sequence tags.",
      theory: "Named Entity Recognition locates and classifies rigid designators into predefined semantic categories. It relies on capitalization, gazetteer lexicons, title prefixes, temporal patterns, and contextual boundary markers.",
      algorithm: [
        "1. Preprocess and tokenize text while preserving original character offsets and capitalization.",
        "2. Apply pattern matchers for multi-token dates, temporal indicators, and numbers.",
        "3. Match sequences against curated organization and geographic gazetteers.",
        "4. Enforce linguistic sanity rules (e.g. standalone postposition 'मे' -> O).",
        "5. Output structured entity cards with entity mention, semantic category, and confidence score.",
      ],
      vivaHighlights: [
        "IOB vs BIOES labeling schema.",
        "Evaluation metrics: Precision, Recall, and Micro/Macro F1-Score.",
        "Handling polysemy (Washington the Person vs Washington the State/City vs Washington the University).",
      ],
      conclusionTemplate: "The NER extraction system accurately identified proper entities across categories with boundary detection, correctly resolving multilingual date expressions and avoiding grammatical false positives.",
    },
  },

  // =========================================================================
  // PRACTICAL 9: Vector Space Models & BM25 Ranking
  // =========================================================================
  "similarity": {
    id: "similarity",
    practicalNumber: 9,
    title: "Vector Space Models, Cosine Similarity & Okapi BM25 Probabilistic Ranking",
    complexity: {
      time: "TF-IDF: O(D · V); BM25: O(Q · avg_postings)",
      space: "O(D · V) sparse inverted index",
    },
    vivaQuestions: [
      {
        question: "Why is Cosine Similarity preferred over Euclidean Distance for comparing text documents?",
        answer: "Euclidean distance is sensitive to document length: doubling the length of a document by repeating its paragraphs moves its point twice as far in vector space, despite having identical topic distribution. Cosine similarity measures the angle between vectors, normalizing for document length.",
        tip: "Formula: Cosine(A, B) = (A · B) / (||A|| * ||B||). Ranges from 0 (orthogonal/unrelated) to 1.0 (identical angle).",
        category: "Mathematical",
      },
      {
        question: "Why does modern search (Elasticsearch/Lucene) use BM25 instead of classical TF-IDF?",
        answer: "Classical TF-IDF suffers from linear term frequency growth: a document repeating a keyword 50 times gets 50x the score (vulnerable to keyword spam). BM25 introduces term frequency saturation via parameter k_1 (diminishing returns as TF increases) and document length normalization via parameter b.",
        tip: "Explain that k_1 sets the asymptotic upper bound for TF impact, while b penalizes verbose documents.",
        category: "Foundations",
      },
      {
        question: "What happens if BM25 parameters k_1 and b are set to their extreme values?",
        answer: "If k_1 = 0, term frequency is completely ignored (binary presence/absence model). As k_1 -> ∞, BM25 approaches linear TF. If b = 0, document length normalization is completely disabled; if b = 1, documents are fully penalized strictly proportional to their length.",
        tip: "Standard default values in Elasticsearch are k_1 = 1.2 to 1.5, and b = 0.75.",
        category: "Implementation",
      },
    ],
    linguisticPresets: [
      {
        label: "Keyword Stuffing vs Relevant Document (BM25 Test)",
        text: "Doc A: Artificial intelligence systems solve problems. Doc B: Artificial artificial artificial artificial artificial artificial intelligence.",
        language: "English",
        teachingPoint: "Demonstrates how BM25 k_1 saturation limits the unfair advantage of repeated keywords in Doc B compared to raw TF-IDF.",
      },
      {
        label: "Short Query vs Long Document Length Penalty",
        text: "Doc A (Concise): Python is a versatile programming language. Doc B (Verbose): A very long textbook with thousands of filler words mentioning Python once.",
        language: "English",
        teachingPoint: "Demonstrates how parameter 'b' prevents long, verbose documents from dominating short, highly focused documents.",
      },
      {
        label: "Cross-Language Document Topic Comparison",
        text: "Doc 1: संगणक विज्ञान आणि माहिती तंत्रज्ञान. Doc 2: Computer science and information technology.",
        language: "Marathi",
        teachingPoint: "Illustrates the limitation of pure lexical vector matching across different languages without translation or cross-lingual embeddings.",
      },
    ],
    quiz: [
      {
        id: "sim-q1",
        question: "What is the cosine similarity between two documents that have zero words in common?",
        options: [
          "1.0",
          "0.0",
          "-1.0",
          "0.5",
        ],
        correctIndex: 1,
        explanation: "If two documents share no common vocabulary, their dot product A · B is 0, resulting in a cosine similarity of 0.0 (orthogonal vectors).",
      },
      {
        id: "sim-q2",
        question: "In the Okapi BM25 formula, what is the role of parameter 'b'?",
        options: [
          "It sets the number of topics to discover",
          "It controls the degree of document length normalization penalty",
          "It removes stop words automatically",
          "It converts text to lower case",
        ],
        correctIndex: 1,
        explanation: "Parameter 'b' (usually 0.75) penalizes documents that are longer than the average document length in the corpus.",
      },
    ],
    labManual: {
      experimentNumber: 9,
      title: "Document Similarity via TF-IDF Vector Space and Okapi BM25 Ranking",
      aim: "To construct Term Frequency-Inverse Document Frequency (TF-IDF) feature vectors, compute pairwise Cosine Similarity, and implement the Okapi BM25 probabilistic ranking function with saturation and length normalization.",
      theory: "Information Retrieval models project documents into geometric space. TF-IDF balances local word saliency with corpus-wide rarity. Okapi BM25 refines this probabilistically using non-linear TF saturation and document length normalization.",
      algorithm: [
        "1. Build corpus inverted index and compute document frequencies DF(t) for all terms.",
        "2. Compute Inverse Document Frequency: IDF(t) = ln((N - DF(t) + 0.5) / (DF(t) + 0.5) + 1).",
        "3. For Cosine Similarity: compute normalized L2 unit vectors and take the dot product.",
        "4. For BM25 Ranking: compute score contribution for each query term using parameters k_1 and b.",
        "5. Rank corpus documents descending by final score.",
      ],
      vivaHighlights: [
        "Why IDF uses logarithmic scaling.",
        "Formula for Okapi BM25 score contribution.",
        "Inverted index data structure (postings lists).",
      ],
      conclusionTemplate: "The experiment validated that Okapi BM25 prevents term-frequency exploitation through its asymptotic k_1 curve and length penalty b, outperforming raw TF-IDF in retrieval relevance.",
    },
  },

  // =========================================================================
  // PRACTICAL 11: Sentiment Analysis & Affective Computing
  // =========================================================================
  "sentiment": {
    id: "sentiment",
    practicalNumber: 11,
    title: "Lexicon-Based Sentiment Analysis & Grammatical Valence Inversion",
    complexity: {
      time: "O(W) linear scan over words",
      space: "O(L) lexicon dictionary size",
    },
    vivaQuestions: [
      {
        question: "How does grammatical negation inversion work in rule-based sentiment analysis?",
        answer: "When a negation marker (e.g. 'not', 'never', 'hardly', 'नॉट', 'नाही') is encountered, it defines a forward valence inversion window (typically 1 to 3 subsequent tokens). Any positive adjective encountered within that window (e.g. 'good') is inverted to a negative score (-0.8 * score).",
        tip: "Explain that bag-of-words without negation window treats 'not good' as positive because 'good' is positive.",
        category: "Implementation",
      },
      {
        question: "What is the difference between Polarity and Subjectivity in sentiment analysis?",
        answer: "Polarity measures the emotional valence (from -1.0 highly negative to +1.0 highly positive). Subjectivity measures whether the text expresses personal opinions, feelings, and beliefs (1.0 subjective) versus factual statements (0.0 objective).",
        tip: "Example: 'The iPhone 15 was released in September' has neutral polarity and 0.0 subjectivity.",
        category: "Foundations",
      },
      {
        question: "What is an Intensifier / Booster in sentiment lexicons?",
        answer: "Intensifiers are adverbs of degree (such as 'extremely', 'very', 'incredibly', 'खूप', 'अत्यंत') that amplify the emotional weight of subsequent sentiment words (e.g. multiplying valence by 1.5x), without possessing an inherent sentiment direction on their own.",
        tip: "Mention both amplifiers ('very good') and downtoners ('slightly disappointed').",
        category: "Foundations",
      },
    ],
    linguisticPresets: [
      {
        label: "Grammatical Negation Inversion ('Not Good')",
        text: "The lecture was not good, and the explanations were never clear.",
        language: "English",
        teachingPoint: "Demonstrates how negation particles ('not', 'never') flip positive words ('good', 'clear') into negative polarity.",
      },
      {
        label: "Amplifiers & Contrastive Conjunction ('But')",
        text: "The interface is extremely beautiful and fast, but the customer support is terrible.",
        language: "English",
        teachingPoint: "Demonstrates adverb amplification ('extremely') and contrastive discourse markers ('but') which shift sentiment focus.",
      },
      {
        label: "Hindi Mixed Review with Negation (हिन्दी)",
        text: "यह फिल्म बिल्कुल भी अच्छी नहीं है, समय की बर्बादी है।",
        language: "Hindi",
        teachingPoint: "Demonstrates Hindi negation syntax where post-verbal 'नहीं' flips preceding adjective 'अच्छी'.",
      },
      {
        label: "Marathi Positive Review with Intensifiers (मराठी)",
        text: "हे पुस्तक अत्यंत उत्कृष्ट आणि माहितीपूर्ण आहे, मला खूप आवडले।",
        language: "Marathi",
        teachingPoint: "Demonstrates Marathi intensifiers ('अत्यंत', 'खूप') multiplying positive roots ('उत्कृष्ट', 'आवडले').",
      },
    ],
    quiz: [
      {
        id: "sent-q1",
        question: "In the sentence 'The movie was not terrible', what is the intended polarity after negation handling?",
        options: [
          "Strongly Negative",
          "Mildly Positive or Neutral",
          "Undefined",
          "Extreme Anger",
        ],
        correctIndex: 1,
        explanation: "Negating a negative adjective ('not terrible') produces a mildly positive or neutral stance through litotes (ironic understatement).",
      },
      {
        id: "sent-q2",
        question: "Which of the following is a Subjective statement?",
        options: [
          "The temperature today is 28 degrees Celsius.",
          "The company reported a revenue of $10 million in Q3.",
          "This laptop design is breathtaking and magnificent.",
          "The speed of light in vacuum is approximately 300,000 km/s.",
        ],
        correctIndex: 2,
        explanation: "'Breathtaking and magnificent' is an evaluative personal opinion, giving it high subjectivity.",
      },
    ],
    labManual: {
      experimentNumber: 11,
      title: "Lexicon-Based Sentiment Analysis and Valence Inversion",
      aim: "To design a multilingual sentiment analysis engine that computes normalized polarity and subjectivity scores while handling grammatical negation and adverbial intensifiers.",
      theory: "Sentiment analysis classifies user opinion into positive, neutral, or negative categories. Rule-based lexical models score words using valence dictionaries (AFINN/SentiWordNet) and apply compositional syntax rules for negation windows.",
      algorithm: [
        "1. Tokenize document into sentences and word tokens.",
        "2. Detect negation keywords ('not', 'never', 'नाही') and activate a 3-token inversion window.",
        "3. Detect adverbial intensifiers ('very', 'खूप') and compute magnification multiplier.",
        "4. Calculate token valence scores and accumulate into aggregate sentence polarity.",
        "5. Normalize polarity to [-1.0, +1.0] and compute subjectivity ratio.",
      ],
      vivaHighlights: [
        "VADER and AFINN dictionary architectures.",
        "Sarcasm and irony detection challenges in rule-based systems.",
        "Difference between aspect-based sentiment analysis and document-level sentiment.",
      ],
      conclusionTemplate: "The sentiment analysis model successfully classified affective stance, verified that grammatical negation windows prevented false positive scores on negated adjectives, and computed emotional polarity across test documents.",
    },
  },

  // =========================================================================
  // PRACTICAL 14: Keyphrase Extraction & TextRank Extractive Summarizer
  // =========================================================================
  "keywords": {
    id: "keywords",
    practicalNumber: 14,
    title: "Keyphrase Extraction (RAKE, TF-IDF) & TextRank Graph Summarization",
    complexity: {
      time: "RAKE: O(N); TextRank: O(I · S^2) where I is PageRank iterations",
      space: "O(S^2) sentence adjacency matrix",
    },
    vivaQuestions: [
      {
        question: "How does Mihalcea & Tarau's TextRank algorithm generate document summaries without training data?",
        answer: "TextRank is an unsupervised graph model. It treats each sentence as a node in a complete graph. Edges between sentences are weighted by their lexical similarity (shared content tokens normalized by log lengths). It then runs PageRank power iteration until convergence. The sentences with the highest eigenvector centrality scores are extracted as the summary.",
        tip: "Explain that TextRank is extractive (selects existing sentences), not abstractive (generates new sentences).",
        category: "Foundations",
      },
      {
        question: "How does RAKE (Rapid Automatic Keyword Extraction) score multi-word phrases?",
        answer: "RAKE partitions text into candidate phrases using stop words and phrase delimiters. It builds a word co-occurrence matrix to compute each word's degree deg(w) and frequency freq(w). Individual word scores are computed as deg(w)/freq(w). A phrase's total score is the sum of its member word scores.",
        tip: "deg(w)/freq(w) favors words that frequently co-occur with many different words.",
        category: "Implementation",
      },
      {
        question: "What is the Damping Factor (d) in TextRank and PageRank?",
        answer: "The damping factor (typically set to d = 0.85) represents the probability that a random reader will follow an edge/link to a connected sentence, while (1 - d) represents the probability of randomly jumping to any arbitrary sentence. It guarantees convergence and prevents spider traps.",
        tip: "Formula: WS(V_i) = (1 - d) + d * Σ [ W_ji / Σ W_jk * WS(V_j) ].",
        category: "Mathematical",
      },
    ],
    linguisticPresets: [
      {
        label: "Academic Research Abstract for Summarization",
        text: `Natural language processing is an interdisciplinary subfield of computer science and artificial intelligence.
It is primarily concerned with the interactions between computers and human language.
Challenges in natural language processing frequently involve speech recognition, natural-language understanding, and natural-language generation.
Deep learning models have significantly advanced the state of language technologies.
Extractive summarization identifies the most important sentences within an article.`,
        language: "English",
        teachingPoint: "Tests TextRank graph convergence: see which 2 sentences earn the highest PageRank centrality score.",
      },
      {
        label: "Hindi News Article (हिन्दी सारांश)",
        text: `कृत्रिम बुद्धिमत्ता और मशीन लर्निंग आज तकनीकी विकास के मुख्य स्तंभ बन चुके हैं।
भारत सरकार डिजिटल इंडिया अभियान के अंतर्गत नवाचार को बढ़ावा दे रही है।
शोधकर्ताओं का मानना है कि इससे स्वास्थ्य और शिक्षा क्षेत्र में बड़ा सुधार होगा।
उद्योगों में ऑटोमेशन बढ़ने से कार्यक्षमता में भारी वृद्धि हो रही है।`,
        language: "Hindi",
        teachingPoint: "Demonstrates Devanagari sentence graph construction and unsupervised extractive summary generation.",
      },
    ],
    quiz: [
      {
        id: "kw-q1",
        question: "What is the difference between Extractive and Abstractive summarization?",
        options: [
          "Extractive summarization selects verbatim sentences from the original text; Abstractive paraphrases and writes novel sentences like a human",
          "Extractive summarization only works on numbers; Abstractive works on words",
          "There is no difference",
          "Extractive summarization requires deep learning; Abstractive does not",
        ],
        correctIndex: 0,
        explanation: "TextRank is strictly an Extractive summarization algorithm because it ranks and selects original sentences directly from the source text.",
      },
      {
        id: "kw-q2",
        question: "In RAKE, what type of words are used as boundaries/delimiters to split sentences into candidate keyphrases?",
        options: [
          "Proper nouns",
          "Stop words and punctuation marks",
          "Verbs only",
          "Numbers only",
        ],
        correctIndex: 1,
        explanation: "RAKE splits sentences on stop words and punctuation marks to isolate continuous non-stopword lexical phrases.",
      },
    ],
    labManual: {
      experimentNumber: 14,
      title: "Keyphrase Extraction via RAKE and TextRank Graph-Based Summarization",
      aim: "To implement Rapid Automatic Keyword Extraction (RAKE) and Mihalcea & Tarau's TextRank graph-based PageRank algorithm for extractive document summarization.",
      theory: "Keyword extraction identifies topical anchors in documents. Graph-based methods model sentences as vertices and lexical overlap as edge weights, using random walk eigenvector centrality to discover the most salient sentences.",
      algorithm: [
        "1. Segment input document into N sentences.",
        "2. Compute pairwise sentence similarity matrix W_ij using log-normalized common token overlap.",
        "3. Initialize all sentence weights to 1.0.",
        "4. Iterate PageRank power equation until convergence (threshold < 0.0001 or max iterations reached).",
        "5. Sort sentences descending by PageRank score and extract top K sentences in their original chronological order.",
      ],
      vivaHighlights: [
        "Power iteration convergence proof.",
        "Sentence similarity metric: |S_i ∩ S_j| / (log(|S_i|) + log(|S_j|)).",
        "ROUGE evaluation metric (ROUGE-1, ROUGE-2, ROUGE-L) for summary quality.",
      ],
      conclusionTemplate: "The TextRank graph algorithm achieved automatic document summarization with significant compression ratio while preserving the core informational semantic topics of the corpus.",
    },
  },

  // =========================================================================
  // PRACTICAL 16: Semantic Similarity & Dense Word Embeddings (Word2Vec)
  // =========================================================================
  "semantic-similarity": {
    id: "semantic-similarity",
    practicalNumber: 16,
    title: "Dense Word Embeddings (Word2Vec / GloVe) & Semantic Vector Space",
    complexity: {
      time: "Analogy solve: O(V · D); PCA 2D: O(V · D^2)",
      space: "O(V · D) embedding matrix",
    },
    vivaQuestions: [
      {
        question: "What is the Distributional Hypothesis and who formulated it?",
        answer: "Formulated by linguist J.R. Firth in 1957: 'You shall know a word by the company it keeps.' It states that words occurring in similar linguistic contexts have similar semantic meanings, which forms the mathematical foundation for Word2Vec, GloVe, and modern Transformer embeddings.",
        tip: "Examiners love this quote! Mention J.R. Firth (1957).",
        category: "Foundations",
      },
      {
        question: "How does vector algebra solve semantic analogies like 'king - man + woman = queen'?",
        answer: "Dense word embedding models learn linear sub-spaces corresponding to semantic relationships (e.g., gender, tense, capital cities). The vector difference (king - man) isolates the abstract concept of 'royalty' by subtracting the male direction vector. Adding 'woman' applies the female direction vector, landing closest to 'queen' in continuous cosine space.",
        tip: "Formulate mathematically: argmax_w Cosine(vec(w), vec(king) - vec(man) + vec(woman)).",
        category: "Mathematical",
      },
      {
        question: "What is the difference between CBOW (Continuous Bag of Words) and Skip-Gram in Word2Vec?",
        answer: "CBOW predicts the target center word given its surrounding context words (fast, good for frequent words). Skip-Gram predicts the surrounding context words given the target center word (slower, but captures rare words and nuanced relationships better).",
        tip: "Mention that both use negative sampling or hierarchical softmax to avoid computing the full vocabulary denominator.",
        category: "Foundations",
      },
    ],
    linguisticPresets: [
      {
        label: "Royalty & Gender Analogy (King - Man + Woman)",
        text: "Passage A: The king ruled the ancient empire with justice. Passage B: The queen ruled the ancient empire with justice.",
        language: "English",
        teachingPoint: "Classic Mikolov et al. vector arithmetic: king - man + woman = queen.",
      },
      {
        label: "Science vs Computer Domain Shift",
        text: "Passage A: Software algorithms process data inside computer networks. Passage B: Biological research examines organisms inside natural habitats.",
        language: "English",
        teachingPoint: "Demonstrates domain shift in 8-dimensional semantic space: Technology vs Biological Science.",
      },
      {
        label: "Devanagari Vector Analogy (वैज्ञानिक - science + खेळ)",
        text: "वैज्ञानिक आणि संशोधक यांनी नवीन तंत्रज्ञान विकसित केले.",
        language: "Marathi",
        teachingPoint: "Tests Indic cross-concept vector composition in Devanagari semantic space.",
      },
    ],
    quiz: [
      {
        id: "sem-q1",
        question: "Why are Dense Word Embeddings superior to traditional One-Hot Vector representations?",
        options: [
          "One-Hot vectors are too dense",
          "One-Hot vectors have orthogonal cosine similarity of 0 between all words and do not capture semantic closeness",
          "Dense vectors only work on numbers",
          "One-Hot vectors cannot be stored in RAM",
        ],
        correctIndex: 1,
        explanation: "In One-Hot encoding, 'cat' and 'dog' have dot product = 0. Dense embeddings place semantically similar words in close geometric proximity (high cosine similarity).",
      },
      {
        id: "sem-q2",
        question: "In the famous Word2Vec analogy: vec('Paris') - vec('France') + vec('Italy') ≈ ?",
        options: [
          "Rome",
          "Berlin",
          "London",
          "Madrid",
        ],
        correctIndex: 0,
        explanation: "Subtracting 'France' from 'Paris' isolates the concept of 'national capital'; adding 'Italy' yields its capital city 'Rome'.",
      },
    ],
    labManual: {
      experimentNumber: 16,
      title: "Dense Semantic Word Embeddings, Vector Algebra, and 2D PCA Visualization",
      aim: "To investigate distributed continuous word representations, solve semantic vector analogies using linear compositionality, and project multi-dimensional embeddings into 2D Cartesian space via Principal Component Analysis (PCA).",
      theory: "Word embeddings map symbolic vocabulary into continuous real-valued vectors ℝ^D where geometric distance reflects semantic relatedness. Linear algebraic operations on embedding vectors reveal relational semantic properties.",
      algorithm: [
        "1. Load D-dimensional dense vector embeddings for active vocabulary.",
        "2. Implement Cosine Distance metric: sim(u, v) = (u · v) / (||u|| ||v||).",
        "3. Implement Analogy Solver: target = vec(A) - vec(B) + vec(C); find top nearest neighbors in vocabulary.",
        "4. Compute 2D Principal Component Analysis (PCA) projection matrix.",
        "5. Render interactive scatter plot to verify semantic clustering of conceptual domains.",
      ],
      vivaHighlights: [
        "Mikolov et al. (2013) Word2Vec architecture.",
        "GloVe (Global Vectors for Word Representation) based on co-occurrence matrix factorization.",
        "Intrinsic evaluation (analogy tasks) vs Extrinsic evaluation (downstream task accuracy).",
      ],
      conclusionTemplate: "The continuous dense vector space captured latent semantic dimensions without manual annotation, successfully solving vector analogy relations and demonstrating unsupervised domain clustering in 2D PCA projection.",
    },
  },
};

export function getExperimentPedagogy(id: string): ExperimentPedagogy | null {
  return PEDAGOGY_REGISTRY[id] ?? null;
}

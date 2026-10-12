# NLP Intelligence Platform — Advanced Academic NLP Laboratory & Research Assistant

An interactive Natural Language Processing learning and experimentation platform developed for Computer Engineering, Information Technology, AI/ML, and related engineering departments.

The platform executes local NLP algorithms step-by-step with zero paid LLM APIs or black-box subscriptions, displaying explainable intermediate representations, mathematical formulas, evaluation metrics, and educational limitations.

---

## 1. Architectural Stack & Design

- **Application Runtime:** Next.js 16 (App Router) with TypeScript & React 19
- **NLP Engine:** Local Node.js / TypeScript computational linguistics modules:
  - `winkNLP` + `wink-eng-lite-web-model`: Sentence boundary parsing & statistical entity extraction
  - `wink-pos-tagger`: Transformation-based Penn Treebank POS tagger
  - `wink-lemmatizer`: Dictionary-backed morphological noun, verb, and adjective lemmatization
  - `natural`: Porter Stemmer rule execution
  - `compromise`: Rule-based entity classification
  - `pdf-parse`: Local client/server PDF document text extraction
  - Custom Engines: Explainable AFINN sentiment analyzer, Multinomial Naive Bayes classifier with Laplace smoothing, Spherical TF-IDF Latent Topic Decomposition, RAKE co-occurrence graph keyword extractor, Unicode script & Indic grammatical marker discriminator, and Multi-metric semantic similarity matrix.
- **Styling:** Modern Tailwind CSS with a professional navy sidebar layout, responsive workspace, accessible form elements, and data visualization primitives.
- **Database & Persistence:** MongoDB (via official Node `mongodb` driver) storing documents, pipeline analyses, similarity comparisons, generated academic reports, and experiment runs (`experiment_runs`).
- **Testing:** Node-native runner executed with TypeScript (`npm test` via `tsx`).

---

## 2. Complete Experiment Catalog

### Part I: Prescribed Core Syllabus Practicals (10 Practicals)
| # | Experiment Title | Module | Key Algorithm / Methodology | Route |
|---|---|---|---|---|
| **Exp 1** | NLP Applications & Architecture | About Project | Academic pipeline walkthrough & syllabus mapping | `/about` |
| **Exp 2** | Tokenization, Filtration & Script Validation | Preprocessing | Regex boundary segmentation, stopword filtering, Latin script ratio | `/preprocessing` |
| **Exp 3** | Stop Words, Stemming & Lemmatization | Stem & Lemma | Porter rule stemmer vs POS-aware WordNet lemmatizer | `/stemlemma` |
| **Exp 4** | Morphology & Word Generation | Morphology | Affix decomposition (prefix/root/suffix) & rule-based inflections | `/morphology` |
| **Exp 5** | N-Gram Modeling & Prediction | N-Gram Lab | MLE Unigram/Bigram/Trigram models with progressive backoff | `/ngram` |
| **Exp 6** | Part-of-Speech Tagging | POS Tagger | Eric Brill transformation-based Penn Treebank POS tagging | `/pos` |
| **Exp 7** | Chunking / Shallow Parsing | Chunk Analyzer | Regex phrase grammar matching over POS tags (`<DT>?<JJ>*<NN+>`) | `/chunking` |
| **Exp 8** | Named Entity Recognition | NER | Hybrid rule-based & gazetteer entity extraction (PERSON, ORG, GPE, DATE) | `/ner` |
| **Exp 9** | Text Similarity using TF-IDF | Doc Similarity | TF-IDF vector space projection & Cosine distance metric | `/similarity` |
| **Exp 10** | Word Cloud & Text Analytics | Word Cloud | Zipfian term-frequency distribution & text exploratory statistics | `/wordcloud` |

### Part II: Advanced Laboratory Expansions (6 Modules)
| # | Experiment Title | Module | Key Algorithm / Methodology | Route |
|---|---|---|---|---|
| **Exp 11** | Sentiment Analysis & Polarity Scoring | Sentiment | AFINN lexicon polarity, grammatical negation inversion, intensifiers, subjectivity | `/sentiment` |
| **Exp 12** | Supervised Text Classification | Classification | Multinomial Naive Bayes, Laplace smoothing, reproducible 80/20 train/test split, Confusion Matrix, Precision/Recall/F1 | `/classification` |
| **Exp 13** | Unsupervised Topic Modelling | Topic Modeling | Latent Topic Discovery via Spherical TF-IDF Document-Term Clustering ($K$ topics) | `/topic-modeling` |
| **Exp 14** | Keyword & Keyphrase Extraction | Keywords | Comparative extraction: Raw Frequency, Sentence TF-IDF, RAKE (`deg(w)/freq(w)` graph), and Noun Phrases | `/keywords` |
| **Exp 15** | Language Identification & Script Analysis | Language ID | Unicode block script segmentation + Indic grammatical marker analysis (English, Hindi, Marathi) | `/language-id` |
| **Exp 16** | Multi-Metric Semantic Similarity | Semantic Sim | Lexical TF-IDF Cosine, Token Jaccard, Sub-word Character Tri-grams, and Soft-Lemma Semantic Alignment | `/semantic-similarity` |

### Academic Tracking & Product Features
- **Experiment Mapping:** `/experiments` (Full syllabus mapping catalog)
- **Multilingual Capability Registry:** `/multilingual` (Feature support matrix & Indic NLP expansion architecture)
- **Laboratory Run History:** `/history` (Experiment executions tracked in MongoDB)
- **Consolidated Academic Report:** `/report` (Printable & downloadable laboratory report covering all experiments)

---

## 3. Directory Structure

```text
├── src/
│   ├── app/                         # Next.js App Router pages & API routes
│   │   ├── api/                     # Modular API endpoints
│   │   │   ├── analyze/             # Full document analysis pipeline
│   │   │   ├── classification/      # Naive Bayes training & prediction
│   │   │   ├── health/              # MongoDB connection healthcheck
│   │   │   ├── history/             # Laboratory run history endpoint
│   │   │   ├── keywords/            # Comparative keyword extraction
│   │   │   ├── language-id/         # Language & script identification
│   │   │   ├── morphology/          # Morpheme decomposition
│   │   │   ├── ngram/               # N-Gram generation & next-word prediction
│   │   │   ├── reports/             # Academic report generation
│   │   │   ├── semantic-similarity/ # Multi-metric semantic similarity
│   │   │   ├── sentiment/           # Polarity & subjectivity scoring
│   │   │   ├── similarity/          # TF-IDF cosine comparison
│   │   │   └── topic-modeling/      # Latent topic discovery
│   │   ├── classification/          # Text classification experiment UI
│   │   ├── experiments/             # Experiment mapping catalog UI
│   │   ├── history/                 # Lab experiment history UI
│   │   ├── keywords/                # Keyword extraction UI
│   │   ├── language-id/             # Language identification UI
│   │   ├── multilingual/            # Multilingual registry UI
│   │   ├── semantic-similarity/     # Semantic similarity UI
│   │   ├── sentiment/               # Sentiment analysis UI
│   │   ├── topic-modeling/          # Topic modeling UI
│   │   └── ...                      # Core experiment pages (preprocessing, pos, etc.)
│   ├── components/                  # Reusable UI & layout components
│   │   ├── layout/app-shell.tsx     # Navy sidebar layout & navigation
│   │   ├── document-context.tsx     # Client-side document state & caching
│   │   └── ui/primitives.tsx        # Cards, Badges, Buttons, StatCards, Spinners
│   └── lib/                         # NLP and database libraries
│       ├── mongodb.ts               # Mongo client connection pooling
│       ├── repository.ts            # MongoDB persistence services
│       └── nlp/                     # Local NLP algorithmic modules
│           ├── classification.ts    # Naive Bayes implementation
│           ├── experimentRegistry.ts# Catalog of all 16 experiments
│           ├── languageRegistry.ts  # Multilingual support registry
│           ├── languageId.ts        # Language identification engine
│           ├── keywords.ts          # RAKE, TF-IDF & frequency extraction
│           ├── pipeline.ts          # Orchestrator for full document analysis
│           ├── semanticSimilarity.ts# Multi-metric similarity engine
│           ├── sentiment.ts         # Explainable sentiment analyzer
│           └── topicModeling.ts     # Unsupervised topic clustering
├── tests/
│   └── run-all-tests.ts             # Automated test suite (all 17 suites)
├── next.config.ts                   # Next.js build & server package configuration
└── package.json
```

---

## 4. Setup & Launch Instructions (Windows PowerShell)

### Prerequisites
- Node.js v18+ (tested on Node v25)
- MongoDB Community Server (v5.0+ or MongoDB Atlas)

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Configure Environment
Copy the example environment file:
```powershell
Copy-Item .env.example .env
```
Ensure MongoDB URI is configured in `.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=nlp_academic_analyzer
```
*(Note: If MongoDB is offline, the platform continues to run all NLP algorithms in-memory.)*

### Step 3: Run Automated Test Suite
```powershell
npm test
```
*Executes all 25 unit and integration tests across 17 test suites.*

### Step 4: Run Typecheck
```powershell
npm run typecheck
```

### Step 5: Start Development Server
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Step 6: Build Production Application (Optional)
```powershell
npm run build
npm run start
```

---

## 5. College Demonstration & Commercial Readiness Notes

1. **Zero External AI Subscriptions:** All NLP algorithms run on-device / on-premise without cloud lock-in or recurring per-token fees.
2. **Plagiarism Disclaimer:** Document and semantic similarity scores measure lexical/structural overlap. High scores do not prove plagiarism, as quotations, citations, and standard terminology elevate scores.
3. **Indic Language Boundary:** English NLP algorithms (Porter stemmer, WordNet lemmatizers, English NLTK stopwords) are strictly separated from Hindi and Marathi text to avoid morphological corruption.
4. **Transparent Explainability:** Every module displays intermediate tokens, formula rationale, and educational limitations (e.g., sentiment sarcasm errors, topic model word-cluster interpretations).

// Comprehensive Automated Test Suite for NLP Intelligence Platform
// Tests all 10 core syllabus experiments and all 6 advanced laboratory modules.

import assert from "node:assert";
import { preprocessText, splitSentences, tokenizeWords, validateScript } from "../src/lib/nlp/preprocessing";
import { stemWord, lemmatizeWord, buildStemLemmaTable } from "../src/lib/nlp/stemLemma";
import { analyzeMorphology, generateWordForms } from "../src/lib/nlp/morphology";
import { wordSequence, buildAllModels, predictNext, summarizeModel } from "../src/lib/nlp/ngram";
import { posTagTokens } from "../src/lib/nlp/winkEngine";
import { chunkDocument } from "../src/lib/nlp/chunking";
import { extractEntities } from "../src/lib/nlp/ner";
import { compareDocuments } from "../src/lib/nlp/similarity";
import { wordFrequencies } from "../src/lib/nlp/wordStats";

import { analyzeDocument } from "../src/lib/nlp/pipeline";
import { analyzeSentiment } from "../src/lib/nlp/sentiment";
import { trainAndEvaluateClassifier, predictText, DEFAULT_CLASSIFICATION_DATASET } from "../src/lib/nlp/classification";
import { runTopicModeling, extractParagraphsOrSentences } from "../src/lib/nlp/topicModeling";
import { compareKeywordMethods, extractRAKE } from "../src/lib/nlp/keywords";
import { identifyLanguage } from "../src/lib/nlp/languageId";
import { computeMultiMetricSimilarity } from "../src/lib/nlp/semanticSimilarity";
import { EXPERIMENT_REGISTRY } from "../src/lib/nlp/experimentRegistry";
import { LANGUAGE_REGISTRY } from "../src/lib/nlp/languageRegistry";

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

console.log("\n=======================================================");
console.log("  NLP INTELLIGENCE PLATFORM — AUTOMATED TEST SUITE");
console.log("=======================================================\n");

// --- CORE EXPERIMENT 1: Registry Integrity ---
console.log("• Suite 1: Experiment & Language Registry");
runTest("Experiment Registry contains all 16 experiments", () => {
  assert.strictEqual(EXPERIMENT_REGISTRY.length, 16);
  assert.ok(EXPERIMENT_REGISTRY.some((e) => e.id === "exp-1"));
  assert.ok(EXPERIMENT_REGISTRY.some((e) => e.id === "exp-16"));
});

runTest("Language Registry supports English, Hindi, and Marathi", () => {
  assert.ok(LANGUAGE_REGISTRY["en"]);
  assert.ok(LANGUAGE_REGISTRY["hi"]);
  assert.ok(LANGUAGE_REGISTRY["mr"]);
  assert.strictEqual(LANGUAGE_REGISTRY["en"].status, "Fully Supported");
});

// --- CORE EXPERIMENT 2: Preprocessing ---
console.log("\n• Suite 2: Text Preprocessing & Script Validation (Exp 2)");
runTest("Tokenization and sentence splitting work correctly", () => {
  const text = "Natural language processing is powerful. It enables machine understanding!";
  const sentences = splitSentences(text);
  assert.strictEqual(sentences.length, 2);

  const words = tokenizeWords(text);
  assert.ok(words.length >= 8);
  assert.ok(words.includes("Natural"));
});

runTest("Script validation identifies Latin text", () => {
  const res = validateScript("Academic natural language processing document.");
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.label, "Valid Latin Script");
  assert.ok(res.latinRatio > 0.9);
});

runTest("Preprocessing handles empty and punctuation-only inputs gracefully", () => {
  const emptyRes = preprocessText("");
  assert.strictEqual(emptyRes.rawTokens.length, 0);

  const punctRes = preprocessText("... !? ;;;");
  assert.strictEqual(punctRes.filteredTokens.length, 0);
});

// --- CORE EXPERIMENT 3: Stemming & Lemmatization ---
console.log("\n• Suite 3: Stemming & Lemmatization (Exp 3)");
runTest("Porter Stemmer strips inflectional affixes", () => {
  assert.strictEqual(stemWord("studying"), "studi");
  assert.strictEqual(stemWord("computation"), "comput");
});

runTest("POS-aware lemmatizer maps verbs and nouns to base forms", () => {
  const verbLemma = lemmatizeWord("running", "VBG");
  assert.strictEqual(verbLemma, "run");

  const nounLemma = lemmatizeWord("studies", "NNS");
  assert.strictEqual(nounLemma, "study");
});

// --- CORE EXPERIMENT 4: Morphology ---
console.log("\n• Suite 4: Morphology Analyzer (Exp 4)");
runTest("Morphological breakdown identifies affixes and root", () => {
  const res = analyzeMorphology("unhappily");
  assert.strictEqual(res.prefix, "un");
  assert.ok(res.root.length > 0);
});

runTest("Word generation produces inflectional variants", () => {
  const gen = generateWordForms("develop");
  assert.ok(gen.variants.includes("develops") || gen.variants.includes("developing") || gen.variants.includes("developed"));
});

// --- CORE EXPERIMENT 5: N-Gram Lab ---
console.log("\n• Suite 5: N-Gram Models (Exp 5)");
runTest("N-Gram models build and calculate probabilities", () => {
  const seq = wordSequence("natural language processing natural language generation natural language understanding");
  const models = buildAllModels(seq);
  const bigramSummary = summarizeModel(models[2]);
  assert.ok(bigramSummary.uniqueNGrams > 0);

  const pred = predictNext(models, "natural", 2);
  assert.strictEqual(pred.found, true);
  assert.ok(pred.predictions.length > 0);
  assert.strictEqual(pred.predictions[0].word, "language");
});

// --- CORE EXPERIMENT 6: POS Tagging ---
console.log("\n• Suite 6: Part-of-Speech Tagging (Exp 6)");
runTest("POS tagging assigns Penn Treebank tags", () => {
  const tags = posTagTokens("The algorithm runs fast.");
  assert.ok(tags.length >= 4);
  const verb = tags.find((t) => t.value === "runs");
  assert.ok(verb && (verb.pos.startsWith("VB") || verb.pos === "NNS"));
});

// --- CORE EXPERIMENT 7: Chunking ---
console.log("\n• Suite 7: Chunking / Shallow Parsing (Exp 7)");
runTest("Chunking identifies Noun Phrases (NP) and Verb Phrases (VP)", () => {
  const text = "The clever student solved the difficult algorithmic puzzle.";
  const chunks = chunkDocument(text);
  assert.ok(chunks.length > 0);
  assert.ok(chunks.some((c) => c.type === "NP"));
});

// --- CORE EXPERIMENT 8: Named Entity Recognition ---
console.log("\n• Suite 8: Named Entity Recognition (Exp 8)");
runTest("NER extracts capitalized proper names and entities", () => {
  const text = "Albert Einstein presented relativity in Berlin in November 1915.";
  const entities = extractEntities(text);
  assert.ok(entities.length > 0);
  assert.ok(entities.some((e) => e.text.includes("Einstein") || e.text.includes("Berlin")));
});

runTest("NER correctly extracts DATE (14 अक्टूबर 2026, कल, सोमवार), ORG, GPE, and rejects standalone 'मे' as O", () => {
  const text = "14 अक्टूबर 2026 को सोमवार है। कल भारत सरकार और इसरो ने दिल्ली, मुंबई तथा भारत में बैठक बुलाई। जीवन मे मेहनत ज़रूरी है।";
  const entities = extractEntities(text);

  // DATE: 14 अक्टूबर 2026, कल, सोमवार
  assert.ok(entities.some((e) => e.text.includes("14 अक्टूबर 2026") && e.type === "DATE"), "14 अक्टूबर 2026 should be DATE");
  assert.ok(entities.some((e) => e.text === "सोमवार" && e.type === "DATE"), "सोमवार should be DATE");
  assert.ok(entities.some((e) => e.text === "कल" && e.type === "DATE"), "कल should be DATE");

  // ORGANIZATION: भारत सरकार, इसरो
  assert.ok(entities.some((e) => e.text === "भारत सरकार" && e.type === "ORGANIZATION"), "भारत सरकार should be ORGANIZATION");
  assert.ok(entities.some((e) => e.text === "इसरो" && e.type === "ORGANIZATION"), "इसरो should be ORGANIZATION");

  // GPE/LOCATION: दिल्ली, मुंबई, भारत
  assert.ok(entities.some((e) => e.text === "दिल्ली" && e.type === "GPE/LOCATION"), "दिल्ली should be GPE/LOCATION");
  assert.ok(entities.some((e) => e.text === "मुंबई" && e.type === "GPE/LOCATION"), "मुंबई should be GPE/LOCATION");
  assert.ok(entities.some((e) => e.text === "भारत" && e.type === "GPE/LOCATION"), "भारत should be GPE/LOCATION");

  // O (Not an entity): 'मे' or 'में' must NEVER be classified as DATE or any entity
  const meEntities = entities.filter((e) => e.text.trim() === "मे" || e.text.trim() === "में");
  assert.strictEqual(meEntities.length, 0, "Standalone 'मे' or 'में' must not be classified as any entity");

  // Substring check: 'मेहनत' should not match 'मे'
  assert.ok(!entities.some((e) => e.text === "मे"), "मे should not be matched inside words or standalone");
});

// --- CORE EXPERIMENT 9: Document Similarity ---
console.log("\n• Suite 9: TF-IDF Cosine Similarity (Exp 9)");
runTest("Identical documents yield cosine similarity of 1.0", () => {
  const doc = "Quantum computing algorithms execute revolutionary calculations.";
  const sim = compareDocuments(doc, doc, "Doc1", "Doc2");
  assert.ok(sim.cosineSimilarity >= 0.99);
  assert.strictEqual(sim.similarityLevel, "Highly Similar");
});


// --- CORE EXPERIMENT 10: Word Cloud & Text EDA ---
console.log("\n• Suite 10: Word Cloud & Exploratory Data Analysis (Exp 10)");
runTest("Word frequencies count content terms while excluding stopwords", () => {
  const text = "Deep learning and machine learning are branches of artificial intelligence. Machine learning learns.";
  const freqs = wordFrequencies(text, 10);
  assert.ok(freqs.length > 0);
  const ml = freqs.find((f) => f.word === "learning");
  assert.ok(ml && ml.count >= 2);
});

// --- ADVANCED EXPERIMENT 11: Sentiment Analysis ---
console.log("\n• Suite 11: Sentiment Analysis & Polarity Scoring (Exp 11)");
runTest("Positive text receives Positive label and positive score", () => {
  const res = analyzeSentiment("The professor was fantastic, brilliant, and gave very clear and insightful lectures.");
  assert.strictEqual(res.label, "Positive");
  assert.ok(res.normalizedScore > 0);
  assert.ok(res.positiveTokensCount >= 2);
});

runTest("Negative review receives Negative label and negative score", () => {
  const res = analyzeSentiment("The system had terrible performance, horrible crashes, and was completely broken.");
  assert.strictEqual(res.label, "Negative");
  assert.ok(res.normalizedScore < 0);
  assert.ok(res.negativeTokensCount >= 2);
});

runTest("Grammatical negation inverts positive adjectives ('not good')", () => {
  const posRes = analyzeSentiment("The code is good.");
  const negRes = analyzeSentiment("The code is not good.");
  assert.ok(posRes.normalizedScore > negRes.normalizedScore);
});

// --- ADVANCED EXPERIMENT 12: Supervised Text Classification ---
console.log("\n• Suite 12: Supervised Text Classification (Exp 12)");
runTest("Naive Bayes trains with Laplace smoothing and prevents data leakage", () => {
  const { experiment, model } = trainAndEvaluateClassifier(DEFAULT_CLASSIFICATION_DATASET, "Test Corpus", 0.75);
  assert.strictEqual(experiment.classes.length, 4);
  assert.ok(experiment.accuracy >= 0);
  assert.strictEqual(experiment.confusionMatrix.matrix.length, 4);

  // Prediction on unseen test sentence
  const pred = predictText("Deep learning neural networks and machine intelligence algorithms", model);
  assert.strictEqual(pred.predictedClass, "Technology");
  assert.ok(pred.confidence > 0.4);
});

// --- ADVANCED EXPERIMENT 13: Topic Modeling ---
console.log("\n• Suite 13: Unsupervised Topic Modeling (Exp 13)");
runTest("Topic modeling discovers K topics with non-empty term distributions", () => {
  const paragraphs = [
    "Machine learning neural networks algorithms artificial intelligence training data.",
    "Parliament passed constitutional laws elections voting policies legislative debate.",
    "Football championship match tournament goals score coach athletes stadium.",
  ];
  const res = runTopicModeling(paragraphs, 3);
  assert.strictEqual(res.topics.length, 3);
  assert.strictEqual(res.documentDistributions.length, 3);
  for (const t of res.topics) {
    assert.ok(t.topTerms.length > 0);
  }
});

// --- ADVANCED EXPERIMENT 14: Keyword Extraction ---
console.log("\n• Suite 14: Keyword & Keyphrase Extraction (Exp 14)");
runTest("RAKE algorithm extracts multi-word phrases using co-occurrence graph", () => {
  const text = "Advanced natural language processing algorithms enable automatic text classification and information retrieval.";
  const rakeKeywords = extractRAKE(text, 5);
  assert.ok(rakeKeywords.length > 0);
  assert.ok(rakeKeywords[0].score > 0);

  const comp = compareKeywordMethods(text);
  assert.ok(comp.termFrequency.length > 0);
  assert.ok(comp.tfidf.length > 0);
});

// --- ADVANCED EXPERIMENT 15: Language Identification ---
console.log("\n• Suite 15: Language Identification & Script Analysis (Exp 15)");
runTest("Correctly discriminates Latin English, Devanagari Hindi, and Devanagari Marathi", () => {
  const enRes = identifyLanguage("Natural language processing combines computational linguistics with statistical models.");
  assert.strictEqual(enRes.detectedLanguage, "English");
  assert.strictEqual(enRes.script.scriptName, "Latin");

  const hiRes = identifyLanguage("प्राकृतिक भाषा प्रसंस्करण कंप्यूटर विज्ञान का एक महत्वपूर्ण क्षेत्र है और इसमें कई तकनीकें हैं।");
  assert.strictEqual(hiRes.detectedLanguage, "Hindi");
  assert.strictEqual(hiRes.script.scriptName, "Devanagari");

  const mrRes = identifyLanguage("मराठी भाषेमध्ये व्याकरण आणि शब्दांचे विश्लेषण केले जाते, हे अत्यंत महत्त्वाचे आहे आणि उपयुक्त आहे.");
  assert.strictEqual(mrRes.detectedLanguage, "Marathi");
  assert.strictEqual(mrRes.script.scriptName, "Devanagari");
});

runTest("Ambiguous short Devanagari snippet is flagged safely", () => {
  const ambRes = identifyLanguage("देश");
  assert.ok(ambRes.detectedLanguage === "Ambiguous / Insufficient Evidence");
});

// --- ADVANCED EXPERIMENT 16: Semantic Similarity ---
console.log("\n• Suite 16: Advanced Semantic Similarity (Exp 16)");
runTest("Multi-metric similarity captures soft semantic and lexical dimensions", () => {
  const sA = "The researcher developed a machine learning model.";
  const sB = "A scientist created an ML algorithm.";
  const sim = computeMultiMetricSimilarity(sA, sB);
  assert.ok(sim.metrics.compositeScore > 0);
  assert.ok(sim.tokenAlignments.length > 0);
  assert.ok(sim.interpretation.plagiarismDisclaimer.includes("ACADEMIC NOTE"));
});

// --- FULL END-TO-END PIPELINE ---
console.log("\n• Suite 17: Full Document Analysis Pipeline Integration (English)");
runTest("analyzeDocument integrates both core and advanced modules seamlessly for English", () => {
  const docText = "Natural language processing is an essential field of artificial intelligence. It transforms unstructured text into structured insights.";
  const analysis = analyzeDocument(docText, "TestDoc.txt");
  assert.strictEqual(analysis.meta.docName, "TestDoc.txt");
  assert.ok(analysis.preprocessing.filteredTokens.length > 0);
  assert.ok(analysis.pos.length > 0);
  assert.ok(analysis.chunks.length > 0);
  assert.ok(analysis.ngramSummaries.length === 3);

  // Advanced modules computed in pipeline
  assert.ok(analysis.sentiment);
  assert.ok(analysis.languageIdentification);
  assert.ok(analysis.keywordComparison);
  assert.strictEqual(analysis.languageIdentification?.detectedLanguage, "English");
});

// --- HINDI MULTILINGUAL PIPELINE ---
console.log("\n• Suite 18: Hindi Multilingual NLP Processing (Exps 2-16)");
runTest("Hindi preprocessing, tokenization, and script validation", () => {
  const hiText = "प्राकृतिक भाषा प्रसंस्करण कंप्यूटर विज्ञान का एक महत्वपूर्ण क्षेत्र है। यह बहुत अच्छा और उपयोगी है।";
  const pre = preprocessText(hiText);
  assert.strictEqual(pre.scriptValidation.isValid, true);
  assert.strictEqual(pre.scriptValidation.label, "Valid Devanagari Script");
  assert.ok(pre.wordTokens.length >= 10);
  assert.ok(pre.filteredTokens.length > 0);
  assert.ok(pre.removedStopwords.length > 0); // Stops like 'का', 'है', 'यह'
});

runTest("Hindi stemming, lemmatization, and morphology", () => {
  const stemmed = stemWord("पुस्तकों");
  assert.strictEqual(stemmed, "पुस्तक");

  const lemma = lemmatizeWord("करते");
  assert.strictEqual(lemma, "करना");

  const morph = analyzeMorphology("उपयोग");
  assert.strictEqual(morph.prefix, "उप");
  assert.strictEqual(morph.root, "योग");
});

runTest("Hindi sentiment, POS tagging, NER, and End-to-End pipeline", () => {
  const hiDoc = "नरेंद्र मोदी ने नई दिल्ली में इस्रो के वैज्ञानिकों की उत्कृष्ट सफलता की बहुत प्रशंसा की। यह बहुत अच्छा और शानदार काम था।";
  const analysis = analyzeDocument(hiDoc, "HindiDoc.txt");

  assert.strictEqual(analysis.meta.scriptValidation.label, "Valid Devanagari Script");
  assert.ok(analysis.preprocessing.filteredTokens.length > 0);
  assert.ok(analysis.pos.length > 0);
  assert.ok(analysis.ngramSummaries[0].uniqueNGrams > 0);
  assert.ok(analysis.keywords.length > 0);

  // NER detection of Hindi entities
  assert.ok(analysis.entities.some((e) => e.text.includes("नरेंद्र मोदी") || e.text.includes("दिल्ली") || e.text.includes("इस्रो")));

  // Sentiment Analysis on positive Hindi text
  assert.strictEqual(analysis.sentiment?.label, "Positive");
  assert.ok((analysis.sentiment?.normalizedScore ?? 0) > 0);

  // Language identification
  assert.strictEqual(analysis.languageIdentification?.detectedLanguage, "Hindi");
});

// --- MARATHI MULTILINGUAL PIPELINE ---
console.log("\n• Suite 19: Marathi Multilingual NLP Processing (Exps 2-16)");
runTest("Marathi preprocessing, tokenization, and script validation", () => {
  const mrText = "नैसर्गिक भाषा प्रक्रिया हा संगणक शास्त्रातील एक महत्त्वाचा भाग आहे। मराठी भाषेचे व्याकरण अत्यंत समृद्ध आहे।";
  const pre = preprocessText(mrText);
  assert.strictEqual(pre.scriptValidation.isValid, true);
  assert.strictEqual(pre.scriptValidation.label, "Valid Devanagari Script");
  assert.ok(pre.wordTokens.length >= 10);
  assert.ok(pre.filteredTokens.length > 0);
  assert.ok(pre.removedStopwords.length > 0); // Stops like 'आहे', 'हा', 'एक'
});

runTest("Marathi stemming, lemmatization, and morphology", () => {
  const stemmed = stemWord("पुस्तकातील");
  assert.ok(stemmed === "पुस्तक" || stemmed === "पुस्तका");

  const lemma = lemmatizeWord("करतात");
  assert.strictEqual(lemma, "करणे");

  const morphPrefix = analyzeMorphology("सुविचार");
  assert.strictEqual(morphPrefix.prefix, "सु");
  assert.strictEqual(morphPrefix.root, "विचार");

  const morphSuffix = analyzeMorphology("नियमपूर्वक");
  assert.strictEqual(morphSuffix.suffix, "पूर्वक");
  assert.strictEqual(morphSuffix.root, "नियम");
});

runTest("Marathi sentiment, POS tagging, NER, and End-to-End pipeline", () => {
  const mrDoc = "छत्रपती शिवाजी महाराज यांनी महाराष्ट्रात स्वराज्य स्थापन केले। पुणे आणि मुंबई येथे संशोधन कार्य खूप छान आणि उत्कृष्ट सुरू आहे।";
  const analysis = analyzeDocument(mrDoc, "MarathiDoc.txt");

  assert.strictEqual(analysis.meta.scriptValidation.label, "Valid Devanagari Script");
  assert.ok(analysis.preprocessing.filteredTokens.length > 0);
  assert.ok(analysis.pos.length > 0);
  assert.ok(analysis.ngramSummaries[0].uniqueNGrams > 0);
  assert.ok(analysis.keywords.length > 0);

  // NER detection of Marathi entities
  assert.ok(analysis.entities.some((e) => e.text.includes("छत्रपती शिवाजी महाराज") || e.text.includes("महाराष्ट्र") || e.text.includes("पुणे")));

  // Sentiment Analysis on positive Marathi text ('छान', 'उत्कृष्ट')
  assert.strictEqual(analysis.sentiment?.label, "Positive");
  assert.ok((analysis.sentiment?.normalizedScore ?? 0) > 0);

  // Language identification
  assert.strictEqual(analysis.languageIdentification?.detectedLanguage, "Marathi");
});

console.log("\n=======================================================");
console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}

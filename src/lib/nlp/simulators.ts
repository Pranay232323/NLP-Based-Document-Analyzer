// Interactive Step-by-Step Simulation Generators for NLP Experiments
import type { SimulationStep } from "@/components/ui/step-simulator";
import { tokenizeWords } from "./preprocessing";
import { isStopword } from "./stopwords";
import { stemWord, lemmatizeWord } from "./stemLemma";
import { posTagTokens } from "./winkEngine";
import { describeTag } from "./posTags";
import { analyzeMorphology, generateWordForms } from "./morphology";

// 0. Word Morphology Decomposition Simulator
export function generateMorphologySimulation(wordRaw: string): { tokens: string[]; steps: SimulationStep[] } {
  const word = wordRaw.trim().toLowerCase() || "unhappily";
  const breakdown = analyzeMorphology(word);
  const gen = generateWordForms(breakdown.root);

  const tokens = [
    breakdown.prefix ? `[${breakdown.prefix}-]` : "[No-Prefix]",
    `[Root: ${breakdown.root}]`,
    breakdown.suffix ? `[-${breakdown.suffix}]` : "[No-Suffix]",
  ];

  const steps: SimulationStep[] = [
    {
      tokenIndex: 0,
      label: `Input Surface Word: "${wordRaw}"`,
      ruleApplied: `Initialize Morphological Scanner Buffer`,
      explanation: `Loaded target word into the morphological analyzer to discover constituent morphemes (bound affixes and free root).`,
      stateSnapshot: {
        SurfaceWord: wordRaw,
        LowerCase: word,
        Length: `${word.length} characters`,
      },
      badge: { text: "Input Buffer", tone: "slate" },
      accumulatedPreview: [`Surface: ${wordRaw}`],
    },
    {
      tokenIndex: 0,
      label: breakdown.prefix ? `Prefix Detection: "${breakdown.prefix}-"` : `Prefix Scan: No matching prefix`,
      ruleApplied: breakdown.prefix
        ? `Matched derivational prefix in lexicon (e.g. anti-, un-, re-, अति-)`
        : `No registered derivational prefix found at word head`,
      explanation: breakdown.prefix
        ? `Identified prefix '${breakdown.prefix}'. Stripping it yields the intermediate stem '${word.slice(breakdown.prefix.length)}'.`
        : `Word begins directly with the root morpheme.`,
      stateSnapshot: {
        PrefixFound: breakdown.prefix ? `"${breakdown.prefix}-"` : "None",
        RemainingHead: breakdown.prefix ? word.slice(breakdown.prefix.length) : word,
      },
      badge: { text: breakdown.prefix ? "Prefix Detected" : "No Prefix", tone: breakdown.prefix ? "indigo" : "slate" },
      accumulatedPreview: breakdown.prefix ? [`Prefix: ${breakdown.prefix}`] : [],
    },
    {
      tokenIndex: 2,
      label: breakdown.suffix ? `Suffix Stripping: "-${breakdown.suffix}"` : `Suffix Scan: No matching suffix`,
      ruleApplied: breakdown.suffix
        ? `Matched inflectional/derivational suffix in lexicon (e.g. -tion, -ing, -ly, -दार)`
        : `No matching suffix found at word tail`,
      explanation: breakdown.suffix
        ? `Identified suffix '-${breakdown.suffix}'. Stripping it isolates the morphological base.`
        : `No suffix stripped.`,
      stateSnapshot: {
        SuffixFound: breakdown.suffix ? `"-${breakdown.suffix}"` : "None",
      },
      badge: { text: breakdown.suffix ? "Suffix Stripped" : "No Suffix", tone: breakdown.suffix ? "amber" : "slate" },
      accumulatedPreview: [
        ...(breakdown.prefix ? [`Prefix: ${breakdown.prefix}`] : []),
        ...(breakdown.suffix ? [`Suffix: ${breakdown.suffix}`] : []),
      ],
    },
    {
      tokenIndex: 1,
      label: `Spelling Normalization & Root Isolation: "${breakdown.root}"`,
      ruleApplied: `Morphophonemic orthography adjustment (e.g. i -> y, de-doubling consonants)`,
      explanation: `After peeling bound affixes, the morphological core '${breakdown.root}' is normalized to its canonical dictionary headword.`,
      stateSnapshot: {
        IsolatedRoot: breakdown.root,
        Prefix: breakdown.prefix ?? "None",
        Suffix: breakdown.suffix ?? "None",
        MorphologyNotes: breakdown.notes,
      },
      badge: { text: `Root: ${breakdown.root}`, tone: "emerald" },
      accumulatedPreview: [
        ...(breakdown.prefix ? [`[${breakdown.prefix}-]`] : []),
        `[Root: ${breakdown.root}]`,
        ...(breakdown.suffix ? [`[-${breakdown.suffix}]`] : []),
      ],
    },
    {
      tokenIndex: 1,
      label: `Word Paradigm Generation: ${gen.variants.length} Variants`,
      ruleApplied: `Synthesize productive grammatical inflections over root "${gen.base}"`,
      explanation: `Productive morphological rules generate inflectional and derivational variants (plurals, tenses, degrees of comparison, agentive forms) from the base root.`,
      stateSnapshot: {
        BaseRoot: gen.base,
        GeneratedCount: `${gen.variants.length} word forms`,
        VariantsList: gen.variants.join(", "),
      },
      badge: { text: "Inflectional Variants", tone: "violet" },
      accumulatedPreview: gen.variants,
    },
  ];

  return { tokens, steps };
}


// 1. Preprocessing & Stopwords Simulator
export function generatePreprocessingSimulation(text: string): { tokens: string[]; steps: SimulationStep[] } {
  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  const cleanTokens: string[] = [];
  const steps: SimulationStep[] = [];

  rawWords.forEach((word, idx) => {
    const stripped = word.replace(/^[^\w\u0900-\u097F]+|[^\w\u0900-\u097F]+$/g, "");
    const lower = stripped.toLowerCase();
    const isStop = isStopword(lower);
    const isPunctOnly = stripped.length === 0;

    if (isPunctOnly) {
      steps.push({
        tokenIndex: idx,
        label: `Filter Punctuation: "${word}"`,
        ruleApplied: `RegExp /[^\\w]/ -> Pure delimiter without alpha content`,
        explanation: `Punctuation marks carry syntactic boundaries but do not represent lexical content tokens in bag-of-words or vector space representations.`,
        stateSnapshot: {
          RawWord: word,
          Stripped: "(empty)",
          Action: "Discarded",
        },
        badge: { text: "Punctuation Delimiter", tone: "slate" },
        accumulatedPreview: [...cleanTokens],
      });
    } else if (isStop) {
      steps.push({
        tokenIndex: idx,
        label: `Stopword Evaluation: "${stripped}"`,
        ruleApplied: `StopwordsDictionary.has("${lower}") === true`,
        explanation: `"${stripped}" is a grammatical function word (pronoun, preposition, or auxiliary). In standard text indexing and keyword extraction, high-frequency stopwords are removed to boost informative content terms.`,
        stateSnapshot: {
          Token: stripped,
          LowerCase: lower,
          IsStopword: "YES",
          Action: "Filtered Out",
        },
        badge: { text: "Stopword Filtered", tone: "amber" },
        accumulatedPreview: [...cleanTokens],
      });
    } else {
      cleanTokens.push(stripped);
      steps.push({
        tokenIndex: idx,
        label: `Content Token Accepted: "${stripped}"`,
        ruleApplied: `Token matches alpha boundary and passes stopword filter`,
        explanation: `"${stripped}" carries substantive semantic meaning and is retained in the preprocessed corpus vocabulary.`,
        stateSnapshot: {
          Token: stripped,
          LowerCase: lower,
          IsStopword: "NO",
          Action: "Retained in Token Stream",
        },
        badge: { text: "Accepted Token", tone: "emerald" },
        accumulatedPreview: [...cleanTokens],
      });
    }
  });

  return { tokens: rawWords, steps };
}

// 2. Stemming & Lemmatization Simulator
export function generateStemLemmaSimulation(text: string): { tokens: string[]; steps: SimulationStep[] } {
  const tokens = tokenizeWords(text).slice(0, 16);
  const accumulatedStems: string[] = [];
  const accumulatedLemmas: string[] = [];

  const steps: SimulationStep[] = tokens.map((w, idx) => {
    const stem = stemWord(w);
    const lemma = lemmatizeWord(w);
    const diverges = stem.toLowerCase() !== lemma.toLowerCase();
    accumulatedStems.push(stem);
    accumulatedLemmas.push(lemma);

    let rule = "Rule lookup: ";
    let explanation = "";

    if (/ing$/i.test(w)) {
      rule += "Porter Step 1b: Strips inflectional progressive suffix -ing";
      explanation = `Porter's rule strips the productive English suffix '-ing'. The lemmatizer consults lexical dictionary headwords to resolve the base verb.`;
    } else if (/ed$/i.test(w)) {
      rule += "Porter Step 1b: Strips regular past tense suffix -ed";
      explanation = `Stripping past-tense marker '-ed' maps regular verbs back to their root morpheme.`;
    } else if (/ies$/i.test(w)) {
      rule += "Porter Step 1a: Maps plural -ies to -i (e.g. universities -> universi)";
      explanation = `The stemmer applies algorithmic transformation (-ies -> -i), often yielding a non-dictionary stem. The lemmatizer resolves to valid dictionary entry ending in -y.`;
    } else if (/s$/i.test(w) && !/ss$/i.test(w)) {
      rule += "Porter Step 1a: Strips plural/third-person suffix -s";
      explanation = `Removes singular/plural inflectional variation.`;
    } else {
      rule += "Root condition: Suffix stripping rules unapplicable or below measure length";
      explanation = `No active suffix rules match this token, so the word remains at its base morphological root.`;
    }

    return {
      tokenIndex: idx,
      label: `Morphological Reduction: "${w}"`,
      ruleApplied: rule,
      explanation: `${explanation} ${diverges ? "NOTICE: Stem and Lemma diverge here! Stemming is algorithmic heuristic stripping; lemmatization ensures valid dictionary headwords." : "Stem and lemma match for this word."}`,
      stateSnapshot: {
        SurfaceWord: w,
        PorterStem: stem,
        DictionaryLemma: lemma,
        Divergence: diverges ? "DIVERGENT (Stem != Lemma)" : "IDENTICAL",
      },
      badge: {
        text: diverges ? "Stem != Lemma" : "Stem == Lemma",
        tone: diverges ? "rose" : "emerald",
      },
      accumulatedPreview: accumulatedLemmas.map((l, i) => `${tokens[i]} -> ${l}`),
    };
  });

  return { tokens, steps };
}

// 3. N-Gram Sliding Window Simulator
export function generateNGramSimulation(text: string, n: number = 2): { tokens: string[]; steps: SimulationStep[] } {
  const tokens = tokenizeWords(text).slice(0, 14);
  const steps: SimulationStep[] = [];
  const accumulatedNGrams: string[] = [];
  const ngramCounts: Record<string, number> = {};

  if (tokens.length < n) {
    return { tokens, steps: [] };
  }

  for (let i = 0; i <= tokens.length - n; i++) {
    const windowTokens = tokens.slice(i, i + n);
    const ngramStr = windowTokens.join(" ");
    ngramCounts[ngramStr] = (ngramCounts[ngramStr] || 0) + 1;
    accumulatedNGrams.push(`"${ngramStr}"`);

    const windowIndices: number[] = [];
    for (let k = 0; k < n; k++) windowIndices.push(i + k);

    const prefix = windowTokens.slice(0, n - 1).join(" ");
    const nextWord = windowTokens[n - 1];

    steps.push({
      tokenIndex: i,
      highlightIndices: windowIndices,
      label: `Slide Window [${i}..${i + n - 1}]: "${ngramStr}"`,
      ruleApplied: `Window size N=${n}: P("${nextWord}" | "${prefix}") = Count("${ngramStr}") / Count("${prefix}")`,
      explanation: `The N-Gram sliding window moves by 1 token position. It captures the local Markov context: predicting word '${nextWord}' given the preceding history '${prefix}'.`,
      stateSnapshot: {
        SlidingWindow: `[ ${windowTokens.join(" | ")} ]`,
        HistoryPrefix: prefix || "(None / Unigram)",
        TargetWord: nextWord,
        FrequencyCount: `${ngramCounts[ngramStr]} occurrence(s)`,
      },
      badge: { text: `N=${n} (${n === 2 ? "Bigram" : n === 3 ? "Trigram" : "N-Gram"})`, tone: "indigo" },
      accumulatedPreview: [...accumulatedNGrams],
    });
  }

  return { tokens, steps };
}

// 4. POS Tagging Simulator
export function generatePOSTaggingSimulation(text: string): { tokens: string[]; steps: SimulationStep[] } {
  const tagged = posTagTokens(text).slice(0, 16);
  const words = tagged.map((t) => t.value);
  const steps: SimulationStep[] = [];
  const accumulatedTags: string[] = [];

  tagged.forEach((item, idx) => {
    accumulatedTags.push(`${item.value}/${item.pos}`);
    const desc = describeTag(item.pos);

    const isNoun = item.pos.startsWith("NN");
    const isVerb = item.pos.startsWith("VB");
    const isAdj = item.pos.startsWith("JJ");
    const isAdv = item.pos.startsWith("RB");
    const isPronoun = item.pos.startsWith("PR");

    let explanation = `Assigned Penn Treebank tag <${item.pos}>: ${desc}.`;
    if (isNoun) {
      explanation += " Nouns denote entities, concepts, or substances and typically serve as grammatical subjects or objects.";
    } else if (isVerb) {
      explanation += " Verbs express actions, occurrences, or states of being and anchor verb phrases.";
    } else if (isAdj) {
      explanation += " Adjectives modify and qualify nominal heads in noun phrases.";
    } else if (isAdv) {
      explanation += " Adverbs modify verbs, adjectives, or entire clauses.";
    } else if (isPronoun) {
      explanation += " Pronouns stand in for previously established nominal referents.";
    }

    const badgeTone: "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet" =
      isNoun ? "indigo" : isVerb ? "amber" : isAdj ? "violet" : isAdv ? "sky" : "emerald";

    steps.push({
      tokenIndex: idx,
      label: `Tag Token #${idx + 1}: "${item.value}" -> <${item.pos}>`,
      ruleApplied: `Penn Treebank POS Classification: <${item.pos}>`,
      explanation,
      stateSnapshot: {
        Token: item.value,
        AssignedTag: item.pos,
        SyntacticCategory: desc,
        PriorContext: idx > 0 ? `${words[idx - 1]} / ${tagged[idx - 1]?.pos}` : "<s> (Sentence Start)",
      },
      badge: { text: `<${item.pos}> ${desc.slice(0, 14)}`, tone: badgeTone },
      accumulatedPreview: [...accumulatedTags],
    });
  });

  return { tokens: words, steps };
}

// 5. Chunking & Shallow Parsing Simulator
export function generateChunkingSimulation(text: string): { tokens: string[]; steps: SimulationStep[] } {
  const tagged = posTagTokens(text).slice(0, 16);
  const words = tagged.map((t) => t.value);
  const steps: SimulationStep[] = [];
  const accumulatedChunks: string[] = [];

  // Group into simple noun phrases <DT>? <JJ>* <NN+> and verb phrases <VB+>
  let i = 0;
  while (i < tagged.length) {
    const current = tagged[i];

    // Check Noun Phrase (NP): Determiner? Adjective* Noun+
    if (current.pos.startsWith("DT") || current.pos.startsWith("JJ") || current.pos.startsWith("NN") || current.pos.startsWith("PRP")) {
      const chunkWords: string[] = [];
      const chunkIndices: number[] = [];
      let j = i;
      while (j < tagged.length && (tagged[j].pos.startsWith("DT") || tagged[j].pos.startsWith("JJ") || tagged[j].pos.startsWith("NN") || tagged[j].pos.startsWith("PRP") || tagged[j].pos.startsWith("CD"))) {
        chunkWords.push(tagged[j].value);
        chunkIndices.push(j);
        j++;
      }
      const phrase = chunkWords.join(" ");
      accumulatedChunks.push(`[NP ${phrase}]`);

      steps.push({
        tokenIndex: i,
        highlightIndices: chunkIndices,
        label: `Noun Phrase [NP]: "${phrase}"`,
        ruleApplied: `CFG Rule: NP -> <DT>? <JJ>* <NN+> (Spans tokens ${i}..${j - 1})`,
        explanation: `The parser matches contiguous nominal elements (determiners, adjectives, and nouns) to form a cohesive Noun Phrase chunk.`,
        stateSnapshot: {
          ChunkType: "Noun Phrase (NP)",
          SpannedTokens: phrase,
          GrammarPattern: chunkIndices.map((idx) => tagged[idx].pos).join(" + "),
        },
        badge: { text: "[NP] Noun Phrase", tone: "indigo" },
        accumulatedPreview: [...accumulatedChunks],
      });
      i = j;
    } else if (current.pos.startsWith("VB") || current.pos.startsWith("MD")) {
      // Verb Phrase (VP)
      const chunkWords: string[] = [];
      const chunkIndices: number[] = [];
      let j = i;
      while (j < tagged.length && (tagged[j].pos.startsWith("VB") || tagged[j].pos.startsWith("MD") || tagged[j].pos.startsWith("RB"))) {
        chunkWords.push(tagged[j].value);
        chunkIndices.push(j);
        j++;
      }
      const phrase = chunkWords.join(" ");
      accumulatedChunks.push(`[VP ${phrase}]`);

      steps.push({
        tokenIndex: i,
        highlightIndices: chunkIndices,
        label: `Verb Phrase [VP]: "${phrase}"`,
        ruleApplied: `CFG Rule: VP -> <MD>? <RB>* <VB+> (Spans tokens ${i}..${j - 1})`,
        explanation: `Matches verbal heads and associated modals or adverbs into a Verb Phrase predicate chunk.`,
        stateSnapshot: {
          ChunkType: "Verb Phrase (VP)",
          SpannedTokens: phrase,
          GrammarPattern: chunkIndices.map((idx) => tagged[idx].pos).join(" + "),
        },
        badge: { text: "[VP] Verb Phrase", tone: "amber" },
        accumulatedPreview: [...accumulatedChunks],
      });
      i = j;
    } else {
      // Standalone token (preposition, punctuation, conjunction)
      steps.push({
        tokenIndex: i,
        label: `Delimiting Token: "${current.value}"`,
        ruleApplied: `Token tag <${current.pos}> serves as boundary delimiter`,
        explanation: `Prepositions or coordinating conjunctions delimit phrase boundaries without belonging to core NP or VP heads.`,
        stateSnapshot: {
          Token: current.value,
          Tag: current.pos,
          Role: "Phrase Boundary Delimiter",
        },
        badge: { text: "Boundary", tone: "slate" },
        accumulatedPreview: [...accumulatedChunks],
      });
      i++;
    }
  }

  return { tokens: words, steps };
}

// 6. Named Entity Recognition (NER) Simulator
export function generateNERSimulation(text: string): { tokens: string[]; steps: SimulationStep[] } {
  const words = tokenizeWords(text).slice(0, 16);
  const steps: SimulationStep[] = [];
  const accumulatedEntities: string[] = [];

  // NER Heuristics with strict rule enforcement (e.g. में / मे is NEVER DATE, classified as O)
  words.forEach((w, idx) => {
    const isCapitalized = /^[A-Z][a-z]+$/.test(w) && idx > 0;
    const isAcronym = /^[A-Z]{2,}$/.test(w);
    const isHindiDate = /^(कल|सोमवार|मंगलवार|बुधवार|गुरुवार|शुक्रवार|शनिवार|रविवार|जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर)$/.test(w);
    const isHindiOrg = /^(इसरो|डीआरडीओ|संसद|मंत्रालय|आयोग|सरकार)$/.test(w);
    const isHindiGpe = /^(भारत|दिल्ली|मुंबई|कोलकाता|चेन्नई|पुणे|नागपुर|राजस्थान)$/.test(w);
    const isPostpositionOrFragment = /^(मे|में|का|के|की|से|को|पर)$/.test(w);

    if (isPostpositionOrFragment) {
      steps.push({
        tokenIndex: idx,
        label: `Grammatical Check: "${w}" -> Classified as O`,
        ruleApplied: `RULE OVERRIDE: Postposition/fragment is NOT an entity`,
        explanation: `Academic Rule: Standalone tokens like 'मे' or 'में' are locative postpositions or spelling fragments, NOT Named Entities or Dates. Explicitly categorized as 'O' (Outside).`,
        stateSnapshot: {
          Token: w,
          EntityLabel: "O (Not an entity)",
          Rule: "Postposition Boundary Filter",
        },
        badge: { text: "O (Outside Entity)", tone: "slate" },
        accumulatedPreview: [...accumulatedEntities],
      });
    } else if (isHindiOrg || isAcronym || /(NASA|ISRO|Google|Microsoft|CERN)/i.test(w)) {
      accumulatedEntities.push(`[ORG: ${w}]`);
      steps.push({
        tokenIndex: idx,
        label: `Entity Match: "${w}" -> ORGANIZATION`,
        ruleApplied: `Gazetteer & Institutional Acronym Matching`,
        explanation: `Identified institutional organizational entity.`,
        stateSnapshot: {
          Token: w,
          EntityClass: "ORGANIZATION (ORG)",
          Confidence: "High (Gazetteer / Capital Acronym)",
        },
        badge: { text: "ORG (Organization)", tone: "indigo" },
        accumulatedPreview: [...accumulatedEntities],
      });
    } else if (isHindiGpe || /(Delhi|Mumbai|India|Chile|Paris|London)/i.test(w)) {
      accumulatedEntities.push(`[GPE: ${w}]`);
      steps.push({
        tokenIndex: idx,
        label: `Entity Match: "${w}" -> LOCATION/GPE`,
        ruleApplied: `Geopolitical Entity (GPE) Lexicon Check`,
        explanation: `Matched sovereign country, administrative region, or major metropolitan locality.`,
        stateSnapshot: {
          Token: w,
          EntityClass: "GPE / LOCATION",
          Confidence: "High (Gazetteer Match)",
        },
        badge: { text: "GPE (Location)", tone: "emerald" },
        accumulatedPreview: [...accumulatedEntities],
      });
    } else if (isHindiDate || /\b(Monday|Tuesday|Wednesday|October|January|Yesterday|Tomorrow|2026)\b/i.test(w)) {
      accumulatedEntities.push(`[DATE: ${w}]`);
      steps.push({
        tokenIndex: idx,
        label: `Entity Match: "${w}" -> DATE/TEMPORAL`,
        ruleApplied: `Calendar & Temporal Expression Regex`,
        explanation: `Matched standard calendar day, month, or temporal index.`,
        stateSnapshot: {
          Token: w,
          EntityClass: "DATE / TEMPORAL",
          Confidence: "High",
        },
        badge: { text: "DATE (Temporal)", tone: "amber" },
        accumulatedPreview: [...accumulatedEntities],
      });
    } else if (isCapitalized) {
      accumulatedEntities.push(`[PER/PROP: ${w}]`);
      steps.push({
        tokenIndex: idx,
        label: `Capitalized Candidate: "${w}" -> PROPER NOUN`,
        ruleApplied: `Orthographic Capitalization Heuristic in Mid-Sentence`,
        explanation: `Non-sentence-initial capitalized token indicates a proper named entity.`,
        stateSnapshot: {
          Token: w,
          EntityClass: "PERSON / PROPER NOUN",
          Confidence: "Medium (Orthography)",
        },
        badge: { text: "PROPER NOUN", tone: "violet" },
        accumulatedPreview: [...accumulatedEntities],
      });
    } else {
      steps.push({
        tokenIndex: idx,
        label: `Common Token: "${w}" -> O`,
        ruleApplied: `Standard Lexical Word (Non-Entity)`,
        explanation: `Word does not match proper noun gazetteers or entity patterns. Tagged as 'O' (Outside of named entity).`,
        stateSnapshot: {
          Token: w,
          EntityClass: "O",
        },
        badge: { text: "O (Common)", tone: "slate" },
        accumulatedPreview: [...accumulatedEntities],
      });
    }
  });

  return { tokens: words, steps };
}

// 7. Sentiment Polarity Simulator
export function generateSentimentSimulation(text: string): { tokens: string[]; steps: SimulationStep[] } {
  const words = tokenizeWords(text).slice(0, 16);
  const steps: SimulationStep[] = [];
  let runningScore = 0;
  const contributingTokens: string[] = [];

  const LEXICON: Record<string, number> = {
    good: 2, great: 3, excellent: 4, brilliant: 4, amazing: 4, helpful: 2, clean: 2,
    bad: -2, terrible: -3, horrible: -4, disappointing: -3, failed: -3, crash: -3, slow: -2,
    अच्छा: 2, सुंदर: 2, उत्कृष्ट: 4, उत्तम: 3, बढ़िया: 3, खरा: 2,
    खराब: -3, बेकार: -3, घटिया: -3, गलती: -2, निराशाजनक: -3,
  };

  const NEGATIONS = new Set(["not", "never", "no", "wasnt", "isnt", "dont", "नहीं", "नाही"]);
  const INTENSIFIERS = new Set(["very", "extremely", "really", "बहुत", "खूप"]);

  words.forEach((w, idx) => {
    const lower = w.toLowerCase();
    const baseScore = LEXICON[lower] || 0;
    const prev1 = idx > 0 ? words[idx - 1].toLowerCase() : "";
    const prev2 = idx > 1 ? words[idx - 2].toLowerCase() : "";

    const isNegated = NEGATIONS.has(prev1) || NEGATIONS.has(prev2);
    const isIntensified = INTENSIFIERS.has(prev1) || INTENSIFIERS.has(prev2);

    let multiplier = 1.0;
    if (isIntensified) multiplier *= 1.5;
    if (isNegated) multiplier *= -1.0;

    const delta = baseScore !== 0 ? baseScore * multiplier : 0;
    runningScore += delta;

    if (delta !== 0) {
      contributingTokens.push(`${w} (${delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)})`);
    }

    const currentLabel = runningScore > 0.5 ? "Positive" : runningScore < -0.5 ? "Negative" : "Neutral";
    const badgeTone: "emerald" | "rose" | "slate" =
      currentLabel === "Positive" ? "emerald" : currentLabel === "Negative" ? "rose" : "slate";

    steps.push({
      tokenIndex: idx,
      label: `Inspect Token #${idx + 1}: "${w}" (Lexicon: ${baseScore > 0 ? `+${baseScore}` : baseScore})`,
      ruleApplied: baseScore !== 0
        ? `Score Delta = Base(${baseScore}) * Multiplier(${multiplier}) = ${delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}`
        : `Neutral token (Base lexicon score = 0)`,
      explanation: isNegated && baseScore !== 0
        ? `Grammatical negation detected ('${prev1}' or '${prev2}')! Inverts emotional polarity from ${baseScore} to ${delta}.`
        : isIntensified && baseScore !== 0
        ? `Grammatical intensifier detected ('${prev1}' or '${prev2}')! Boosts sentiment impact by 1.5x.`
        : baseScore !== 0
        ? `Matches curated sentiment dictionary with emotional polarity ${baseScore}.`
        : `Standard non-sentiment token. Running score remains at ${runningScore.toFixed(1)}.`,
      stateSnapshot: {
        CurrentToken: w,
        BaseScore: baseScore,
        NegationActive: isNegated ? "YES (-1x)" : "NO",
        IntensifierActive: isIntensified ? "YES (1.5x)" : "NO",
        ScoreDelta: delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1),
        RunningTotalScore: runningScore.toFixed(1),
        CurrentOverallLabel: currentLabel,
      },
      badge: { text: `${currentLabel} (${runningScore > 0 ? `+${runningScore.toFixed(1)}` : runningScore.toFixed(1)})`, tone: badgeTone },
      accumulatedPreview: [...contributingTokens],
    });
  });

  return { tokens: words, steps };
}

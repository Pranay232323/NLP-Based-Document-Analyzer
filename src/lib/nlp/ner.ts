// EXPERIMENT 8: Named Entity Recognition
// Combines two local, non-LLM techniques:
//  1. compromise.js lexicon + capitalisation rules -> PERSON, ORGANIZATION, GPE/LOCATION
//  2. winkNLP statistical entity detector -> DATE, TIME, MONEY, PERCENT, CARDINAL, ORDINAL, DURATION
//  3. Indic gazetteer + context-aware date regex rules -> PERSON, ORGANIZATION, GPE/LOCATION, DATE
// Results are merged, de-duplicated and filtered (e.g., ensuring "मे" / "में" is not classified as DATE).
// eslint-disable-next-line @typescript-eslint/no-require-imports
import nlpCompromise from "compromise";
import { winkEntities } from "./winkEngine";
import type { EntityResult } from "./types";
export { buildHighlightSegments } from "./highlight";

const NUMERIC_TYPES = new Set([
  "DATE",
  "TIME",
  "MONEY",
  "PERCENT",
  "CARDINAL",
  "ORDINAL",
  "DURATION",
  "QUANTITY",
]);

function categoryFor(type: string): EntityResult["category"] {
  if (type === "PERSON" || type === "ORGANIZATION" || type === "GPE/LOCATION") return "Person/Org/Place";
  if (NUMERIC_TYPES.has(type)) return "Numeric/Temporal";
  return "Other";
}

/**
 * Finds all exact occurrences of `needle` in `text` enforcing token/word boundaries.
 * Prevents matching sub-words (e.g. standalone "मे" must not match inside "मेहनत").
 */
function findAllOccurrences(text: string, needle: string): { start: number; end: number }[] {
  if (!needle.trim()) return [];
  const positions: { start: number; end: number }[] = [];
  const lowerText = text.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  let from = 0;
  while (from <= lowerText.length) {
    const idx = lowerText.indexOf(lowerNeedle, from);
    if (idx === -1) break;
    const end = idx + needle.length;

    // Boundary check: ensure match is not an internal substring of a word
    const prevChar = idx > 0 ? text[idx - 1] : "";
    const nextChar = end < text.length ? text[end] : "";

    const isPrevWordChar = /[A-Za-z0-9\u0900-\u097F]/.test(prevChar);
    const isNextWordChar = /[A-Za-z0-9\u0900-\u097F]/.test(nextChar);

    if (!isPrevWordChar && !isNextWordChar) {
      positions.push({ start: idx, end });
    }

    from = idx + needle.length;
  }
  return positions;
}

const INDIC_PERSONS = [
  "छत्रपती शिवाजी महाराज", "महात्मा गांधी", "डॉ. बाबासाहेब आंबेडकर", "बाबासाहेब आंबेडकर",
  "नरेंद्र मोदी", "जवाहरलाल नेहरू", "सचिन तेंडुलकर", "एपीजे अब्दुल कलाम", "अब्दुल कलाम",
  "इंदिरा गांधी", "सरदार पटेल", "लोकमान्य टिळक", "रतन टाटा", "मुकेश अंबानी",
];

const INDIC_PLACES = [
  "भारत", "महाराष्ट्र", "मुंबई", "दिल्ली", "पुणे", "नागपूर", "नाशिक", "ठाणे",
  "कोल्हापूर", "कोलकाता", "चेन्नई", "बंगळुरू", "हैदराबाद", "अहमदाबाद", "जयपूर",
  "राजस्थान", "गुजरात", "उत्तर प्रदेश", "मध्य प्रदेश", "गोवा", "केरळ", "कर्नाटक",
  "अमेरिका", "ब्रिटन", "लंडन", "रशिया", "चीन", "जपान",
];

const INDIC_ORGS = [
  "भारत सरकार", "इसरो", "महाराष्ट्र शासन", "डीआरडीओ", "टाटा", "रिलायन्स", "इन्फोसिस", "विप्रो",
  "गुगल", "मायक्रोसॉफ्ट", "सर्वोच्च न्यायालय", "उच्च न्यायालय", "संसद", "विधानसभा",
  "रिझर्व्ह बँक", "स्टेट बँक", "मुंबई विद्यापीठ", "पुणे विद्यापीठ", "आयआयटी",
];

// Indic full month names (Hindi and Marathi).
// NOTE: Standalone "मे" is deliberately excluded because in Hindi/Marathi it is usually
// a postposition ("में" / "मे") or word fragment, NOT a date.
const INDIC_MONTHS = [
  "जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर",
  "जानेवारी", "फेब्रुवारी", "एप्रिल", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर",
];

const INDIC_DAYS_OF_WEEK = [
  "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार",
];

const INDIC_RELATIVE_DATES = [
  "कल", "आज", "परसों", "काल", "उद्या", "परवा",
];

// Composite date patterns e.g. "14 अक्टूबर 2026", "14 अक्टूबर", "अक्टूबर 2026", "15 अगस्त 1947"
const INDIC_DATE_PATTERN = /\b(?:[०-९\d]{1,2}\s+)?(?:जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर|जानेवारी|फेब्रुवारी|एप्रिल|जुलै|ऑगस्ट|सप्टेंबर|ऑक्टोबर|नोव्हेंबर|डिसेंबर)(?:\s+[०-९\d]{4})?\b/gu;

// For Marathi "मे", only match when part of a full date expression (e.g. "14 मे 2026", "14 मे", "मे 2026")
const MARATHI_MAY_DATE_PATTERN = /\b(?:[०-९\d]{1,2}\s+मे(?:\s+[०-९\d]{4})?|मे\s+[०-९\d]{4})\b/gu;

/**
 * Filter out false positives (e.g., "मे" / "में" is a postposition/fragment, not a DATE).
 */
function isExcludedEntity(token: string, type: string): boolean {
  const t = token.trim();
  // "मे" or "में" must strictly be O (Not an entity) when standalone
  if (t === "मे" || t === "में") {
    return true;
  }
  return false;
}

/** Extract named entities from free text using compromise + winkNLP (English) and Indic gazetteer (Hindi/Marathi). */
export function extractEntities(text: string): EntityResult[] {
  if (!text.trim()) return [];

  const candidates: { text: string; type: string }[] = [];

  if (/[\u0900-\u097F]/.test(text)) {
    // 1. Persons
    for (const p of INDIC_PERSONS) {
      if (text.includes(p)) candidates.push({ text: p, type: "PERSON" });
    }

    // 2. Locations / GPE
    for (const pl of INDIC_PLACES) {
      if (text.includes(pl)) candidates.push({ text: pl, type: "GPE/LOCATION" });
    }

    // 3. Organizations
    for (const o of INDIC_ORGS) {
      if (text.includes(o)) candidates.push({ text: o, type: "ORGANIZATION" });
    }

    // 4. Standalone Month Names
    for (const m of INDIC_MONTHS) {
      if (text.includes(m)) candidates.push({ text: m, type: "DATE" });
    }

    // 5. Days of Week
    for (const d of INDIC_DAYS_OF_WEEK) {
      if (text.includes(d)) candidates.push({ text: d, type: "DATE" });
    }

    // 6. Relative Dates
    for (const rd of INDIC_RELATIVE_DATES) {
      if (text.includes(rd)) candidates.push({ text: rd, type: "DATE" });
    }

    // 7. Full Composite Dates (e.g., "14 अक्टूबर 2026", "14 मे 2026")
    const dateMatches = text.match(INDIC_DATE_PATTERN) ?? [];
    for (const dm of dateMatches) {
      candidates.push({ text: dm.trim(), type: "DATE" });
    }
    const mayMatches = text.match(MARATHI_MAY_DATE_PATTERN) ?? [];
    for (const mm of mayMatches) {
      candidates.push({ text: mm.trim(), type: "DATE" });
    }

    // 8. 4-digit years
    const yearMatches = text.match(/\b(?:20\d\d|19\d\d|[०-९]{4})\b/g) ?? [];
    for (const y of yearMatches) {
      candidates.push({ text: y, type: "DATE" });
    }
  }

  // English entities
  const doc = nlpCompromise(text);
  const people = doc.people().out("array") as string[];
  const orgs = doc.organizations().out("array") as string[];
  const places = doc.places().out("array") as string[];

  people.forEach((t) => candidates.push({ text: t, type: "PERSON" }));
  orgs.forEach((t) => candidates.push({ text: t, type: "ORGANIZATION" }));
  places.forEach((t) => candidates.push({ text: t, type: "GPE/LOCATION" }));

  winkEntities(text).forEach((e) => candidates.push({ text: e.value, type: e.type }));

  // Deduplicate identical (text,type) pairs and locate with word boundaries
  const seenKey = new Set<string>();
  const occurrences: EntityResult[] = [];

  for (const c of candidates) {
    if (isExcludedEntity(c.text, c.type)) continue;

    const key = `${c.text.toLowerCase()}::${c.type}`;
    if (seenKey.has(key)) continue;
    seenKey.add(key);

    for (const pos of findAllOccurrences(text, c.text)) {
      occurrences.push({ text: c.text, type: c.type, category: categoryFor(c.type), ...pos });
    }
  }

  occurrences.sort((a, b) => a.start - b.start || b.end - b.end);

  // Remove overlapping spans, keeping the longer (more specific) entity.
  const final: EntityResult[] = [];
  for (const occ of occurrences) {
    if (isExcludedEntity(occ.text, occ.type)) continue;

    const overlapIdx = final.findIndex((f) => occ.start < f.end && occ.end > f.start);
    if (overlapIdx === -1) {
      final.push(occ);
    } else if (occ.end - occ.start > final[overlapIdx].end - final[overlapIdx].start) {
      final[overlapIdx] = occ;
    }
  }

  return final
    .filter((e) => !isExcludedEntity(e.text, e.type))
    .sort((a, b) => a.start - b.start);
}

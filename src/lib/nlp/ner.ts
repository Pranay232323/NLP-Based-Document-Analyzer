// EXPERIMENT 8: Named Entity Recognition
// Combines two local, non-LLM techniques:
//  1. compromise.js lexicon + capitalisation rules -> PERSON, ORGANIZATION, GPE/LOCATION
//  2. winkNLP statistical entity detector -> DATE, TIME, MONEY, PERCENT, CARDINAL, ORDINAL, DURATION
// Results are merged, de-duplicated and positioned back into the original text
// so entities can be highlighted inline.
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

function findAllOccurrences(text: string, needle: string): { start: number; end: number }[] {
  if (!needle.trim()) return [];
  const positions: { start: number; end: number }[] = [];
  const lowerText = text.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  let from = 0;
  while (from <= lowerText.length) {
    const idx = lowerText.indexOf(lowerNeedle, from);
    if (idx === -1) break;
    positions.push({ start: idx, end: idx + needle.length });
    from = idx + needle.length;
  }
  return positions;
}

/** Extract named entities from free text using compromise + winkNLP. */
export function extractEntities(text: string): EntityResult[] {
  if (!text.trim()) return [];

  const doc = nlpCompromise(text);
  const people = doc.people().out("array") as string[];
  const orgs = doc.organizations().out("array") as string[];
  const places = doc.places().out("array") as string[];

  const candidates: { text: string; type: string }[] = [];
  people.forEach((t) => candidates.push({ text: t, type: "PERSON" }));
  orgs.forEach((t) => candidates.push({ text: t, type: "ORGANIZATION" }));
  places.forEach((t) => candidates.push({ text: t, type: "GPE/LOCATION" }));

  winkEntities(text).forEach((e) => candidates.push({ text: e.value, type: e.type }));

  // Deduplicate identical (text,type) pairs and resolve overlaps by preferring
  // the longest matched text at a given position (e.g. "Barack Obama" over "Obama").
  const seenKey = new Set<string>();
  const occurrences: EntityResult[] = [];

  for (const c of candidates) {
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
    const overlapIdx = final.findIndex((f) => occ.start < f.end && occ.end > f.start);
    if (overlapIdx === -1) {
      final.push(occ);
    } else if (occ.end - occ.start > final[overlapIdx].end - final[overlapIdx].start) {
      final[overlapIdx] = occ;
    }
  }

  return final.sort((a, b) => a.start - b.start);
}

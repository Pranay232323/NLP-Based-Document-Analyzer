// Lightweight, client-safe helper (no NLP library imports) used to render
// inline entity highlights in the browser.
import type { EntityResult } from "./types";

export function buildHighlightSegments(text: string, entities: EntityResult[]) {
  const segments: { text: string; entity?: EntityResult }[] = [];
  let cursor = 0;
  for (const ent of entities) {
    if (ent.start > cursor) segments.push({ text: text.slice(cursor, ent.start) });
    segments.push({ text: text.slice(ent.start, ent.end), entity: ent });
    cursor = ent.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

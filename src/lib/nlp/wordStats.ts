// EXPERIMENT 10: Exploratory Data Analysis of Text - Word Frequency & Word Cloud
import { isStopword } from "./stopwords";
import type { KeywordFrequency } from "./types";

/** Clean, lowercase and strip special characters for frequency analysis. */
export function cleanWordsForEDA(text: string): string[] {
  const lower = text.toLowerCase();
  const stripped = lower.replace(/[^a-z\s]/g, " ");
  return stripped
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !isStopword(w) && !/^\d+$/.test(w));
}

export function wordFrequencies(text: string, topK = 30): KeywordFrequency[] {
  const words = cleanWordsForEDA(text);
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  const total = words.length || 1;
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([word, count]) => ({ word, count, percentage: Number(((count / total) * 100).toFixed(2)) }));
}

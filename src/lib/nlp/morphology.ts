// EXPERIMENT 4: Morphological Analysis and Word Generation
// A transparent, rule-based (non-dictionary) morphological analyser. It is
// intentionally simple so it can be explained step-by-step during a viva.
import type { MorphologyBreakdown, WordGeneration } from "./types";

const PREFIXES = [
  "anti", "auto", "bi", "co", "de", "dis", "em", "en", "ex", "fore",
  "il", "im", "in", "inter", "ir", "mis", "mono", "multi", "non",
  "out", "over", "post", "pre", "re", "semi", "sub", "super", "trans", "un", "under",
].sort((a, b) => b.length - a.length);

const SUFFIXES = [
  "ation", "ition", "ization", "ibility", "ability",
  "ment", "ness", "tion", "sion", "ful", "less", "able", "ible",
  "ance", "ence", "ist", "ism", "ity", "ous", "ive", "al",
  "ing", "ed", "er", "est", "ly", "es", "s", "y",
].sort((a, b) => b.length - a.length);

const MIN_ROOT_LENGTH = 3;

function fixRootSpelling(root: string, suffix: string): string {
  // studi + ed -> study (i -> y before a stripped vowel suffix)
  if ((suffix === "ed" || suffix === "es") && root.endsWith("i")) {
    return root.slice(0, -1) + "y";
  }
  // runn -> run (drop doubled trailing consonant picked up before -ing/-ed)
  if ((suffix === "ing" || suffix === "ed") && root.length > 2) {
    const last = root[root.length - 1];
    const secondLast = root[root.length - 2];
    const isConsonant = (c: string) => !"aeiou".includes(c);
    if (last === secondLast && isConsonant(last)) {
      return root.slice(0, -1);
    }
  }
  return root;
}

/** Breaks a single word into prefix / root / suffix using rule-based stripping. */
export function analyzeMorphology(wordRaw: string): MorphologyBreakdown {
  const word = wordRaw.toLowerCase().trim();
  if (!word) {
    return { word: wordRaw, prefix: null, root: wordRaw, suffix: null, notes: "Empty input." };
  }

  let prefix: string | null = null;
  let root = word;

  // Try to strip a recognised prefix, keeping a usable remainder.
  for (const p of PREFIXES) {
    if (word.startsWith(p) && word.length - p.length >= MIN_ROOT_LENGTH) {
      prefix = p;
      root = word.slice(p.length);
      break;
    }
  }

  // Try to strip a recognised suffix from whatever remains after the prefix.
  let suffix: string | null = null;
  for (const s of SUFFIXES) {
    if (root.endsWith(s) && root.length - s.length >= MIN_ROOT_LENGTH) {
      suffix = s;
      root = fixRootSpelling(root.slice(0, root.length - s.length), s);
      break;
    }
  }

  const notes =
    prefix || suffix
      ? "Root recovered using simple rule-based prefix/suffix stripping (approximate, not dictionary-validated)."
      : "No common prefix/suffix detected - word treated as its own root.";

  return { word: wordRaw, prefix, root, suffix, notes };
}

export function analyzeMorphologyBatch(words: string[]): MorphologyBreakdown[] {
  const seen = new Set<string>();
  const results: MorphologyBreakdown[] = [];
  for (const w of words) {
    const lower = w.toLowerCase();
    if (seen.has(lower) || lower.length < 3) continue;
    seen.add(lower);
    results.push(analyzeMorphology(lower));
  }
  return results;
}

/**
 * EXPERIMENT 4 (part 2): simple rule-based word generation.
 * Applies common English suffix rules to a base word. Forms are labelled
 * "Rule-Based Possible Variants" because naive suffixation does not guarantee
 * a linguistically valid English word.
 */
export function generateWordForms(baseRaw: string): WordGeneration {
  const base = baseRaw.toLowerCase().trim();
  if (!base) return { base: baseRaw, variants: [] };

  const endsConsonantY = /[^aeiou]y$/.test(base);
  const endsE = /e$/.test(base);
  const endsCVC = /[^aeiou][aeiou][^aeiouwxy]$/.test(base) && base.length > 2;

  const variants = new Set<string>();
  variants.add(base);

  // Plural / 3rd person singular
  if (/(s|x|z|ch|sh)$/.test(base)) variants.add(base + "es");
  else if (endsConsonantY) variants.add(base.slice(0, -1) + "ies");
  else variants.add(base + "s");

  // Past tense (-ed)
  if (endsE) variants.add(base + "d");
  else if (endsConsonantY) variants.add(base.slice(0, -1) + "ied");
  else if (endsCVC) variants.add(base + base[base.length - 1] + "ed");
  else variants.add(base + "ed");

  // Present participle (-ing)
  if (endsE && base !== "be") variants.add(base.slice(0, -1) + "ing");
  else if (endsCVC) variants.add(base + base[base.length - 1] + "ing");
  else variants.add(base + "ing");

  // Agent noun (-er)
  if (endsE) variants.add(base + "r");
  else variants.add(base + "er");

  // Adjective-forming
  variants.add(base + "ful");
  variants.add(base + "less");

  // Adverb-forming
  if (endsConsonantY) variants.add(base.slice(0, -1) + "ily");
  else variants.add(base + "ly");

  // Abstract noun
  variants.add(base + "ness");
  variants.add(base + "ment");

  variants.delete(base === "" ? "__none__" : "");
  return { base, variants: Array.from(variants).filter((v) => v !== base || true) };
}

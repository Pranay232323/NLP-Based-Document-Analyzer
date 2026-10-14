// EXPERIMENT 7: Chunking - shallow, rule-based phrase chunking built on top of
// the POS tags produced in Experiment 6. Implements a simplified chunk
// grammar (similar to the classic NP/VP/PP rules taught in NLP courses):
//
//   NP -> (DT)? (JJ)* (NN|NNS|NNP|NNPS|CD)+      | a standalone pronoun (PRP)
//   VP -> (MD)? (VB|VBD|VBG|VBN|VBP|VBZ)+ (RP)?   (absorbs an immediately
//                                                   following NP as its object)
//   PP -> (IN) immediately followed by an NP
import { posTagTokens, winkSentences } from "./winkEngine";
import type { ChunkResult } from "./types";

type Code = "D" | "J" | "N" | "P" | "M" | "V" | "R" | "I" | "O";

function tagToCode(tag: string): Code {
  if (tag === "DT" || tag === "PRP$") return "D";
  if (tag === "JJ" || tag === "JJR" || tag === "JJS") return "J";
  if (tag === "NN" || tag === "NNS" || tag === "NNP" || tag === "NNPS" || tag === "CD") return "N";
  if (tag === "PRP") return "P";
  if (tag === "MD") return "M";
  if (tag.startsWith("VB")) return "V";
  if (tag === "RP") return "R";
  if (tag === "IN") return "I";
  return "O";
}

interface Span {
  start: number;
  end: number; // exclusive
}

function findSpans(codeStr: string, regex: RegExp): Span[] {
  const spans: Span[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(regex, "g");
  while ((match = re.exec(codeStr)) !== null) {
    if (match[0].length === 0) {
      re.lastIndex++;
      continue;
    }
    spans.push({ start: match.index, end: match.index + match[0].length });
  }
  return spans;
}

function phraseText(words: string[], span: Span): string {
  return words.slice(span.start, span.end).join(" ");
}

function tagPattern(tags: string[], span: Span): string {
  return tags.slice(span.start, span.end).join(" ");
}

/** Chunk a single sentence (already POS-tagged) into NP/VP/PP phrases. */
function chunkSentence(words: string[], tags: string[]): Omit<ChunkResult, "sentenceIndex">[] {
  const codeStr = tags.map(tagToCode).join("");
  const results: Omit<ChunkResult, "sentenceIndex">[] = [];

  const npSpans = findSpans(codeStr, /D?J*N+|P/g);
  const vpSpansRaw = findSpans(codeStr, /M?V+R?/g);

  const npStartIndex = new Map(npSpans.map((s) => [s.start, s] as const));

  const usedAsVpObject = new Set<number>(); // index into npSpans array that got merged into a VP

  for (const vp of vpSpansRaw) {
    let text = phraseText(words, vp);
    let pattern = tagPattern(tags, vp);
    let end = vp.end;
    const followingNp = npStartIndex.get(vp.end);
    if (followingNp) {
      text = `${text} ${phraseText(words, followingNp)}`;
      pattern = `${pattern} ${tagPattern(tags, followingNp)}`;
      end = followingNp.end;
      usedAsVpObject.add(followingNp.start);
    }
    results.push({ type: "VP", text, pattern });
    void end;
  }

  for (const np of npSpans) {
    results.push({ type: "NP", text: phraseText(words, np), pattern: tagPattern(tags, np) });
  }

  // PP: IN immediately followed by an NP span.
  for (let i = 0; i < codeStr.length; i++) {
    if (codeStr[i] !== "I") continue;
    const followingNp = npStartIndex.get(i + 1);
    if (followingNp) {
      const ppSpan: Span = { start: i, end: followingNp.end };
      results.push({ type: "PP", text: phraseText(words, ppSpan), pattern: `IN ${tagPattern(tags, followingNp)}` });
    }
  }

  // Preserve a reading order similar to the sentence (NP, VP, PP interleaved by position).
  return results;
}

/** Run the chunker across every sentence of a document. */
export function chunkDocument(text: string): ChunkResult[] {
  const sentences = winkSentences(text);
  const chunks: ChunkResult[] = [];

  sentences.forEach((sentence, sentenceIndex) => {
    const tagged = posTagTokens(sentence).filter((t) => /[A-Za-z0-9]/.test(t.value) || /[\u0900-\u097F]/.test(t.value));
    const words = tagged.map((t) => t.value);
    const tags = tagged.map((t) => t.pos);
    const sentenceChunks = chunkSentence(words, tags);
    sentenceChunks.forEach((c) => chunks.push({ ...c, sentenceIndex }));
  });

  return chunks;
}

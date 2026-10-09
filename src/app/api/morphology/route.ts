import { NextRequest, NextResponse } from "next/server";
import { analyzeMorphology, generateWordForms } from "@/lib/nlp/morphology";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const word = typeof body.word === "string" ? body.word.trim() : "";
    if (!word) {
      return NextResponse.json({ error: "Please enter a word to analyze." }, { status: 400 });
    }
    if (!/^[A-Za-z]+$/.test(word)) {
      return NextResponse.json({ error: "Please enter a single alphabetic word (no numbers or spaces)." }, { status: 400 });
    }
    const breakdown = analyzeMorphology(word);
    const generation = generateWordForms(word);
    return NextResponse.json({ breakdown, generation });
  } catch (err) {
    console.error("[/api/morphology]", err);
    return NextResponse.json({ error: "Something went wrong in the morphology module." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { buildAllModels, generateText, predictNext, summarizeModel, wordSequence } from "@/lib/nlp/ngram";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text : "";
    const n = Number(body.n) === 2 || Number(body.n) === 3 ? Number(body.n) : 1;
    const action = body.action as "predict" | "generate" | "summary";

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No corpus text available. Please analyze a document first." }, { status: 400 });
    }

    const sequence = wordSequence(text);
    if (sequence.length < 2) {
      return NextResponse.json({ error: "Text is too short to build an N-Gram model." }, { status: 400 });
    }
    const models = buildAllModels(sequence);

    if (action === "summary") {
      const summaries = [1, 2, 3].map((k) => summarizeModel(models[k]));
      return NextResponse.json({ summaries });
    }

    if (action === "predict") {
      const context = typeof body.context === "string" ? body.context : "";
      if (!context.trim()) {
        return NextResponse.json({ error: "Please enter a context phrase to predict the next word." }, { status: 400 });
      }
      const prediction = predictNext(models, context, n, 5);
      return NextResponse.json({ prediction });
    }

    if (action === "generate") {
      const seed = typeof body.seed === "string" ? body.seed : "";
      const length = Math.min(Math.max(Number(body.length) || 10, 1), 40);
      if (!seed.trim()) {
        return NextResponse.json({ error: "Please enter a seed phrase to generate text." }, { status: 400 });
      }
      const generation = generateText(models, seed, n, length);
      return NextResponse.json({ generation });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("[/api/ngram]", err);
    return NextResponse.json({ error: "Something went wrong in the N-Gram module." }, { status: 500 });
  }
}

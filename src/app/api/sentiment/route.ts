import { NextRequest, NextResponse } from "next/server";
import { analyzeSentiment } from "@/lib/nlp/sentiment";
import { saveExperimentRun } from "@/lib/repository";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "No text provided for sentiment analysis." }, { status: 400 });
    }

    const result = analyzeSentiment(text);

    // Track experiment run in history if MongoDB is configured
    await saveExperimentRun({
      experimentId: "exp-11",
      experimentTitle: "Sentiment Analysis & Polarity Scoring",
      moduleName: "Sentiment Analysis",
      docName: body.docName || "Ad-hoc Text Input",
      parameters: { length: text.length },
      metricsSummary: {
        label: result.label,
        normalizedScore: result.normalizedScore,
        confidence: result.confidence,
        subjectivity: result.subjectivity,
      },
    }).catch(() => null);

    return NextResponse.json({ result });
  } catch (err) {
    console.error("[/api/sentiment]", err);
    return NextResponse.json({ error: "Failed to process sentiment analysis." }, { status: 500 });
  }
}

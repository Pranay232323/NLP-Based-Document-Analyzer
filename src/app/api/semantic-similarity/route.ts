import { NextRequest, NextResponse } from "next/server";
import { computeMultiMetricSimilarity } from "@/lib/nlp/semanticSimilarity";
import { saveExperimentRun } from "@/lib/repository";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const textA = typeof body.textA === "string" ? body.textA.trim() : "";
    const textB = typeof body.textB === "string" ? body.textB.trim() : "";

    if (!textA || !textB) {
      return NextResponse.json({ error: "Both Text A and Text B are required for similarity comparison." }, { status: 400 });
    }

    const result = computeMultiMetricSimilarity(textA, textB);

    await saveExperimentRun({
      experimentId: "exp-16",
      experimentTitle: "Advanced Semantic Similarity & Overlap",
      moduleName: "Semantic Similarity",
      parameters: { lengthA: textA.length, lengthB: textB.length },
      metricsSummary: {
        compositeScore: result.metrics.compositeScore,
        lexicalCosine: result.metrics.lexicalCosine,
        softSemanticScore: result.metrics.softSemanticScore,
        level: result.interpretation.level,
      },
    }).catch(() => null);

    return NextResponse.json({ result });
  } catch (err) {
    console.error("[/api/semantic-similarity]", err);
    return NextResponse.json({ error: "Failed to compute semantic similarity." }, { status: 500 });
  }
}

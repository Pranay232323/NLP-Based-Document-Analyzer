import { NextRequest, NextResponse } from "next/server";
import { compareKeywordMethods } from "@/lib/nlp/keywords";
import { saveExperimentRun } from "@/lib/repository";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "No text provided for keyword extraction." }, { status: 400 });
    }

    const comparison = compareKeywordMethods(text);

    await saveExperimentRun({
      experimentId: "exp-14",
      experimentTitle: "Keyword & Keyphrase Extraction",
      moduleName: "Keyword Extraction",
      docName: body.docName || "Ad-hoc Text Input",
      parameters: { length: text.length },
      metricsSummary: {
        agreementScore: comparison.agreementScore,
        topRake: comparison.rake.slice(0, 3).map((r) => r.phrase),
        topTfidf: comparison.tfidf.slice(0, 3).map((t) => t.phrase),
      },
    }).catch(() => null);

    return NextResponse.json({ result: comparison });
  } catch (err) {
    console.error("[/api/keywords]", err);
    return NextResponse.json({ error: "Failed to extract keywords." }, { status: 500 });
  }
}

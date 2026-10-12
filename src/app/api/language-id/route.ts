import { NextRequest, NextResponse } from "next/server";
import { identifyLanguage } from "@/lib/nlp/languageId";
import { saveExperimentRun } from "@/lib/repository";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "No text provided for language identification." }, { status: 400 });
    }

    const result = identifyLanguage(text);

    await saveExperimentRun({
      experimentId: "exp-15",
      experimentTitle: "Language Identification & Script Analysis",
      moduleName: "Language Identification",
      docName: body.docName || "Ad-hoc Multilingual Snippet",
      parameters: { length: text.length },
      metricsSummary: {
        detectedLanguage: result.detectedLanguage,
        languageCode: result.languageCode,
        confidence: result.confidence,
        script: result.script.scriptName,
      },
    }).catch(() => null);

    return NextResponse.json({ result });
  } catch (err) {
    console.error("[/api/language-id]", err);
    return NextResponse.json({ error: "Failed to identify language." }, { status: 500 });
  }
}

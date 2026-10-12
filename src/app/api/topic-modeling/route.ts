import { NextRequest, NextResponse } from "next/server";
import { runTopicModeling, extractParagraphsOrSentences } from "@/lib/nlp/topicModeling";
import { saveExperimentRun } from "@/lib/repository";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let documents: string[] = [];

    if (Array.isArray(body.documents) && body.documents.length >= 2) {
      documents = body.documents;
    } else if (typeof body.text === "string" && body.text.trim()) {
      documents = extractParagraphsOrSentences(body.text.trim());
    }

    if (documents.length < 2) {
      return NextResponse.json(
        { error: "At least 2 distinct paragraphs or document snippets are required for topic discovery." },
        { status: 400 }
      );
    }

    const numTopics = typeof body.numTopics === "number" ? body.numTopics : 3;
    const result = runTopicModeling(documents, numTopics);

    await saveExperimentRun({
      experimentId: "exp-13",
      experimentTitle: "Unsupervised Topic Modelling",
      moduleName: "Topic Modeling",
      docName: body.docName || "Analyzed Document Paragraphs",
      parameters: { numTopics: result.numTopics, documentsCount: result.numDocuments },
      metricsSummary: {
        topicsDiscovered: result.topics.map((t) => t.label),
        vocabularySize: result.vocabularySize,
      },
    }).catch(() => null);

    return NextResponse.json({ result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to run topic modeling.";
    console.error("[/api/topic-modeling]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

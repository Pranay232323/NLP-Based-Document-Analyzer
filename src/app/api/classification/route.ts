import { NextRequest, NextResponse } from "next/server";
import {
  trainAndEvaluateClassifier,
  predictText,
  DEFAULT_CLASSIFICATION_DATASET,
  type DataSample,
} from "@/lib/nlp/classification";
import { saveExperimentRun } from "@/lib/repository";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dataset: DataSample[] = Array.isArray(body.dataset) && body.dataset.length >= 4
      ? body.dataset
      : DEFAULT_CLASSIFICATION_DATASET;

    const datasetName = typeof body.datasetName === "string" && body.datasetName.trim()
      ? body.datasetName.trim()
      : "Standard Academic Corpus (Technology, Sports, Politics, Science)";

    const splitRatio = typeof body.splitRatio === "number" && body.splitRatio > 0.5 && body.splitRatio < 0.95
      ? body.splitRatio
      : 0.75;

    const { experiment, model } = trainAndEvaluateClassifier(dataset, datasetName, splitRatio);

    let prediction = null;
    if (typeof body.testText === "string" && body.testText.trim()) {
      prediction = predictText(body.testText.trim(), model);
    }

    await saveExperimentRun({
      experimentId: "exp-12",
      experimentTitle: "Supervised Text Classification & Evaluation",
      moduleName: "Text Classification",
      parameters: { datasetName, samplesCount: dataset.length, splitRatio },
      metricsSummary: {
        accuracy: experiment.accuracy,
        macroPrecision: experiment.macroPrecision,
        macroRecall: experiment.macroRecall,
        macroF1: experiment.macroF1,
      },
    }).catch(() => null);

    return NextResponse.json({ experiment, prediction });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Classification experiment failed.";
    console.error("[/api/classification]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

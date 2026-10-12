import { NextRequest, NextResponse } from "next/server";
import { getExperimentRuns, saveExperimentRun } from "@/lib/repository";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") || 30);
    const runs = await getExperimentRuns(limit);
    return NextResponse.json({ runs });
  } catch (err) {
    console.error("[/api/history GET]", err);
    return NextResponse.json({ error: "Failed to retrieve experiment history." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.experimentId || !body.experimentTitle) {
      return NextResponse.json({ error: "experimentId and experimentTitle are required." }, { status: 400 });
    }

    const saved = await saveExperimentRun({
      experimentId: body.experimentId,
      experimentTitle: body.experimentTitle,
      moduleName: body.moduleName || "NLP Lab",
      docName: body.docName,
      parameters: body.parameters,
      metricsSummary: body.metricsSummary,
    });

    return NextResponse.json({ saved });
  } catch (err) {
    console.error("[/api/history POST]", err);
    return NextResponse.json({ error: "Failed to save experiment run." }, { status: 500 });
  }
}

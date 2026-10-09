import { NextRequest, NextResponse } from "next/server";
import { saveReport } from "@/lib/repository";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid report payload." }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title : "NLP Analysis Report";
    const docName = typeof body.docName === "string" ? body.docName : "Unknown Document";

    const persistence = await saveReport({
      title,
      docName,
      payload: body,
    });

    return NextResponse.json({ ok: true, persistence });
  } catch (err) {
    console.error("[/api/reports/generate]", err);
    return NextResponse.json({ error: "Failed to save report." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { compareDocuments } from "@/lib/nlp/similarity";
import { saveComparison } from "@/lib/repository";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const docAText = typeof body.docAText === "string" ? body.docAText : "";
    const docBText = typeof body.docBText === "string" ? body.docBText : "";
    const docAName = typeof body.docAName === "string" && body.docAName.trim() ? body.docAName : "Document A";
    const docBName = typeof body.docBName === "string" && body.docBName.trim() ? body.docBName : "Document B";

    if (!docAText.trim() || !docBText.trim()) {
      return NextResponse.json({ error: "Please provide text for both Document A and Document B." }, { status: 400 });
    }

    const result = compareDocuments(docAText, docBText, docAName, docBName);
    const persistence = await saveComparison(result);
    return NextResponse.json({ result, persistence });
  } catch (err) {
    console.error("[/api/similarity]", err);
    return NextResponse.json({ error: "Something went wrong while comparing the documents." }, { status: 500 });
  }
}

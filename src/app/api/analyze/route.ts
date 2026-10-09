import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/nlp/pipeline";
import { extractTextFromFile, FileValidationError } from "@/lib/nlp/extractText";
import { saveAnalysis } from "@/lib/repository";

export const runtime = "nodejs";

const MAX_CHARS = 200_000;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let text = "";
    let docName = "Pasted Text";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
      }
      text = await extractTextFromFile(file);
      docName = file.name;
    } else {
      const body = await req.json();
      text = typeof body.text === "string" ? body.text : "";
      docName = typeof body.docName === "string" && body.docName.trim() ? body.docName : "Pasted Text";
    }

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text was provided. Please paste text or upload a document." }, { status: 400 });
    }

    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS);
    }

    const result = analyzeDocument(text, docName);
    const persistence = await saveAnalysis(docName, text, result);
    return NextResponse.json({ result, persistence });
  } catch (err) {
    if (err instanceof FileValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[/api/analyze]", err);
    return NextResponse.json({ error: "Something went wrong while analyzing the document. Please try again." }, { status: 500 });
  }
}

// Safe file handling & text extraction for uploaded .txt and .pdf documents.
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = new Set(["txt", "pdf"]);

export class FileValidationError extends Error {}

function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function assertValidUpload(filename: string, size: number) {
  const ext = getExtension(filename);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new FileValidationError("Unsupported file type. Please upload a .txt or .pdf file.");
  }
  if (size > MAX_FILE_SIZE_BYTES) {
    throw new FileValidationError("File is too large. Maximum allowed size is 5 MB.");
  }
}

/** Extract plain text from an uploaded File (txt or pdf), with safe error handling. */
export async function extractTextFromFile(file: File): Promise<string> {
  assertValidUpload(file.name, file.size);
  const ext = getExtension(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (ext === "txt") {
    const text = buffer.toString("utf-8");
    if (!text.trim()) throw new FileValidationError("The uploaded text file is empty.");
    return text;
  }

  if (ext === "pdf") {
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        const text = result.text ?? "";
        if (!text.trim()) {
          throw new FileValidationError("No extractable text was found in this PDF (it may be scanned/image-based).");
        }
        return text;
      } finally {
        await parser.destroy();
      }
    } catch (err) {
      if (err instanceof FileValidationError) throw err;
      throw new FileValidationError("Could not read this PDF file. It may be corrupted, encrypted or image-based.");
    }
  }

  throw new FileValidationError("Unsupported file type.");
}

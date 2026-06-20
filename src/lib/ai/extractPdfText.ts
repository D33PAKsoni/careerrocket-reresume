
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export interface ExtractResult {
  success: true;
  text: string;
}

export interface ExtractError {
  success: false;
  error: string;
}


export async function extractPdfText(
  buffer: Buffer
): Promise<ExtractResult | ExtractError> {
  try {
    const result = await pdfParse(buffer);
    const text = result.text?.trim() ?? "";

    if (text.length < 30) {
      return {
        success: false,
        error: "We couldn't read any text from this PDF. It may be a scanned image rather than a text-based document.",
      };
    }

    return { success: true, text };
  } catch {
    return {
      success: false,
      error: "This file couldn't be opened as a PDF. Please make sure it's a valid, non-corrupted PDF file.",
    };
  }
}

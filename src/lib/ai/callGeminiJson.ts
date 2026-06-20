import type { ZodSchema } from "zod";
import { getGeminiClient, GEMINI_MODEL } from "./gemini";

interface CallResult<T> {
  success: true;
  data: T;
}
interface CallError {
  success: false;
  error: string;
}

function stripMarkdownFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}


export async function callGeminiJson<T>(
  systemPrompt: string,
  userMessage: string,
  schema: ZodSchema<T>
): Promise<CallResult<T> | CallError> {
  const retrySystemPrompt = `${systemPrompt}

CRITICAL: Your previous response was not valid JSON or did not match the required schema. This time, output ONLY the raw JSON object — starting with { and ending with } — with absolutely no markdown formatting, no code fences (no \`\`\`), and no text before or after the JSON.`;

  for (const [attempt, prompt] of [
    [1, systemPrompt],
    [2, retrySystemPrompt],
  ] as const) {
    try {
      const client = getGeminiClient();
      const model = client.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: prompt,
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 4096,
        },
      });

      const result = await model.generateContent(userMessage);
      const text = result.response.text();
      if (!text) throw new Error("Empty response from Gemini");

      const cleaned = stripMarkdownFences(text);
      const json = JSON.parse(cleaned);
      const parsed = schema.safeParse(json);

      if (parsed.success) {
        return { success: true, data: parsed.data };
      }

      if (attempt === 2) {
        return {
          success: false,
          error: "The AI's response didn't match the expected format after a retry. Please try generating again.",
        };
      }
    } catch (err) {
      if (attempt === 2) {
        const message = err instanceof Error ? err.message : "Unknown error";

        if (/quota|rate limit|429/i.test(message)) {
          return {
            success: false,
            error: "Gemini's free tier rate limit was hit. Please wait a minute and try again.",
          };
        }
        return {
          success: false,
          error: "AI generation failed. Please try again in a moment.",
        };
      }
    }
  }

  return { success: false, error: "Unknown generation error." };
}

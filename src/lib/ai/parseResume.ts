import { getGeminiClient, GEMINI_MODEL } from "./gemini";
import { ParsedResumeSchema, type ParsedResume } from "./resumeSchema";

const SYSTEM_PROMPT = `You are a resume-parsing engine. You are given raw text extracted from a PDF resume or LinkedIn export. Your only job is to extract structured data from it and return STRICT JSON matching the schema below — nothing else.

Rules:
- Output ONLY valid JSON. No markdown code fences, no preamble, no explanation, no trailing commentary.
- If a field isn't present in the text, use null (for single values) or an empty array (for lists). Never invent data that isn't in the source text.
- For dates, use "YYYY-MM" format when only month/year is known, or "YYYY-MM-DD" if a full date is given. If a role is ongoing, set is_current to true and end_date to null.
- Preserve the person's own wording for descriptions and bullet points — do not rewrite or embellish them.
- Map loosely related resume sections sensibly: "Work Experience", "Internships", and "Employment History" all map to "experiences". "Personal Projects", "Academic Projects", and "Portfolio" all map to "projects".
- Skills should be split into individual atomic entries (e.g. "Python, React, Docker" becomes three separate skill objects), with a best-guess category such as "Language", "Framework", "Tool", "Cloud", or "Database" where obvious — otherwise null.

Schema:
{
  "full_name": string | null,
  "headline": string | null,
  "location": string | null,
  "phone": string | null,
  "github_url": string | null,
  "linkedin_url": string | null,
  "website_url": string | null,
  "education": [{ "institution": string, "degree": string|null, "field_of_study": string|null, "start_year": number|null, "end_year": number|null, "grade": string|null }],
  "experiences": [{ "role": string, "organisation": string, "location": string|null, "start_date": string|null, "end_date": string|null, "is_current": boolean, "description": string|null }],
  "projects": [{ "title": string, "description": string|null, "tech_stack": string|null, "link": string|null, "repo_link": string|null }],
  "skills": [{ "name": string, "category": string|null }],
  "certifications": [{ "title": string, "issuer": string|null, "issue_date": string|null, "expiry_date": string|null, "credential_url": string|null }]
}`;

const RETRY_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

CRITICAL: Your previous response was not valid JSON or did not match the schema. This time, output ONLY the raw JSON object — starting with { and ending with } — with absolutely no markdown formatting, no code fences (no \`\`\`), and no text before or after the JSON.`;

interface ParseResult {
  success: true;
  data: ParsedResume;
}

interface ParseError {
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

async function callGeminiForExtraction(
  resumeText: string,
  systemPrompt: string
): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
    },
  });

  const result = await model.generateContent(
    `Here is the raw extracted resume text:\n\n${resumeText}`
  );

  const text = result.response.text();
  if (!text) {
    throw new Error("AI response contained no text content");
  }
  return text;
}


export async function parseResumeText(resumeText: string): Promise<ParseResult | ParseError> {
  if (!resumeText || resumeText.trim().length < 30) {
    return {
      success: false,
      error: "The uploaded file doesn't contain enough readable text to parse. It may be a scanned image or empty.",
    };
  }

  for (const [attempt, systemPrompt] of [
    [1, SYSTEM_PROMPT],
    [2, RETRY_SYSTEM_PROMPT],
  ] as const) {
    try {
      const raw = await callGeminiForExtraction(resumeText, systemPrompt);
      const cleaned = stripMarkdownFences(raw);
      const json = JSON.parse(cleaned);
      const result = ParsedResumeSchema.safeParse(json);

      if (result.success) {
        return { success: true, data: result.data };
      }


      if (attempt === 2) {
        return {
          success: false,
          error: "The AI's extraction didn't match the expected format after a retry. Please fill the form manually.",
        };
      }
    } catch {

      if (attempt === 2) {
        return {
          success: false,
          error: "Resume parsing failed after a retry. Please fill the form manually or try a different file.",
        };
      }
    }
  }

  return { success: false, error: "Unknown parsing error." };
}
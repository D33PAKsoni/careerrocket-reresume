import { callGeminiJson } from "./callGeminiJson";
import { JobExtractionSchema, type JobExtraction } from "./generationSchemas";

const SYSTEM_PROMPT = `You extract structured data from a job description. Return STRICT JSON only.

Rules:
- "company_name": the hiring company's name if mentioned, otherwise null.
- "role_name": the job title being advertised, otherwise null.
- "keywords": a flat array of 15-30 single or short multi-word terms that an ATS (applicant tracking system) would scan for — skills, tools, technologies, certifications, methodologies, and key responsibility phrases. Use the casing and phrasing as they appear in the JD (e.g. "React", "CI/CD", "stakeholder management"). Do not include generic filler words like "team player" or "good communication" unless the JD explicitly lists them as a requirement. Deduplicate.

Schema:
{ "company_name": string|null, "role_name": string|null, "keywords": string[] }`;

export async function extractJobTarget(
  jobDescriptionText: string
): Promise<{ success: true; data: JobExtraction } | { success: false; error: string }> {
  if (!jobDescriptionText || jobDescriptionText.trim().length < 20) {
    return { success: false, error: "Job description is too short to extract keywords from." };
  }

  return callGeminiJson(SYSTEM_PROMPT, jobDescriptionText, JobExtractionSchema);
}

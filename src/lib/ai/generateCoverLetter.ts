import { callGeminiJson } from "./callGeminiJson";
import {
  CoverLetterGenerationSchema,
  ParagraphRegenerationSchema,
  type CoverLetterGeneration,
  type ParagraphRegeneration,
} from "./generationSchemas";
import type { ProfileBundle, GenerationTone } from "@/types/profile";

const TONE_DESCRIPTIONS: Record<GenerationTone, string> = {
  formal: "formal and professional, traditional corporate register, no contractions",
  balanced: "professional but warm and natural, the default tone for most applications",
  enthusiastic: "energetic and genuinely excited, while staying professional — convey real enthusiasm for the role without sounding over-the-top",
};

function formatProfileForPrompt(bundle: ProfileBundle): string {
  const { profile, experiences, projects, skills } = bundle;
  const lines: string[] = [];
  lines.push(`Name: ${profile?.full_name ?? "Unknown"}`);
  if (profile?.headline) lines.push(`Headline: ${profile.headline}`);

  if (experiences.length) {
    lines.push("\nExperience:");
    experiences.forEach((e) =>
      lines.push(`- ${e.role} at ${e.organisation}: ${e.description ?? "(no details provided)"}`)
    );
  }

  if (projects.length) {
    lines.push("\nProjects:");
    projects.forEach((p) => lines.push(`- ${p.title}: ${p.description ?? "(no details provided)"}`));
  }

  if (skills.length) {
    lines.push(`\nSkills: ${skills.map((s) => s.name).join(", ")}`);
  }

  return lines.join("\n");
}

const BASE_RULES = `Rules:
- Never invent specific numbers, achievements, or facts not present in the profile data.
- Do not address the letter to a named person unless one is given — use "Dear Hiring Team" framing implicitly (do not include a salutation or sign-off, just the body paragraphs).
- Output ONLY valid JSON. No markdown code fences, no preamble, no commentary.`;

interface GenerateCoverLetterParams {
  bundle: ProfileBundle;
  jobDescription: string | null;
  companyName: string | null;
  roleName: string | null;
  tone: GenerationTone;
}

export async function generateFullCoverLetter(
  params: GenerateCoverLetterParams
): Promise<{ success: true; data: CoverLetterGeneration } | { success: false; error: string }> {
  const { bundle, jobDescription, companyName, roleName, tone } = params;

  const contextLines: string[] = [];
  if (companyName) contextLines.push(`Company: ${companyName}`);
  if (roleName) contextLines.push(`Role: ${roleName}`);
  if (jobDescription) contextLines.push(`Job description:\n"""\n${jobDescription}\n"""`);

  const systemPrompt = `You are a professional cover letter writer. Write a three-paragraph cover letter body for this student, in a tone that is ${TONE_DESCRIPTIONS[tone]}.

Paragraph structure:
1. "hook" — an opening paragraph expressing genuine interest in the role/company and a one-line statement of who the candidate is.
2. "evidence" — a paragraph connecting 1-2 specific pieces of the candidate's real experience/projects to what the role likely needs.
3. "close" — a confident closing paragraph reiterating interest and inviting next steps.

${BASE_RULES}

${contextLines.length ? contextLines.join("\n") : "No company, role, or job description context was provided — write a strong, generalist cover letter."}

Schema: { "hook": string, "evidence": string, "close": string }`;

  const userMessage = formatProfileForPrompt(bundle);
  return callGeminiJson(systemPrompt, userMessage, CoverLetterGenerationSchema);
}

export async function regenerateCoverLetterParagraph(
  params: GenerateCoverLetterParams & { paragraph: "hook" | "evidence" | "close" }
): Promise<{ success: true; data: ParagraphRegeneration } | { success: false; error: string }> {
  const { bundle, jobDescription, companyName, roleName, tone, paragraph } = params;

  const paragraphInstructions: Record<typeof paragraph, string> = {
    hook: "an opening paragraph expressing genuine interest in the role/company and a one-line statement of who the candidate is",
    evidence: "a paragraph connecting 1-2 specific pieces of the candidate's real experience/projects to what the role likely needs",
    close: "a confident closing paragraph reiterating interest and inviting next steps",
  };

  const contextLines: string[] = [];
  if (companyName) contextLines.push(`Company: ${companyName}`);
  if (roleName) contextLines.push(`Role: ${roleName}`);
  if (jobDescription) contextLines.push(`Job description:\n"""\n${jobDescription}\n"""`);

  const systemPrompt = `You are a professional cover letter writer. Write ONLY ${paragraphInstructions[paragraph]}, in a tone that is ${TONE_DESCRIPTIONS[tone]}.

${BASE_RULES}

${contextLines.length ? contextLines.join("\n") : "No company, role, or job description context was provided."}

Schema: { "text": string }`;

  const userMessage = formatProfileForPrompt(bundle);
  return callGeminiJson(systemPrompt, userMessage, ParagraphRegenerationSchema);
}

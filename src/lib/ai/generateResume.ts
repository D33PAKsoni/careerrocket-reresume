import { callGeminiJson } from "./callGeminiJson";
import {
  ResumeGenerationSchema,
  SummaryRegenerationSchema,
  BulletsRegenerationSchema,
  type ResumeGeneration,
  type SummaryRegeneration,
  type BulletsRegeneration,
} from "./generationSchemas";
import type { ProfileBundle } from "@/types/profile";

function formatProfileForPrompt(bundle: ProfileBundle): string {
  const { profile, education, experiences, projects, skills, certifications } = bundle;

  const lines: string[] = [];
  lines.push(`Name: ${profile?.full_name ?? "Unknown"}`);
  if (profile?.headline) lines.push(`Current headline: ${profile.headline}`);
  if (profile?.location) lines.push(`Location: ${profile.location}`);

  if (education.length) {
    lines.push("\nEducation:");
    education.forEach((e) =>
      lines.push(`- ${e.institution}, ${[e.degree, e.field_of_study].filter(Boolean).join(" in ")} (${e.start_year ?? "?"}–${e.end_year ?? "present"})${e.grade ? `, grade: ${e.grade}` : ""}`)
    );
  }

  if (experiences.length) {
    lines.push("\nExperience (use experience.id as the JSON key for bullets):");
    experiences.forEach((e) =>
      lines.push(`- [id: ${e.id}] ${e.role} at ${e.organisation}${e.location ? `, ${e.location}` : ""} (${e.start_date ?? "?"} to ${e.is_current ? "present" : e.end_date ?? "?"}). Raw notes: ${e.description ?? "(none provided — infer reasonable, conservative responsibilities from the role title and organisation only; do not invent specific metrics or achievements)"}`)
    );
  }

  if (projects.length) {
    lines.push("\nProjects (use project.id as the JSON key for bullets):");
    projects.forEach((p) =>
      lines.push(`- [id: ${p.id}] ${p.title}${p.tech_stack ? ` (${p.tech_stack})` : ""}. Raw notes: ${p.description ?? "(none provided)"}`)
    );
  }

  if (skills.length) {
    lines.push(`\nSkills: ${skills.map((s) => s.name).join(", ")}`);
  }

  if (certifications.length) {
    lines.push(`\nCertifications: ${certifications.map((c) => `${c.title}${c.issuer ? ` (${c.issuer})` : ""}`).join(", ")}`);
  }

  return lines.join("\n");
}

const BASE_RULES = `Rules:
- Never invent specific numbers, metrics, client names, or achievements that aren't implied by the raw notes provided. If raw notes are sparse, write conservative, plausible responsibilities based on the role title and organisation — do not fabricate impact statistics.
- Use strong action verbs, concise professional language, and resume-appropriate phrasing (no first person "I", no filler).
- Each bullet point should be one line, ideally 12-22 words.
- Output ONLY valid JSON. No markdown code fences, no preamble, no commentary.`;


function buildFullGenerationPrompt(jobDescription: string | null): string {
  const jdInstruction = jobDescription
    ? `\n\nThe student is targeting this specific job description — tailor the summary and bullet points to emphasise relevant skills and terminology from it where truthfully applicable. Do not claim experience or skills the student doesn't have. Job description:\n"""\n${jobDescription}\n"""`
    : "\n\nNo specific job description was provided — write a strong, generalist version suitable for the student's apparent field.";

  return `You are a professional resume writer. Given a student's profile data, write resume content: a professional summary (2-3 sentences, no more than 50 words) and bullet points for each experience and project entry.
${BASE_RULES}
${jdInstruction}

Schema:
{
  "summary": string,
  "experienceBullets": { "<experience_id>": string[] },
  "projectBullets": { "<project_id>": string[] }
}

Include an entry in experienceBullets for every experience id given, and in projectBullets for every project id given, with 2-4 bullets each.`;
}

export async function generateFullResume(
  bundle: ProfileBundle,
  jobDescription: string | null
): Promise<{ success: true; data: ResumeGeneration } | { success: false; error: string }> {
  const systemPrompt = buildFullGenerationPrompt(jobDescription);
  const userMessage = formatProfileForPrompt(bundle);
  return callGeminiJson(systemPrompt, userMessage, ResumeGenerationSchema);
}


export async function regenerateSummary(
  bundle: ProfileBundle,
  jobDescription: string | null
): Promise<{ success: true; data: SummaryRegeneration } | { success: false; error: string }> {
  const jdInstruction = jobDescription
    ? `Tailor it to this job description where truthfully applicable:\n"""\n${jobDescription}\n"""`
    : "No specific job description was provided — write a strong, generalist version.";

  const systemPrompt = `You are a professional resume writer. Write ONLY a professional summary (2-3 sentences, max 50 words) for this student's resume, based on their profile data below.
${BASE_RULES}

${jdInstruction}

Schema: { "summary": string }`;

  const userMessage = formatProfileForPrompt(bundle);
  return callGeminiJson(systemPrompt, userMessage, SummaryRegenerationSchema);
}

export async function regenerateExperienceBullets(
  bundle: ProfileBundle,
  experienceId: string,
  jobDescription: string | null
): Promise<{ success: true; data: BulletsRegeneration } | { success: false; error: string }> {
  const exp = bundle.experiences.find((e) => e.id === experienceId);
  if (!exp) return { success: false, error: "Experience entry not found." };

  const jdInstruction = jobDescription
    ? `Tailor the bullets to emphasise relevant terms from this job description where truthfully applicable:\n"""\n${jobDescription}\n"""`
    : "No specific job description was provided.";

  const systemPrompt = `You are a professional resume writer. Write 2-4 resume bullet points for ONE specific work experience entry.
${BASE_RULES}

${jdInstruction}

Schema: { "bullets": string[] }`;

  const userMessage = `Role: ${exp.role}\nOrganisation: ${exp.organisation}${exp.location ? `\nLocation: ${exp.location}` : ""}\nDuration: ${exp.start_date ?? "?"} to ${exp.is_current ? "present" : exp.end_date ?? "?"}\nRaw notes: ${exp.description ?? "(none provided — infer conservative responsibilities from the role and organisation only)"}`;

  return callGeminiJson(systemPrompt, userMessage, BulletsRegenerationSchema);
}

export async function regenerateProjectBullets(
  bundle: ProfileBundle,
  projectId: string,
  jobDescription: string | null
): Promise<{ success: true; data: BulletsRegeneration } | { success: false; error: string }> {
  const proj = bundle.projects.find((p) => p.id === projectId);
  if (!proj) return { success: false, error: "Project entry not found." };

  const jdInstruction = jobDescription
    ? `Tailor the bullets to emphasise relevant terms from this job description where truthfully applicable:\n"""\n${jobDescription}\n"""`
    : "No specific job description was provided.";

  const systemPrompt = `You are a professional resume writer. Write 2-4 resume bullet points for ONE specific project entry.
${BASE_RULES}

${jdInstruction}

Schema: { "bullets": string[] }`;

  const userMessage = `Project: ${proj.title}${proj.tech_stack ? `\nTech stack: ${proj.tech_stack}` : ""}\nRaw notes: ${proj.description ?? "(none provided)"}`;

  return callGeminiJson(systemPrompt, userMessage, BulletsRegenerationSchema);
}

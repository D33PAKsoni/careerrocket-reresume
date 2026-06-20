import { callGeminiJson } from "./callGeminiJson";
import { LinkedInGenerationSchema, type LinkedInGeneration } from "./generationSchemas";
import type { ProfileBundle } from "@/types/profile";

const HEADLINE_LIMIT = 220;
const ABOUT_LIMIT = 2600;

function formatProfileForPrompt(bundle: ProfileBundle): string {
  const { profile, education, experiences, projects, skills, certifications } = bundle;
  const lines: string[] = [];
  lines.push(`Name: ${profile?.full_name ?? "Unknown"}`);
  if (profile?.headline) lines.push(`Current headline: ${profile.headline}`);
  if (profile?.location) lines.push(`Location: ${profile.location}`);

  if (education.length) {
    lines.push("\nEducation:");
    education.forEach((e) => lines.push(`- ${e.institution}, ${[e.degree, e.field_of_study].filter(Boolean).join(" in ")}`));
  }

  if (experiences.length) {
    lines.push("\nExperience:");
    experiences.forEach((e) => lines.push(`- ${e.role} at ${e.organisation}: ${e.description ?? "(no details)"}`));
  }

  if (projects.length) {
    lines.push("\nProjects:");
    projects.forEach((p) => lines.push(`- ${p.title}${p.tech_stack ? ` (${p.tech_stack})` : ""}: ${p.description ?? "(no details)"}`));
  }

  if (skills.length) lines.push(`\nSkills: ${skills.map((s) => s.name).join(", ")}`);
  if (certifications.length) lines.push(`\nCertifications: ${certifications.map((c) => c.title).join(", ")}`);

  return lines.join("\n");
}

export async function generateLinkedInContent(
  bundle: ProfileBundle,
  jobDescription: string | null
): Promise<{ success: true; data: LinkedInGeneration } | { success: false; error: string }> {
  const jdInstruction = jobDescription
    ? `Tailor the keyword choices toward this job description's domain where truthfully applicable:\n"""\n${jobDescription}\n"""`
    : "No specific job description was provided — optimise for general discoverability in the student's apparent field.";

  const systemPrompt = `You are a LinkedIn profile copywriter. Write a headline and an About summary for this student.

- "headline": MUST be ${HEADLINE_LIMIT} characters or fewer. Punchy, keyword-rich, no buzzword soup — should read like a real person, not a list of hashtags. Format loosely like "Role/Field · Key skill · Status" but adapt naturally.
- "about": MUST be ${ABOUT_LIMIT} characters or fewer, written in first person ("I..."), 2-4 short paragraphs covering background, key skills/technologies, and what the student is looking for or passionate about. Natural, human tone — not a bullet list, not corporate jargon.
- Never invent specific numbers, achievements, or facts not present in the profile data.

${jdInstruction}

Output ONLY valid JSON, no markdown fences, no commentary.
Schema: { "headline": string, "about": string }`;

  const userMessage = formatProfileForPrompt(bundle);
  const result = await callGeminiJson(systemPrompt, userMessage, LinkedInGenerationSchema);

  if (!result.success) return result;

  const data: LinkedInGeneration = {
    headline: result.data.headline.slice(0, HEADLINE_LIMIT),
    about: result.data.about.slice(0, ABOUT_LIMIT),
  };

  return { success: true, data };
}

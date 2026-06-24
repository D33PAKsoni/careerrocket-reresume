import { callGeminiJson } from "@/lib/ai/callGeminiJson";
import { GreenCareersResponseSchema, type GreenCareersResponse } from "./schemas";
import type { RedactedProfileForAI } from "./redactProfile";

const SYSTEM_PROMPT = `You are a sustainability-focused career advisor helping a student or early-career professional discover "green" career paths — roles connected to environmental sustainability, climate action, clean energy, conservation, or sustainable industry — that genuinely fit their actual background.

You will receive a redacted profile: education, work experience, projects, skills, and certifications, with names, employers, and contact details already removed. Treat this as the complete picture of the person's career-relevant background.

Rules:
- Suggest 3 to 6 green job roles. Every role must be plausibly reachable from this specific person's actual skills and background — do not suggest roles requiring credentials or experience they show no sign of (e.g. don't suggest "Renewable Energy Engineer" for someone with zero engineering or technical background unless their skills genuinely transfer).
- For each role, name a relevant SDG it connects to (e.g. "SDG 7: Affordable and Clean Energy", "SDG 13: Climate Action", "SDG 11: Sustainable Cities and Communities", "SDG 15: Life on Land", "SDG 12: Responsible Consumption and Production"). Use the most fitting one — don't force-fit if a role's connection is weak.
- "whyThisFits" must reference specific, real elements from their profile (a skill, a project, a field of study) — never generic filler that could apply to anyone.
- "transferableSkills" lists what they already have that applies directly. "skillsToBuild" lists realistic gaps — be honest, not falsely encouraging.
- "roadmap" is 3-6 ordered, concrete steps to move toward that role from where they are now (not generic "learn the basics" advice).
- For "resources", provide 2-3 search queries (not URLs — you cannot verify a specific link exists, so never fabricate one) that would surface genuinely useful learning material. Make queries specific enough to be useful: e.g. "IPCC climate science fundamentals for beginners" rather than "climate change".
- Never invent specific companies, job postings, salary figures, or statistics not grounded in general knowledge.
- Output ONLY valid JSON, no markdown fences, no commentary.

Schema:
{
  "roles": [
    {
      "title": string,
      "sdgAlignment": string,
      "whyThisFits": string,
      "transferableSkills": string[],
      "skillsToBuild": string[],
      "roadmap": [{ "step": string, "description": string }],
      "resources": [{ "type": "article" | "video" | "course", "query": string, "label": string }]
    }
  ]
}`;

function formatRedactedProfile(profile: RedactedProfileForAI): string {
  const lines: string[] = [];

  if (profile.headline) lines.push(`Headline: ${profile.headline}`);

  if (profile.education.length) {
    lines.push("\nEducation:");
    profile.education.forEach((e) =>
      lines.push(`- ${[e.degree, e.fieldOfStudy].filter(Boolean).join(" in ")}${e.yearsOfStudy ? ` (${e.yearsOfStudy})` : ""}`)
    );
  }

  if (profile.experience.length) {
    lines.push("\nExperience:");
    profile.experience.forEach((e) =>
      lines.push(`- ${e.role}${e.durationMonths ? ` (~${Math.round(e.durationMonths / 12 * 10) / 10} years)` : ""}: ${e.description ?? "(no description provided)"}`)
    );
  }

  if (profile.projects.length) {
    lines.push("\nProjects:");
    profile.projects.forEach((p) =>
      lines.push(`- ${p.title}${p.techStack ? ` (${p.techStack})` : ""}: ${p.description ?? "(no description provided)"}`)
    );
  }

  if (profile.skills.length) lines.push(`\nSkills: ${profile.skills.join(", ")}`);
  if (profile.certifications.length) lines.push(`\nCertifications: ${profile.certifications.join(", ")}`);

  return lines.join("\n");
}

export async function generateGreenCareers(
  redactedProfile: RedactedProfileForAI
): Promise<{ success: true; data: GreenCareersResponse } | { success: false; error: string }> {
  const userMessage = formatRedactedProfile(redactedProfile);

  if (!userMessage.trim()) {
    return {
      success: false,
      error: "Your profile doesn't have enough information yet. Add some education, experience, projects, or skills first.",
    };
  }

  return callGeminiJson(SYSTEM_PROMPT, userMessage, GreenCareersResponseSchema);
}

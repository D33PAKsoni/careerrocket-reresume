import type { ProfileBundle } from "@/types/profile";

export interface RedactedProfileForAI {
  headline: string | null;
  education: { degree: string | null; fieldOfStudy: string | null; yearsOfStudy: string | null }[];
  experience: { role: string; durationMonths: number | null; description: string | null }[];
  projects: { title: string; description: string | null; techStack: string | null }[];
  skills: string[];
  certifications: string[];
}

function estimateDurationMonths(start: string | null, end: string | null, isCurrent: boolean): number | null {
  if (!start) return null;
  const startDate = new Date(start);
  const endDate = isCurrent || !end ? new Date() : new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  return Math.max(0, months);
}


export function redactProfileForAI(bundle: ProfileBundle): RedactedProfileForAI {
  const { profile, education, experiences, projects, skills, certifications } = bundle;

  return {
    headline: profile?.headline ?? null,

    education: education.map((e) => ({
      degree: e.degree,
      fieldOfStudy: e.field_of_study,

      yearsOfStudy:
        e.start_year && e.end_year ? `${Math.max(0, e.end_year - e.start_year)} years` : null,
    })),

    experience: experiences.map((exp) => ({
      role: exp.role,
      durationMonths: estimateDurationMonths(exp.start_date, exp.end_date, exp.is_current),
      description: exp.description,
    })),


    projects: projects.map((p) => ({
      title: p.title,
      description: p.description,
      techStack: p.tech_stack,
    })),

    skills: skills.map((s) => s.name),

    certifications: certifications.map((c) => (c.issuer ? `${c.title} (${c.issuer})` : c.title)),
  };
}

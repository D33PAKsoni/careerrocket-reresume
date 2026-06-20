import type { ProfileBundle, ResumeContent } from "@/types/profile";

export interface ResumeEducationRow {
  institution: string;
  degreeAndField: string;
  years: string;
  grade: string | null;
}

export interface ResumeExperienceRow {
  id: string;
  role: string;
  organisation: string;
  location: string | null;
  dateRange: string;
  bullets: string[];
  description: string | null;
}

export interface ResumeProjectRow {
  id: string;
  title: string;
  techStack: string | null;
  bullets: string[];
  description: string | null;
}

export interface ShapedResumeData {
  fullName: string;
  headline: string | null;
  contactLine: string; // pre-joined "Location · Phone · LinkedIn · GitHub · Portfolio"
  summary: string | null;
  education: ResumeEducationRow[];
  experience: ResumeExperienceRow[];
  projects: ResumeProjectRow[];
  skillsByCategory: { category: string; names: string[] }[];
  certifications: { title: string; issuer: string | null }[];
}

function formatDateRange(start: string | null, end: string | null, isCurrent: boolean): string {
  const fmt = (d: string | null) => {
    if (!d) return "";
    const [year, month] = d.split("-");
    const parsedMonth = Number(month);
    if (!year || Number.isNaN(parsedMonth)) return "";
    return new Date(Number(year), parsedMonth - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  const startLabel = fmt(start);
  const endLabel = isCurrent ? "Present" : fmt(end);
  if (!startLabel && !endLabel) return "";
  return `${startLabel} — ${endLabel}`;
}


export function shapeResumeData(bundle: ProfileBundle, content: ResumeContent | null): ShapedResumeData {
  const { profile, education, experiences, projects, skills, certifications } = bundle;

  const contactParts = [
    profile?.location,
    profile?.phone,
    profile?.linkedin_url ? "LinkedIn" : null,
    profile?.github_url ? "GitHub" : null,
    profile?.website_url ? "Portfolio" : null,
  ].filter(Boolean) as string[];

  const skillsByCategory = Object.entries(
    skills.reduce<Record<string, string[]>>((acc, s) => {
      const cat = s.category ?? "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s.name);
      return acc;
    }, {})
  ).map(([category, names]) => ({ category, names }));

  return {
    fullName: profile?.full_name ?? "",
    headline: profile?.headline ?? null,
    contactLine: contactParts.join(" · "),
    summary: content?.summary ?? null,
    education: education.map((e) => ({
      institution: e.institution,
      degreeAndField: [e.degree, e.field_of_study].filter(Boolean).join(", "),
      years: e.start_year ? `${e.start_year}${e.end_year ? ` — ${e.end_year}` : ""}` : "",
      grade: e.grade,
    })),
    experience: experiences.map((e) => ({
      id: e.id,
      role: e.role,
      organisation: e.organisation,
      location: e.location,
      dateRange: formatDateRange(e.start_date, e.end_date, e.is_current),
      bullets: content?.experienceBullets?.[e.id] ?? [],
      description: e.description,
    })),
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      techStack: p.tech_stack,
      bullets: content?.projectBullets?.[p.id] ?? [],
      description: p.description,
    })),
    skillsByCategory,
    certifications: certifications.map((c) => ({ title: c.title, issuer: c.issuer })),
  };
}

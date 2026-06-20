import { z } from "zod";

export const ParsedEducationSchema = z.object({
  institution: z.string(),
  degree: z.string().nullable().optional(),
  field_of_study: z.string().nullable().optional(),
  start_year: z.number().int().nullable().optional(),
  end_year: z.number().int().nullable().optional(),
  grade: z.string().nullable().optional(),
});

export const ParsedExperienceSchema = z.object({
  role: z.string(),
  organisation: z.string(),
  location: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(), // "YYYY-MM" or "YYYY-MM-DD"
  end_date: z.string().nullable().optional(),
  is_current: z.boolean().optional().default(false),
  description: z.string().nullable().optional(),
});

export const ParsedProjectSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  tech_stack: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  repo_link: z.string().nullable().optional(),
});

export const ParsedSkillSchema = z.object({
  name: z.string(),
  category: z.string().nullable().optional(),
});

export const ParsedCertificationSchema = z.object({
  title: z.string(),
  issuer: z.string().nullable().optional(),
  issue_date: z.string().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  credential_url: z.string().nullable().optional(),
});

export const ParsedResumeSchema = z.object({
  full_name: z.string().nullable().optional(),
  headline: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  github_url: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  education: z.array(ParsedEducationSchema).default([]),
  experiences: z.array(ParsedExperienceSchema).default([]),
  projects: z.array(ParsedProjectSchema).default([]),
  skills: z.array(ParsedSkillSchema).default([]),
  certifications: z.array(ParsedCertificationSchema).default([]),
});

export type ParsedResume = z.infer<typeof ParsedResumeSchema>;

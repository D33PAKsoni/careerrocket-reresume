import { z } from "zod";


export const JobExtractionSchema = z.object({
  company_name: z.string().nullable().optional(),
  role_name: z.string().nullable().optional(),
  keywords: z.array(z.string()).default([]),
});
export type JobExtraction = z.infer<typeof JobExtractionSchema>;


export const ResumeGenerationSchema = z.object({
  summary: z.string(),
  experienceBullets: z.record(z.string(), z.array(z.string())).default({}),
  projectBullets: z.record(z.string(), z.array(z.string())).default({}),
});
export type ResumeGeneration = z.infer<typeof ResumeGenerationSchema>;


export const SummaryRegenerationSchema = z.object({
  summary: z.string(),
});
export type SummaryRegeneration = z.infer<typeof SummaryRegenerationSchema>;

export const BulletsRegenerationSchema = z.object({
  bullets: z.array(z.string()),
});
export type BulletsRegeneration = z.infer<typeof BulletsRegenerationSchema>;


export const CoverLetterGenerationSchema = z.object({
  hook: z.string(),
  evidence: z.string(),
  close: z.string(),
});
export type CoverLetterGeneration = z.infer<typeof CoverLetterGenerationSchema>;

export const ParagraphRegenerationSchema = z.object({
  text: z.string(),
});
export type ParagraphRegeneration = z.infer<typeof ParagraphRegenerationSchema>;


export const LinkedInGenerationSchema = z.object({
  headline: z.string(),
  about: z.string(),
});
export type LinkedInGeneration = z.infer<typeof LinkedInGenerationSchema>;

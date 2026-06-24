import { z } from "zod";

export const GreenResourceSchema = z.object({

  type: z.enum(["article", "video", "course"]),
  query: z.string(),
  label: z.string(),
});

export const GreenRoadmapStepSchema = z.object({
  step: z.string(),
  description: z.string(),
});

export const GreenJobRoleSchema = z.object({
  title: z.string(),
  sdgAlignment: z.string(), // e.g. "SDG 7: Affordable and Clean Energy"
  whyThisFits: z.string(),
  transferableSkills: z.array(z.string()).default([]),
  skillsToBuild: z.array(z.string()).default([]),
  roadmap: z.array(GreenRoadmapStepSchema).default([]),
  resources: z.array(GreenResourceSchema).default([]),
});

export const GreenCareersResponseSchema = z.object({
  roles: z.array(GreenJobRoleSchema).min(1).max(6),
});

export type GreenResource = z.infer<typeof GreenResourceSchema>;
export type GreenRoadmapStep = z.infer<typeof GreenRoadmapStepSchema>;
export type GreenJobRole = z.infer<typeof GreenJobRoleSchema>;
export type GreenCareersResponse = z.infer<typeof GreenCareersResponseSchema>;

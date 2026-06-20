
export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  headline: string | null;
  location: string | null;
  phone: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
}

export interface Education {
  id: string;
  profile_id: string;
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
  grade: string | null;
}

export interface Experience {
  id: string;
  profile_id: string;
  role: string;
  organisation: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

export interface Project {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  tech_stack: string | null;
  link: string | null;
  repo_link: string | null;
  is_featured: boolean;
}

export interface Skill {
  id: string;
  profile_id: string;
  name: string;
  category: string | null;
}

export interface Certification {
  id: string;
  profile_id: string;
  title: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_url: string | null;
}

// Completeness returned from the server action
export interface ProfileCompleteness {
  percentage: number;
  sections: {
    basicInfo: boolean;
    education: boolean;
    experience: boolean;
    projects: boolean;
    skills: boolean;
    certifications: boolean;
  };
}

// ── Document types (Phase 5) ─────────────────────────────────────────

export type DocumentType = "resume" | "cover_letter" | "linkedin";
export type DocumentStatus = "draft" | "generated";

export interface ResumeContent {
  summary?: string;
  // Per-experience generated bullet points, keyed by experience id
  experienceBullets?: Record<string, string[]>;
  // Per-project generated bullet points, keyed by project id
  projectBullets?: Record<string, string[]>;
}

export interface CoverLetterContent {
  hook?: string;
  evidence?: string;
  close?: string;
  companyName?: string;
  roleName?: string;
  tone?: "formal" | "balanced" | "enthusiastic";
}

export interface LinkedInContent {
  headline?: string;
  about?: string;
}

export type DocumentContent = ResumeContent | CoverLetterContent | LinkedInContent | null;
export type ResumeTemplate = "classic" | "modern" | "minimal";

export interface Document {
  id: string;
  user_id: string;
  type: DocumentType;
  status: DocumentStatus;
  title: string | null;
  job_description: string | null;
  content: DocumentContent;
  template: ResumeTemplate;
  share_slug: string | null;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  user_id: string;
  content: DocumentContent;
  template: ResumeTemplate;
  label: string | null;
  created_at: string;
}

// Full profile bundle used to render previews — everything the builder needs in one shape
export interface ProfileBundle {
  profile: Profile | null;
  education: Education[];
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
}

// ── AI generation types (Phase 6) ────────────────────────────────────

export interface JobTarget {
  id: string;
  document_id: string;
  user_id: string;
  raw_text: string;
  company_name: string | null;
  role_name: string | null;
  keywords: string[];
  created_at: string;
}

export interface AtsScore {
  percentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

export type GenerationTone = "formal" | "balanced" | "enthusiastic";

// ── Portfolio (Phase 8) ────────────────────────────────────────────────

export interface Portfolio {
  id: string;
  user_id: string;
  slug: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

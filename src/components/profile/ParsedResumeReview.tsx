"use client";

import { useState, useTransition } from "react";
import type { ParsedResume } from "@/lib/ai/resumeSchema";
import {
  saveBasicInfo,
  saveEducation,
  saveExperience,
  saveProject,
  saveSkill,
  saveCertification,
} from "@/app/actions/profile";

interface ParsedResumeReviewProps {
  data: ParsedResume;
  onDismiss: () => void;
  onSaved: () => void;
}

// Editable, locally-mutable copy of the parsed data — nothing here touches
// Supabase until "Save all to profile" is clicked.
export default function ParsedResumeReview({ data, onDismiss, onSaved }: ParsedResumeReviewProps) {
  const [draft, setDraft] = useState<ParsedResume>(data);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof ParsedResume>(key: K, value: ParsedResume[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const removeAt = <T,>(list: T[], index: number): T[] => list.filter((_, i) => i !== index);

  const handleSaveAll = () => {
    setError(null);
    startTransition(async () => {
      try {
        // Basic info
        const basicFd = new FormData();
        basicFd.set("full_name", draft.full_name ?? "");
        basicFd.set("headline", draft.headline ?? "");
        basicFd.set("location", draft.location ?? "");
        basicFd.set("phone", draft.phone ?? "");
        basicFd.set("github_url", draft.github_url ?? "");
        basicFd.set("linkedin_url", draft.linkedin_url ?? "");
        basicFd.set("website_url", draft.website_url ?? "");
        const basicResult = await saveBasicInfo(basicFd);
        if (basicResult.error) throw new Error(basicResult.error);

        // Education
        for (const edu of draft.education) {
          const fd = new FormData();
          fd.set("institution", edu.institution);
          fd.set("degree", edu.degree ?? "");
          fd.set("field_of_study", edu.field_of_study ?? "");
          fd.set("start_year", String(edu.start_year ?? ""));
          fd.set("end_year", String(edu.end_year ?? ""));
          fd.set("grade", edu.grade ?? "");
          const result = await saveEducation(fd);
          if (result.error) throw new Error(`Education (${edu.institution}): ${result.error}`);
        }

        // Experience
        for (const exp of draft.experiences) {
          const fd = new FormData();
          fd.set("role", exp.role);
          fd.set("organisation", exp.organisation);
          fd.set("location", exp.location ?? "");
          fd.set("start_date", exp.start_date ?? "");
          fd.set("end_date", exp.end_date ?? "");
          fd.set("is_current", exp.is_current ? "true" : "false");
          fd.set("description", exp.description ?? "");
          const result = await saveExperience(fd);
          if (result.error) throw new Error(`Experience (${exp.role}): ${result.error}`);
        }

        // Projects
        for (const proj of draft.projects) {
          const fd = new FormData();
          fd.set("title", proj.title);
          fd.set("description", proj.description ?? "");
          fd.set("tech_stack", proj.tech_stack ?? "");
          fd.set("link", proj.link ?? "");
          fd.set("repo_link", proj.repo_link ?? "");
          const result = await saveProject(fd);
          if (result.error) throw new Error(`Project (${proj.title}): ${result.error}`);
        }

        // Skills
        for (const skill of draft.skills) {
          const fd = new FormData();
          fd.set("name", skill.name);
          fd.set("category", skill.category ?? "");
          const result = await saveSkill(fd);
          if (result.error) throw new Error(`Skill (${skill.name}): ${result.error}`);
        }

        // Certifications
        for (const cert of draft.certifications) {
          const fd = new FormData();
          fd.set("title", cert.title);
          fd.set("issuer", cert.issuer ?? "");
          fd.set("issue_date", cert.issue_date ?? "");
          fd.set("expiry_date", cert.expiry_date ?? "");
          fd.set("credential_url", cert.credential_url ?? "");
          const result = await saveCertification(fd);
          if (result.error) throw new Error(`Certification (${cert.title}): ${result.error}`);
        }

        onSaved();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong while saving.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/70">
      <div className="card max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-white">Review extracted data</h2>
          <button onClick={onDismiss} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          Edit anything below before saving — nothing is written to your profile yet.
        </p>

        <div className="space-y-6">
          {/* Basic info */}
          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Basic Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input-field text-sm" placeholder="Full name" value={draft.full_name ?? ""} onChange={(e) => updateField("full_name", e.target.value)} />
              <input className="input-field text-sm" placeholder="Location" value={draft.location ?? ""} onChange={(e) => updateField("location", e.target.value)} />
              <input className="input-field text-sm sm:col-span-2" placeholder="Headline" value={draft.headline ?? ""} onChange={(e) => updateField("headline", e.target.value)} />
              <input className="input-field text-sm" placeholder="Phone" value={draft.phone ?? ""} onChange={(e) => updateField("phone", e.target.value)} />
              <input className="input-field text-sm" placeholder="LinkedIn URL" value={draft.linkedin_url ?? ""} onChange={(e) => updateField("linkedin_url", e.target.value)} />
              <input className="input-field text-sm" placeholder="GitHub URL" value={draft.github_url ?? ""} onChange={(e) => updateField("github_url", e.target.value)} />
              <input className="input-field text-sm" placeholder="Website URL" value={draft.website_url ?? ""} onChange={(e) => updateField("website_url", e.target.value)} />
            </div>
          </section>

          {/* Education */}
          {draft.education.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Education ({draft.education.length})
              </p>
              <div className="space-y-2">
                {draft.education.map((edu, i) => (
                  <div key={i} className="bg-surface rounded-lg border border-surface-border p-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{edu.institution}</p>
                      <p className="text-xs text-gray-500">{[edu.degree, edu.field_of_study].filter(Boolean).join(" · ")}</p>
                    </div>
                    <button onClick={() => updateField("education", removeAt(draft.education, i))} className="text-xs text-red-500 hover:text-red-400 flex-shrink-0">Remove</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {draft.experiences.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Experience ({draft.experiences.length})
              </p>
              <div className="space-y-2">
                {draft.experiences.map((exp, i) => (
                  <div key={i} className="bg-surface rounded-lg border border-surface-border p-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{exp.role}</p>
                      <p className="text-xs text-gray-500">{exp.organisation}</p>
                    </div>
                    <button onClick={() => updateField("experiences", removeAt(draft.experiences, i))} className="text-xs text-red-500 hover:text-red-400 flex-shrink-0">Remove</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {draft.projects.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Projects ({draft.projects.length})
              </p>
              <div className="space-y-2">
                {draft.projects.map((proj, i) => (
                  <div key={i} className="bg-surface rounded-lg border border-surface-border p-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{proj.title}</p>
                      {proj.tech_stack && <p className="text-xs text-gray-500">{proj.tech_stack}</p>}
                    </div>
                    <button onClick={() => updateField("projects", removeAt(draft.projects, i))} className="text-xs text-red-500 hover:text-red-400 flex-shrink-0">Remove</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {draft.skills.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Skills ({draft.skills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {draft.skills.map((skill, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-surface border border-surface-border text-sm text-gray-300 px-3 py-1 rounded-full">
                    {skill.name}
                    <button onClick={() => updateField("skills", removeAt(draft.skills, i))} className="text-gray-600 hover:text-red-400 text-xs leading-none ml-0.5">×</button>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {draft.certifications.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Certifications ({draft.certifications.length})
              </p>
              <div className="space-y-2">
                {draft.certifications.map((cert, i) => (
                  <div key={i} className="bg-surface rounded-lg border border-surface-border p-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{cert.title}</p>
                      {cert.issuer && <p className="text-xs text-gray-500">{cert.issuer}</p>}
                    </div>
                    <button onClick={() => updateField("certifications", removeAt(draft.certifications, i))} className="text-xs text-red-500 hover:text-red-400 flex-shrink-0">Remove</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {error && (
          <div className="mt-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-2 mt-6 pt-4 border-t border-surface-border">
          <button onClick={handleSaveAll} disabled={isPending} className="btn-primary text-sm">
            {isPending ? "Saving…" : "Save all to profile"}
          </button>
          <button onClick={onDismiss} className="text-sm text-gray-400 hover:text-white px-3">
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}

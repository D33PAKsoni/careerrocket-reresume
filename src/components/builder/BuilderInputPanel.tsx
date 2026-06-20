"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveJobDescription } from "@/app/actions/documents";
import type { ProfileCompleteness, DocumentType, GenerationTone } from "@/types/profile";

const SECTION_LABELS: Record<keyof ProfileCompleteness["sections"], string> = {
  basicInfo: "Basic Info",
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
};

const TONE_OPTIONS: { value: GenerationTone; label: string }[] = [
  { value: "formal", label: "Formal" },
  { value: "balanced", label: "Balanced" },
  { value: "enthusiastic", label: "Enthusiastic" },
];

interface BuilderInputPanelProps {
  documentId: string;
  documentType: DocumentType;
  completeness: ProfileCompleteness;
  initialJobDescription: string;
  isGenerating: boolean;
  generationError: string | null;
  onGenerate: (jobDescription: string, tone: GenerationTone) => void;
}

export default function BuilderInputPanel({
  documentId,
  documentType,
  completeness,
  initialJobDescription,
  isGenerating,
  generationError,
  onGenerate,
}: BuilderInputPanelProps) {
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [tone, setTone] = useState<GenerationTone>("balanced");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Minimum viable: at least basic info + one other section, matching the
  // 67% "unlock builder" threshold already used elsewhere in the app.
  const canGenerate = completeness.percentage >= 34 && completeness.sections.basicInfo;

  const handleBlur = () => {
    startTransition(async () => {
      await saveJobDescription(documentId, jobDescription);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile sections checklist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Profile sections</p>
          <Link href="/dashboard/profile" className="text-xs text-brand hover:underline">Edit →</Link>
        </div>
        <div className="space-y-1.5">
          {Object.entries(completeness.sections).map(([key, done]) => (
            <div key={key} className="flex items-center gap-2.5 text-sm">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? "bg-green-500/20 text-green-400" : "bg-surface border border-surface-border text-transparent"
                }`}
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className={done ? "text-gray-300" : "text-gray-600"}>
                {SECTION_LABELS[key as keyof ProfileCompleteness["sections"]]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Job description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="job-description" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Job Description
          </label>
          {(isPending || saved) && (
            <span className="text-[11px] text-gray-500">{isPending ? "Saving…" : "Saved"}</span>
          )}
        </div>
        <textarea
          id="job-description"
          rows={8}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          onBlur={handleBlur}
          placeholder="Paste a job description here to tailor the generated content to this specific role…"
          className="input-field text-sm resize-none"
        />
        <p className="text-[11px] text-gray-600 mt-1.5">
          Optional — tailors content and unlocks an ATS match score.
        </p>
      </div>

      {/* Tone selector — cover letters only */}
      {documentType === "cover_letter" && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tone</p>
          <div className="flex gap-1.5">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTone(opt.value)}
                className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-colors ${
                  tone === opt.value
                    ? "bg-brand/10 border-brand/30 text-brand"
                    : "bg-surface border-surface-border text-gray-500 hover:text-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={() => onGenerate(jobDescription, tone)}
        disabled={!canGenerate || isGenerating}
        title={!canGenerate ? "Complete more of your profile first" : undefined}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:bg-surface-border disabled:text-gray-500"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Generating…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Generate
          </>
        )}
      </button>

      {!canGenerate && (
        <p className="text-[11px] text-gray-600 text-center -mt-3">
          Complete at least Basic Info to generate content.
        </p>
      )}

      {generationError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2.5 rounded-lg">
          {generationError}
        </div>
      )}
    </div>
  );
}

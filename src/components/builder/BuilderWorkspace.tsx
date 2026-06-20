"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import BuilderTopBar from "./BuilderTopBar";
import BuilderTabs from "./BuilderTabs";
import BuilderInputPanel from "./BuilderInputPanel";
import TemplatePicker from "./TemplatePicker";
import ResumePreview from "./ResumePreview";
import CoverLetterPreview from "./CoverLetterPreview";
import LinkedInPreview from "./LinkedInPreview";
import AtsScoreCard from "./AtsScoreCard";
import { getOrCreateDocumentByType } from "@/app/actions/getOrCreateDocument";
import { setDocumentTemplate } from "@/app/actions/documentExtras";
import type {
  Document,
  DocumentType,
  ProfileBundle,
  ProfileCompleteness,
  ResumeContent,
  CoverLetterContent,
  LinkedInContent,
  ResumeTemplate,
  AtsScore,
  GenerationTone,
} from "@/types/profile";

interface BuilderWorkspaceProps {
  userId: string;
  initialDocument: Document;
  bundle: ProfileBundle;
  completeness: ProfileCompleteness;
}

export default function BuilderWorkspace({
  userId,
  initialDocument,
  bundle,
  completeness,
}: BuilderWorkspaceProps) {
  const [document, setDocument] = useState<Document>(initialDocument);
  const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  // "summary" | `exp:${id}` | `proj:${id}` | "hook" | "evidence" | "close" | null
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  const router = useRouter();

  const handleTabChange = (type: DocumentType) => {
    if (type === document.type) return;
    setAtsScore(null);
    setGenerationError(null);
    startTransition(async () => {
      const next = await getOrCreateDocumentByType(userId, type);
      setDocument(next);
      router.replace(`/builder/${next.id}`);
    });
  };

  // ── Full generation ───────────────────────────────────────────────
  const handleGenerate = async (jobDescription: string, tone: GenerationTone) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: document.id, tone, jobDescription }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setGenerationError(json.error ?? "Generation failed. Please try again.");
        return;
      }

      setDocument((prev) => ({ ...prev, content: json.content, status: "generated", job_description: jobDescription }));
      setAtsScore(json.atsScore ?? null);
    } catch {
      setGenerationError("Network error — please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Regeneration (resume sections / cover letter paragraphs) ───────
  const handleRegenerate = async (
    target:
      | { kind: "summary" }
      | { kind: "experience"; experienceId: string }
      | { kind: "project"; projectId: string }
      | { kind: "paragraph"; paragraph: "hook" | "evidence" | "close" },
    key: string
  ) => {
    setRegeneratingKey(key);
    setGenerationError(null);
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          target,
          tone: document.type === "cover_letter" ? (document.content as CoverLetterContent)?.tone : undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setGenerationError(json.error ?? "Regeneration failed. Please try again.");
        return;
      }

      setDocument((prev) => ({ ...prev, content: json.content }));
      if (json.atsScore) setAtsScore(json.atsScore);
    } catch {
      setGenerationError("Network error — please check your connection and try again.");
    } finally {
      setRegeneratingKey(null);
    }
  };

  // ── Template selection ──────────────────────────────────────────────
  const handleTemplateChange = (template: ResumeTemplate) => {
    setDocument((prev) => ({ ...prev, template }));
    setIsSavingTemplate(true);
    startTransition(async () => {
      await setDocumentTemplate(document.id, template);
      setIsSavingTemplate(false);
    });
  };

  // ── Version restore ──────────────────────────────────────────────────
  const handleVersionRestored = (content: unknown, template: string) => {
    setDocument((prev) => ({
      ...prev,
      content: content as Document["content"],
      template: template as ResumeTemplate,
    }));
  };

  const renderPreview = () => {
    switch (document.type) {
      case "resume":
        return (
          <ResumePreview
            bundle={bundle}
            content={document.content as ResumeContent | null}
            template={document.template}
            onRegenerateSummary={() => handleRegenerate({ kind: "summary" }, "summary")}
            onRegenerateExperience={(id) => handleRegenerate({ kind: "experience", experienceId: id }, `exp:${id}`)}
            onRegenerateProject={(id) => handleRegenerate({ kind: "project", projectId: id }, `proj:${id}`)}
            regeneratingKey={regeneratingKey}
          />
        );
      case "cover_letter":
        return (
          <CoverLetterPreview
            bundle={bundle}
            content={document.content as CoverLetterContent | null}
            onRegenerateParagraph={(p) => handleRegenerate({ kind: "paragraph", paragraph: p }, p)}
            regeneratingParagraph={regeneratingKey as "hook" | "evidence" | "close" | null}
          />
        );
      case "linkedin":
        return <LinkedInPreview bundle={bundle} content={document.content as LinkedInContent | null} />;
    }
  };

  return (
    <div>
      <BuilderTopBar
        documentId={document.id}
        type={document.type}
        isShared={document.is_shared}
        shareSlug={document.share_slug}
        onVersionRestored={handleVersionRestored}
      />

      <div className="card p-0 overflow-hidden">
        <BuilderTabs activeTab={document.type} onChange={handleTabChange} />

        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-surface-border p-5 flex-shrink-0 space-y-6">
            {document.type === "resume" && (
              <TemplatePicker selected={document.template} onChange={handleTemplateChange} isSaving={isSavingTemplate} />
            )}
            <BuilderInputPanel
              documentId={document.id}
              documentType={document.type}
              completeness={completeness}
              initialJobDescription={document.job_description ?? ""}
              isGenerating={isGenerating}
              generationError={generationError}
              onGenerate={handleGenerate}
            />
          </div>

          <div className="flex-1 p-5 bg-surface/40 min-h-[28rem]">
            {isPending ? (
              <div className="flex items-center justify-center h-full">
                <svg className="animate-spin h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : (
              renderPreview()
            )}
          </div>
        </div>
      </div>

      {document.type === "resume" && atsScore && <AtsScoreCard score={atsScore} />}
    </div>
  );
}

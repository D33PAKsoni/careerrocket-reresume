"use client";

import { useState } from "react";
import Link from "next/link";
import ExportMenu from "./ExportMenu";
import ShareButton from "./ShareButton";
import VersionsPanel from "./VersionsPanel";
import type { DocumentType } from "@/types/profile";

const TYPE_LABELS: Record<DocumentType, string> = {
  resume: "Resume",
  cover_letter: "Cover Letter",
  linkedin: "LinkedIn Summary",
};

interface BuilderTopBarProps {
  documentId: string;
  type: DocumentType;
  isShared: boolean;
  shareSlug: string | null;
  onVersionRestored: (content: unknown, template: string) => void;
}

export default function BuilderTopBar({ documentId, type, isShared, shareSlug, onVersionRestored }: BuilderTopBarProps) {
  const [versionsOpen, setVersionsOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/builder" className="hover:text-gray-300 transition-colors">Builder</Link>
          <span>/</span>
          <span className="text-white">{TYPE_LABELS[type]}</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{TYPE_LABELS[type]}</h1>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <ExportMenu documentId={documentId} documentType={type} />
        <ShareButton documentId={documentId} documentType={type} initialIsShared={isShared} initialSlug={shareSlug} />
        <button
          onClick={() => setVersionsOpen(true)}
          className="text-sm text-gray-300 border border-surface-border hover:border-gray-500 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Versions
        </button>
      </div>

      <VersionsPanel
        documentId={documentId}
        isOpen={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        onRestored={(content, template) => {
          onVersionRestored(content, template);
          setVersionsOpen(false);
        }}
      />
    </div>
  );
}

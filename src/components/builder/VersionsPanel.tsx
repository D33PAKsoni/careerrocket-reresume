"use client";

import { useState, useTransition } from "react";
import { listDocumentVersions, restoreDocumentVersion } from "@/app/actions/documentExtras";
import type { DocumentVersion } from "@/types/profile";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface VersionsPanelProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestored: (content: unknown, template: string) => void;
}

export default function VersionsPanel({ documentId, isOpen, onClose, onRestored }: VersionsPanelProps) {
  const [versions, setVersions] = useState<DocumentVersion[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  if (isOpen && versions === null && !isPending) {
    startTransition(async () => {
      const list = await listDocumentVersions(documentId);
      setVersions(list);
    });
  }

  const handleRestore = (versionId: string) => {
    setRestoringId(versionId);
    startTransition(async () => {
      const result = await restoreDocumentVersion(documentId, versionId);
      if (result.success) {
        onRestored(result.content, result.template as string);
        // Refresh the list to reflect the new "Before restore" snapshot
        const list = await listDocumentVersions(documentId);
        setVersions(list);
      }
      setRestoringId(null);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-sm h-full bg-surface-card border-l border-surface-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border sticky top-0 bg-surface-card">
          <h2 className="text-base font-semibold text-white">Version History</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {versions === null ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No versions saved yet.</p>
              <p className="text-xs text-gray-600 mt-1">A snapshot is saved every time you generate or regenerate content.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version, i) => (
                <div key={version.id} className="bg-surface border border-surface-border rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      {i === 0 ? "Latest" : version.label || "Saved version"}
                    </p>
                    <p className="text-xs text-gray-500">{formatTimestamp(version.created_at)}</p>
                  </div>
                  {i !== 0 && (
                    <button
                      onClick={() => handleRestore(version.id)}
                      disabled={restoringId === version.id}
                      className="text-xs text-brand hover:underline flex-shrink-0 disabled:opacity-50"
                    >
                      {restoringId === version.id ? "Restoring…" : "Restore"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import type { DocumentType } from "@/types/profile";
import { Pdf01Icon, Doc01Icon } from "hugeicons-react";

interface ExportMenuProps {
  documentId: string;
  documentType: DocumentType;
}

export default function ExportMenu({ documentId, documentType }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const supported = documentType === "resume" || documentType === "cover_letter";

  if (!supported) {
    return (
      <button
        disabled
        title="Export is available for resumes and cover letters"
        className="text-sm text-gray-500 border border-surface-border px-4 py-2 rounded-lg cursor-not-allowed flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v8m0 0l-3-3m3 3l3-3M4 4h16v16H4V4z" />
        </svg>
        Export
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm text-gray-300 border border-surface-border hover:border-gray-500 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v8m0 0l-3-3m3 3l3-3M4 4h16v16H4V4z" />
        </svg>
        Export
      </button>

      {open && (
        <div className="absolute right-10 top-full mt-2 w-48 bg-surface-card border border-surface-border rounded-xl shadow-xl overflow-hidden z-50">
          <div className="p-1">
            <a
              href={`/api/export/pdf?documentId=${documentId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-surface-border rounded-lg transition-colors"
            >
              <Pdf01Icon /> Download PDF
            </a>
            <a
              href={`/api/export/docx?documentId=${documentId}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-surface-border rounded-lg transition-colors"
            >
              <Doc01Icon /> Download DOCX
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResumeUploadModal from "./ResumeUploadModal";
import ParsedResumeReview from "./ParsedResumeReview";
import type { ParsedResume } from "@/lib/ai/resumeSchema";

export default function ResumeUploadFlow() {
  const [modalOpen, setModalOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const router = useRouter();

  return (
    <>
      <button onClick={() => setModalOpen(true)} className="btn-primary text-sm whitespace-nowrap">
        Upload existing resume
      </button>

      <ResumeUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onParsed={(data) => {
          setModalOpen(false);
          setParsedData(data);
        }}
      />

      {parsedData && (
        <ParsedResumeReview
          data={parsedData}
          onDismiss={() => setParsedData(null)}
          onSaved={() => {
            setParsedData(null);
            setJustSaved(true);
            router.refresh();
          }}
        />
      )}

      {justSaved && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Profile updated from your resume
          <button onClick={() => setJustSaved(false)} className="ml-1 text-green-300 hover:text-white">×</button>
        </div>
      )}
    </>
  );
}

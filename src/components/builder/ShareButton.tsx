"use client";

import { useState, useTransition } from "react";
import { enableShareLink, disableShareLink } from "@/app/actions/documentExtras";
import type { DocumentType } from "@/types/profile";

interface ShareButtonProps {
  documentId: string;
  documentType: DocumentType;
  initialIsShared: boolean;
  initialSlug: string | null;
}

export default function ShareButton({ documentId, documentType, initialIsShared, initialSlug }: ShareButtonProps) {
  const [isShared, setIsShared] = useState(initialIsShared);
  const [slug, setSlug] = useState(initialSlug);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const supported = documentType === "resume" || documentType === "cover_letter";

  if (!supported) {
    return (
      <button
        disabled
        title="Sharing is available for resumes and cover letters"
        className="text-sm text-gray-500 border border-surface-border px-4 py-2 rounded-lg cursor-not-allowed flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342a4 4 0 100-2.684m0 2.684a4 4 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a4 4 0 105.367-5.367 4 4 0 00-5.367 5.367zm0 9.316a4 4 0 105.367 5.367 4 4 0 00-5.367-5.367z" />
        </svg>
        Share
      </button>
    );
  }

  const shareUrl = slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${slug}` : null;

  const handleClick = () => {
    if (isShared && shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
      return;
    }

    startTransition(async () => {
      const result = await enableShareLink(documentId);
      if (result.slug) {
        setSlug(result.slug);
        setIsShared(true);
        const url = `${window.location.origin}/share/${result.slug}`;
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    });
  };

  const handleDisable = () => {
    startTransition(async () => {
      await disableShareLink(documentId);
      setIsShared(false);
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleClick}
        disabled={isPending}
        title={isShared ? "Copy share link" : "Generate a public share link"}
        className={`text-sm border px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
          isShared
            ? "text-green-400 border-green-500/30 hover:border-green-500/50"
            : "text-gray-300 border-surface-border hover:border-gray-500"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342a4 4 0 100-2.684m0 2.684a4 4 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a4 4 0 105.367-5.367 4 4 0 00-5.367 5.367zm0 9.316a4 4 0 105.367 5.367 4 4 0 00-5.367-5.367z" />
        </svg>
        {isPending ? "…" : copied ? "Copied!" : isShared ? "Copy link" : "Share"}
      </button>
      {isShared && (
        <button
          onClick={handleDisable}
          disabled={isPending}
          title="Make private"
          className="text-gray-500 hover:text-red-400 transition-colors p-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

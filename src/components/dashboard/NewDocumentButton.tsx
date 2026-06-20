"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { createDocument } from "@/app/actions/documents";
import type { DocumentType } from "@/types/profile";
import { Briefcase02Icon, Mail02Icon, Linkedin02Icon } from "hugeicons-react";

const OPTIONS: { type: DocumentType; label: string; icon: React.ReactNode }[] = [
  { type: "resume", label: "Resume", icon: <Briefcase02Icon /> },
  { type: "cover_letter", label: "Cover Letter", icon: <Mail02Icon /> },
  { type: "linkedin", label: "LinkedIn Summary", icon: <Linkedin02Icon /> },
];

export default function NewDocumentButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (type: DocumentType) => {
    setOpen(false);
    startTransition(async () => {
      await createDocument(type); // redirects on success
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        className={`btn-primary text-sm whitespace-nowrap ${className}`}
      >
        {isPending ? "Creating…" : "+ New document"}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface-card border border-surface-border rounded-xl shadow-xl overflow-hidden z-50">
          <div className="p-1">
            {OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => handleSelect(opt.type)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-surface-border rounded-lg transition-colors text-left"
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

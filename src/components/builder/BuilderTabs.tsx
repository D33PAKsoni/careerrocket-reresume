"use client";

import type { DocumentType } from "@/types/profile";

const TABS: { type: DocumentType; label: string }[] = [
  { type: "resume", label: "Resume" },
  { type: "cover_letter", label: "Cover Letter" },
  { type: "linkedin", label: "LinkedIn" },
];

interface BuilderTabsProps {
  activeTab: DocumentType;
  onChange: (tab: DocumentType) => void;
}

export default function BuilderTabs({ activeTab, onChange }: BuilderTabsProps) {
  return (
    <div className="flex border-b border-surface-border">
      {TABS.map((tab) => (
        <button
          key={tab.type}
          onClick={() => onChange(tab.type)}
          className={`px-6 py-3.5 text-sm font-medium transition-colors ${
            activeTab === tab.type
              ? "text-brand border-b-2 border-brand bg-brand/5"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

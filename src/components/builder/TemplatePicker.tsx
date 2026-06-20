"use client";

import type { ResumeTemplate } from "@/types/profile";

const TEMPLATES: { value: ResumeTemplate; label: string; description: string }[] = [
  { value: "classic", label: "Classic", description: "Centered header, traditional layout" },
  { value: "modern", label: "Modern", description: "Dark header band, accent colors" },
  { value: "minimal", label: "Minimal", description: "Understated, generous whitespace" },
];

interface TemplatePickerProps {
  selected: ResumeTemplate;
  onChange: (template: ResumeTemplate) => void;
  isSaving?: boolean;
}

export default function TemplatePicker({ selected, onChange, isSaving }: TemplatePickerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Template</p>
        {isSaving && <span className="text-[11px] text-gray-500">Saving…</span>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            title={t.description}
            className={`text-xs font-medium py-2.5 rounded-lg border transition-colors ${
              selected === t.value
                ? "bg-brand/10 border-brand/30 text-brand"
                : "bg-surface border-surface-border text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

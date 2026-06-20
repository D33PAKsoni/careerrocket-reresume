import Link from "next/link";
import type { Document, DocumentType } from "@/types/profile";
import {Briefcase02Icon, Mail02Icon, Linkedin02Icon }  from "hugeicons-react"

const TYPE_META: Record<DocumentType, { label: string; icon: React.ReactNode }> = {
  resume: { label: "Resume", icon: <Briefcase02Icon /> },
  cover_letter: { label: "Cover Letter", icon: <Mail02Icon /> },
  linkedin: { label: "LinkedIn", icon: <Linkedin02Icon /> },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DocumentCard({ document }: { document: Document }) {
  const meta = TYPE_META[document.type];

  return (
    <Link
      href={`/builder/${document.id}`}
      className="card hover:border-brand/40 transition-colors flex items-start gap-3 group"
    >
      <span className="text-2xl flex-shrink-0">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white truncate">
            {document.title || meta.label}
          </p>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
              document.status === "generated"
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-surface border border-surface-border text-gray-500"
            }`}
          >
            {document.status === "generated" ? "Generated" : "Draft"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {meta.label} · {formatDate(document.created_at)}
        </p>
      </div>
    </Link>
  );
}

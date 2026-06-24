"use client";

import { buildResourceLink } from "@/lib/green/buildResourceLink";
import type { GreenJobRole } from "@/lib/green/schemas";
import { Book02Icon, Video01Icon, File01Icon}  from "hugeicons-react"


const RESOURCE_ICON: Record<string, React.ReactNode> = {
  article: <File01Icon />,
  video: <Video01Icon />,
  course: <Book02Icon />,
};

interface GreenRoleOverlayProps {
  role: GreenJobRole;
  onClose: () => void;
}

export default function GreenRoleOverlay({ role, onClose }: GreenRoleOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/70" onClick={onClose}>
      <div className="card max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h2 className="text-xl font-semibold text-white">{role.title}</h2>
            <span className="inline-block mt-1.5 text-[11px] font-medium bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full">
              {role.sdgAlignment}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mt-4 mb-6">{role.whyThisFits}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {role.transferableSkills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">You already have</p>
              <div className="flex flex-wrap gap-1.5">
                {role.transferableSkills.map((s, i) => (
                  <span key={i} className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {role.skillsToBuild.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Worth building</p>
              <div className="flex flex-wrap gap-1.5">
                {role.skillsToBuild.map((s, i) => (
                  <span key={i} className="text-xs bg-surface border border-surface-border text-gray-300 px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>


        {role.roadmap.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Roadmap</p>
            <div className="space-y-3">
              {role.roadmap.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{step.step}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {role.resources.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Resources</p>
            <div className="space-y-2">
              {role.resources.map((resource, i) => (
                <a
                  key={i}
                  href={buildResourceLink(resource)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-surface border border-surface-border hover:border-brand/30 rounded-lg px-4 py-2.5 transition-colors"
                >
                  <span className="text-lg flex-shrink-0">{RESOURCE_ICON[resource.type] ?? "🔗"}</span>
                  <span className="text-sm text-gray-300 flex-1 min-w-0 truncate">{resource.label}</span>
                  <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
            <p className="text-[11px] text-gray-600 mt-3">
              These open a search for the topic rather than a specific link — AI can&apos;t verify a single article or
              video still exists, so we point you to search results you can judge for yourself.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { togglePortfolioVisibility, updatePortfolioSlug } from "@/app/actions/portfolio";
import type { Portfolio } from "@/types/profile";

interface PortfolioControlsProps {
  portfolio: Portfolio;
  appUrl: string;
}

export default function PortfolioControls({ portfolio, appUrl }: PortfolioControlsProps) {
  const [isPublic, setIsPublic] = useState(portfolio.is_public);
  const [slug, setSlug] = useState(portfolio.slug);
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState(portfolio.slug);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isSavingSlug, setIsSavingSlug] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = `${appUrl}/p/${slug}`;

  const handleToggle = async () => {
    const next = !isPublic;
    setIsToggling(true);
    setIsPublic(next); // optimistic
    const result = await togglePortfolioVisibility(portfolio.id, next);
    if (result.error) setIsPublic(!next); // revert on failure
    setIsToggling(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSaveSlug = async () => {
    setSlugError(null);
    setIsSavingSlug(true);
    const result = await updatePortfolioSlug(portfolio.id, slugInput);
    if (result.error) {
      setSlugError(result.error);
    } else if (result.slug) {
      setSlug(result.slug);
      setEditingSlug(false);
    }
    setIsSavingSlug(false);
  };

  return (
    <div className="card mb-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
          🌐
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white mb-0.5">Your portfolio URL</p>
          <p className="text-xs text-gray-500 mb-2">
            {isPublic ? "Live and publicly accessible." : "Currently private — only you can see it."}
          </p>

          {editingSlug ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <span className="text-xs text-gray-500 whitespace-nowrap">{appUrl}/p/</span>
                <input
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value.toLowerCase())}
                  className="input-field text-xs py-1.5 flex-1 min-w-0"
                  placeholder="your-name"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={handleSaveSlug} disabled={isSavingSlug} className="btn-primary text-xs px-3 py-1.5">
                  {isSavingSlug ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => { setEditingSlug(false); setSlugInput(slug); setSlugError(null); }}
                  className="text-xs text-gray-400 hover:text-white px-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-300 bg-surface border border-surface-border px-3 py-1.5 rounded-lg font-mono">
                {appUrl}/p/{slug}
              </span>
              <button onClick={handleCopy} className="text-xs text-brand hover:underline">
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={() => setEditingSlug(true)} className="text-xs text-gray-400 hover:text-white">
                Edit
              </button>
              {isPublic && (
                <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline">
                  View public page →
                </a>
              )}
            </div>
          )}

          {slugError && <p className="text-xs text-red-400 mt-1.5">{slugError}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-surface-border">
        <div>
          <p className="text-sm font-medium text-white">Visibility</p>
          <p className="text-xs text-gray-500">Control who can see your portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${!isPublic ? "text-white font-medium" : "text-gray-600"}`}>Private</span>
          <button
            onClick={handleToggle}
            disabled={isToggling}
            aria-label="Toggle visibility"
            className={`w-10 h-5 rounded-full relative transition-colors disabled:opacity-60 ${
              isPublic ? "bg-brand" : "bg-surface-border"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                isPublic ? "left-5" : "left-0.5"
              }`}
            />
          </button>
          <span className={`text-xs ${isPublic ? "text-white font-medium" : "text-gray-600"}`}>Public</span>
        </div>
      </div>
    </div>
  );
}

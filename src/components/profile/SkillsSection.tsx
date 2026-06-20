"use client";

import { useState, useTransition } from "react";
import { saveSkill, deleteSkill } from "@/app/actions/profile";
import FormMessage from "./FormMessage";
import type { Skill } from "@/types/profile";

const CATEGORIES = ["Language", "Framework", "Tool", "Cloud", "Database", "Other"];

interface SkillsSectionProps { items: Skill[]; }

export default function SkillsSection({ items }: SkillsSectionProps) {
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setSuccess(false);
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const result = await saveSkill(fd);
      if (result.error) { setError(result.error); return; }
      setSuccess(true);
      form.reset();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => { await deleteSkill(id); });
  };

  const grouped = items.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category ?? "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Grouped skill chips */}
      {Object.entries(grouped).map(([cat, skills]) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill.id}
                className="flex items-center gap-1.5 bg-surface border border-surface-border text-sm text-gray-300 px-3 py-1 rounded-full">
                {skill.name}
                <button onClick={() => handleDelete(skill.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-xs leading-none ml-0.5">×</button>
              </span>
            ))}
          </div>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleSave} className="bg-surface rounded-lg border border-brand/30 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Skill name *</label>
              <input name="name" placeholder="Python, React, Docker…" className="input-field text-sm" autoFocus required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
              <select name="category" className="input-field text-sm">
                <option value="">— select —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <FormMessage error={error} success={success} />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="btn-primary text-sm">{isPending ? "Saving…" : "Add skill"}</button>
            <button type="button" onClick={() => setAdding(false)} className="text-sm text-gray-400 hover:text-white px-3">Done</button>
          </div>
        </form>
      ) : (
        <button onClick={() => { setAdding(true); setError(null); setSuccess(false); }}
          className="w-full border border-dashed border-surface-border hover:border-brand/50 text-gray-500 hover:text-brand text-sm py-3 rounded-lg transition-colors">
          + Add skill
        </button>
      )}
    </div>
  );
}

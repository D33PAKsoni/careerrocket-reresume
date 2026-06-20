"use client";

import { useState, useTransition } from "react";
import { saveExperience, deleteExperience } from "@/app/actions/profile";
import FormMessage from "./FormMessage";
import type { Experience } from "@/types/profile";

interface ExperienceSectionProps { items: Experience[]; }

export default function ExperienceSection({ items }: ExperienceSectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [isCurrent, setIsCurrent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setSuccess(false);
    const fd = new FormData(e.currentTarget);
    fd.set("is_current", isCurrent ? "true" : "false");
    startTransition(async () => {
      const result = await saveExperience(fd);
      if (result.error) { setError(result.error); return; }
      setSuccess(true); setEditing(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => { await deleteExperience(id); });
  };

  const current = editing === "new" ? null : items.find((i) => i.id === editing) ?? null;

  const openEdit = (item: Experience | null) => {
    setEditing(item?.id ?? "new");
    setIsCurrent(item?.is_current ?? false);
    setError(null); setSuccess(false);
  };

  return (
    <div className="space-y-3">
      {items.map((exp) => (
        <div key={exp.id} className="bg-surface rounded-lg border border-surface-border px-4 py-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{exp.role}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {exp.organisation}
              {exp.location && <span className="ml-2 text-gray-600">· {exp.location}</span>}
              <span className="ml-2 text-gray-600">
                · {exp.start_date?.slice(0, 7) ?? "?"} — {exp.is_current ? "Present" : (exp.end_date?.slice(0, 7) ?? "?")}
              </span>
            </p>
            {exp.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{exp.description}</p>}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => openEdit(exp)} className="text-xs text-gray-400 hover:text-white transition-colors">Edit</button>
            <button onClick={() => handleDelete(exp.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Delete</button>
          </div>
        </div>
      ))}

      {editing && (
        <form onSubmit={handleSave} className="bg-surface rounded-lg border border-brand/30 p-4 space-y-3">
          <input type="hidden" name="id" value={current?.id ?? ""} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Role / Title *</label>
              <input name="role" defaultValue={current?.role ?? ""} placeholder="AI Intern" className="input-field text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Organisation *</label>
              <input name="organisation" defaultValue={current?.organisation ?? ""} placeholder="Infosys Springboard" className="input-field text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Location</label>
              <input name="location" defaultValue={current?.location ?? ""} placeholder="Remote" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Start date</label>
              <input name="start_date" type="month" defaultValue={current?.start_date?.slice(0, 7) ?? ""} className="input-field text-sm" />
            </div>
            {!isCurrent && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">End date</label>
                <input name="end_date" type="month" defaultValue={current?.end_date?.slice(0, 7) ?? ""} className="input-field text-sm" />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded border-surface-border bg-surface text-brand focus:ring-brand" />
                <span className="text-xs text-gray-400">I currently work here</span>
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
              <textarea name="description" defaultValue={current?.description ?? ""} rows={3}
                placeholder="Key achievements and responsibilities..." className="input-field text-sm resize-none" />
            </div>
          </div>
          <FormMessage error={error} success={success} />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="btn-primary text-sm">{isPending ? "Saving…" : "Save"}</button>
            <button type="button" onClick={() => setEditing(null)} className="text-sm text-gray-400 hover:text-white px-3">Cancel</button>
          </div>
        </form>
      )}

      {!editing && (
        <button onClick={() => openEdit(null)}
          className="w-full border border-dashed border-surface-border hover:border-brand/50 text-gray-500 hover:text-brand text-sm py-3 rounded-lg transition-colors">
          + Add experience
        </button>
      )}
    </div>
  );
}

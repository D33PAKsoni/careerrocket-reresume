"use client";

import { useState, useTransition } from "react";
import { saveEducation, deleteEducation } from "@/app/actions/profile";
import FormMessage from "./FormMessage";
import type { Education } from "@/types/profile";

interface EducationSectionProps { items: Education[]; }

export default function EducationSection({ items }: EducationSectionProps) {
  const [editing, setEditing] = useState<string | null>(null); // id or "new"
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveEducation(fd);
      if (result.error) { setError(result.error); return; }
      setSuccess(true);
      setEditing(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => { await deleteEducation(id); });
  };

  const currentItem = editing === "new" ? null : items.find((i) => i.id === editing) ?? null;

  return (
    <div className="space-y-3">
      {items.map((edu) => (
        <div key={edu.id} className="bg-surface rounded-lg border border-surface-border px-4 py-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{edu.institution}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {[edu.degree, edu.field_of_study].filter(Boolean).join(" · ")}
              {(edu.start_year || edu.end_year) && (
                <span className="ml-2 text-gray-600">{edu.start_year} — {edu.end_year ?? "present"}</span>
              )}
              {edu.grade && <span className="ml-2 text-gray-600">· {edu.grade}</span>}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setEditing(edu.id)} className="text-xs text-gray-400 hover:text-white transition-colors">Edit</button>
            <button onClick={() => handleDelete(edu.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Delete</button>
          </div>
        </div>
      ))}

      {editing && (
        <form onSubmit={handleSave} className="bg-surface rounded-lg border border-brand/30 p-4 space-y-3">
          <input type="hidden" name="id" value={currentItem?.id ?? ""} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Institution *</label>
              <input name="institution" defaultValue={currentItem?.institution ?? ""} placeholder="Shoolini University" className="input-field text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Degree</label>
              <input name="degree" defaultValue={currentItem?.degree ?? ""} placeholder="MCA" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Field of study</label>
              <input name="field_of_study" defaultValue={currentItem?.field_of_study ?? ""} placeholder="Artificial Intelligence" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Start year</label>
              <input name="start_year" type="number" defaultValue={currentItem?.start_year ?? ""} placeholder="2022" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">End year (or expected)</label>
              <input name="end_year" type="number" defaultValue={currentItem?.end_year ?? ""} placeholder="2025" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Grade / CGPA</label>
              <input name="grade" defaultValue={currentItem?.grade ?? ""} placeholder="8.7 CGPA" className="input-field text-sm" />
            </div>
          </div>
          <FormMessage error={error} success={success} />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="btn-primary text-sm">{isPending ? "Saving…" : "Save"}</button>
            <button type="button" onClick={() => { setEditing(null); setError(null); setSuccess(false); }} className="text-sm text-gray-400 hover:text-white transition-colors px-3">Cancel</button>
          </div>
        </form>
      )}

      {!editing && (
        <button onClick={() => { setEditing("new"); setError(null); setSuccess(false); }}
          className="w-full border border-dashed border-surface-border hover:border-brand/50 text-gray-500 hover:text-brand text-sm py-3 rounded-lg transition-colors">
          + Add education
        </button>
      )}
    </div>
  );
}

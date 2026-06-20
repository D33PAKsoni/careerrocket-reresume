"use client";

import { useState, useTransition } from "react";
import { saveProject, deleteProject } from "@/app/actions/profile";
import FormMessage from "./FormMessage";
import type { Project } from "@/types/profile";

interface ProjectsSectionProps { items: Project[]; }

export default function ProjectsSection({ items }: ProjectsSectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveProject(fd);
      if (result.error) { setError(result.error); return; }
      setSuccess(true); setEditing(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => { await deleteProject(id); });
  };

  const current = editing === "new" ? null : items.find((i) => i.id === editing) ?? null;

  return (
    <div className="space-y-3">
      {items.map((proj) => (
        <div key={proj.id} className="bg-surface rounded-lg border border-surface-border px-4 py-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white truncate">{proj.title}</p>
              {proj.is_featured && (
                <span className="text-[10px] bg-brand/10 border border-brand/20 text-brand px-1.5 py-0.5 rounded-full flex-shrink-0">Featured</span>
              )}
            </div>
            {proj.tech_stack && <p className="text-xs text-gray-500 mt-0.5">{proj.tech_stack}</p>}
            {proj.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{proj.description}</p>}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => { setEditing(proj.id); setError(null); setSuccess(false); }} className="text-xs text-gray-400 hover:text-white transition-colors">Edit</button>
            <button onClick={() => handleDelete(proj.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Delete</button>
          </div>
        </div>
      ))}

      {editing && (
        <form onSubmit={handleSave} className="bg-surface rounded-lg border border-brand/30 p-4 space-y-3">
          <input type="hidden" name="id" value={current?.id ?? ""} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Project title *</label>
              <input name="title" defaultValue={current?.title ?? ""} placeholder="KaushalMitra" className="input-field text-sm" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
              <textarea name="description" defaultValue={current?.description ?? ""} rows={3}
                placeholder="What it does, the problem it solves, your role..." className="input-field text-sm resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Tech stack</label>
              <input name="tech_stack" defaultValue={current?.tech_stack ?? ""} placeholder="Next.js, FastAPI, Supabase, Claude Sonnet 4.6" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Live URL</label>
              <input name="link" defaultValue={current?.link ?? ""} placeholder="https://myproject.vercel.app" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Repo URL</label>
              <input name="repo_link" defaultValue={current?.repo_link ?? ""} placeholder="https://github.com/user/repo" className="input-field text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_featured" value="true"
                  defaultChecked={current?.is_featured ?? false}
                  className="rounded border-surface-border bg-surface text-brand focus:ring-brand" />
                <span className="text-xs text-gray-400">Feature on portfolio page</span>
              </label>
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
        <button onClick={() => { setEditing("new"); setError(null); setSuccess(false); }}
          className="w-full border border-dashed border-surface-border hover:border-brand/50 text-gray-500 hover:text-brand text-sm py-3 rounded-lg transition-colors">
          + Add project
        </button>
      )}
    </div>
  );
}

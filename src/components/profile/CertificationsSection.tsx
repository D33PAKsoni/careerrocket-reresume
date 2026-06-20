"use client";

import { useState, useTransition } from "react";
import { saveCertification, deleteCertification } from "@/app/actions/profile";
import FormMessage from "./FormMessage";
import type { Certification } from "@/types/profile";

interface CertificationsSectionProps { items: Certification[]; }

export default function CertificationsSection({ items }: CertificationsSectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveCertification(fd);
      if (result.error) { setError(result.error); return; }
      setSuccess(true); setEditing(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => { await deleteCertification(id); });
  };

  const current = editing === "new" ? null : items.find((i) => i.id === editing) ?? null;

  return (
    <div className="space-y-3">
      {items.map((cert) => (
        <div key={cert.id} className="bg-surface rounded-lg border border-surface-border px-4 py-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{cert.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {cert.issuer}
              {cert.issue_date && <span className="ml-2 text-gray-600">· {cert.issue_date}</span>}
              {cert.expiry_date && <span className="text-gray-600"> → {cert.expiry_date}</span>}
            </p>
            {cert.credential_url && (
              <a href={cert.credential_url} target="_blank" rel="noopener noreferrer"
                className="text-[11px] text-brand hover:underline mt-0.5 block">View credential ↗</a>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => { setEditing(cert.id); setError(null); setSuccess(false); }} className="text-xs text-gray-400 hover:text-white transition-colors">Edit</button>
            <button onClick={() => handleDelete(cert.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Delete</button>
          </div>
        </div>
      ))}

      {editing && (
        <form onSubmit={handleSave} className="bg-surface rounded-lg border border-brand/30 p-4 space-y-3">
          <input type="hidden" name="id" value={current?.id ?? ""} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Certification title *</label>
              <input name="title" defaultValue={current?.title ?? ""} placeholder="Microsoft DP-600" className="input-field text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Issuer</label>
              <input name="issuer" defaultValue={current?.issuer ?? ""} placeholder="Microsoft" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Issue date</label>
              <input name="issue_date" type="date" defaultValue={current?.issue_date ?? ""} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Expiry date</label>
              <input name="expiry_date" type="date" defaultValue={current?.expiry_date ?? ""} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Credential URL</label>
              <input name="credential_url" defaultValue={current?.credential_url ?? ""} placeholder="https://learn.microsoft.com/..." className="input-field text-sm" />
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
          + Add certification
        </button>
      )}
    </div>
  );
}

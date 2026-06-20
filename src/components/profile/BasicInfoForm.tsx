"use client";

import { useState, useTransition } from "react";
import { saveBasicInfo } from "@/app/actions/profile";
import FormMessage from "./FormMessage";
import type { Profile } from "@/types/profile";

interface BasicInfoFormProps {
  profile: Profile | null;
}

export default function BasicInfoForm({ profile }: BasicInfoFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveBasicInfo(formData);
      if (result.error) setError(result.error);
      else setSuccess(true);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Full name *</label>
          <input name="full_name" defaultValue={profile?.full_name ?? ""} placeholder="Deepak Kumar Soni" className="input-field text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Location</label>
          <input name="location" defaultValue={profile?.location ?? ""} placeholder="Delhi NCR, India" className="input-field text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Professional headline</label>
        <input name="headline" defaultValue={profile?.headline ?? ""} placeholder="MCA Final Year · AI/ML · Open to Opportunities" className="input-field text-sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone</label>
          <input name="phone" defaultValue={profile?.phone ?? ""} placeholder="+91 0000 000000" className="input-field text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">GitHub URL</label>
          <input name="github_url" defaultValue={profile?.github_url ?? ""} placeholder="https://github.com/username" className="input-field text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">LinkedIn URL</label>
          <input name="linkedin_url" defaultValue={profile?.linkedin_url ?? ""} placeholder="https://linkedin.com/in/username" className="input-field text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Website / Portfolio URL</label>
          <input name="website_url" defaultValue={profile?.website_url ?? ""} placeholder="https://yoursite.dev" className="input-field text-sm" />
        </div>
      </div>

      <FormMessage error={error} success={success} />

      <button type="submit" disabled={isPending} className="btn-primary text-sm">
        {isPending ? "Saving… (might take a moment)" : "Save basic info"}
      </button>
    </form>
  );
}

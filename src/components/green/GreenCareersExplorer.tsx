"use client";

import { useState } from "react";
import GreenRoleCard from "./GreenRoleCard";
import GreenRoleOverlay from "./GreenRoleOverlay";
import type { GreenJobRole } from "@/lib/green/schemas";

type Status = "idle" | "loading" | "error" | "done";

export default function GreenCareersExplorer() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<GreenJobRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<GreenJobRole | null>(null);

  const handleGoGreen = async () => {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/green", { method: "POST" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setRoles(json.roles as GreenJobRole[]);
      setStatus("done");
    } catch {
      setError("Network error — please check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <div>
      {status === "idle" && (
        <div className="card border-dashed text-center py-16">
          <span className="text-4xl mb-4 block">🌱</span>
          <h2 className="text-lg font-semibold text-white mb-2">Find your green career path</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
            We&apos;ll match your education, experience, projects, and skills against sustainability-focused
            roles — with a roadmap and learning resources for each.
          </p>
          <button onClick={handleGoGreen} className="btn-primary inline-flex items-center gap-2 w-auto px-6">
            🌍 Go Green
          </button>
        </div>
      )}

      {status === "loading" && (
        <div className="card text-center py-16">
          <svg className="animate-spin h-7 w-7 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-sm text-gray-400">Matching your profile against sustainability-focused roles…</p>
        </div>
      )}

      {status === "error" && (
        <div className="card border-red-500/20 text-center py-12">
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button onClick={handleGoGreen} className="btn-primary inline-flex w-auto px-6">
            Try again
          </button>
        </div>
      )}

      {status === "done" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">{roles.length} role{roles.length !== 1 ? "s" : ""} matched to your profile</p>
            <button onClick={handleGoGreen} className="text-xs text-brand hover:underline">
              Regenerate
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map((role, i) => (
              <GreenRoleCard key={i} role={role} onClick={() => setSelectedRole(role)} />
            ))}
          </div>
        </>
      )}

      {selectedRole && <GreenRoleOverlay role={selectedRole} onClose={() => setSelectedRole(null)} />}
    </div>
  );
}

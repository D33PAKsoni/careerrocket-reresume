"use client";

import { useState, useRef } from "react";
import type { ParsedResume } from "@/lib/ai/resumeSchema";

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsed: (data: ParsedResume) => void;
}

type Status = "idle" | "uploading" | "error";

const MAX_SIZE_MB = 5;

export default function ResumeUploadModal({ isOpen, onClose, onParsed }: ResumeUploadModalProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const reset = () => {
    setStatus("idle");
    setError(null);
    setFileName(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") return "Only PDF files are supported.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    return null;
  };

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setStatus("error");
      return;
    }

    setFileName(file.name);
    setStatus("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Something went wrong while processing your resume.");
        setStatus("error");
        return;
      }

      onParsed(json.data as ParsedResume);
      handleClose();
    } catch {
      setError("Network error — please check your connection and try again.");
      setStatus("error");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70" onClick={handleClose}>
      <div
        className="card max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Upload existing resume</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === "uploading" && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <svg className="animate-spin h-8 w-8 text-brand" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-white mb-1">Processing {fileName}…</p>
              <p className="text-xs text-gray-500">Extracting text and analysing your resume with AI. This can take up to 30 seconds.</p>
            </div>
          </div>
        )}

        {status !== "uploading" && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl py-10 px-4 text-center cursor-pointer transition-colors ${
                isDragging ? "border-brand bg-brand/5" : "border-surface-border hover:border-gray-500"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <svg className="w-10 h-10 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium text-white mb-1">Drop your resume here, or click to browse</p>
              <p className="text-xs text-gray-500">PDF only · Max {MAX_SIZE_MB}MB</p>
            </div>

            {status === "error" && error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
                <button onClick={reset} className="block mt-1.5 text-xs text-red-300 hover:text-red-200 underline">
                  Try again
                </button>
              </div>
            )}

            <p className="text-xs text-gray-600 mt-4 text-center">
              We&apos;ll extract your details with AI and pre-fill the form below for you to review — nothing is saved until you click Save.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

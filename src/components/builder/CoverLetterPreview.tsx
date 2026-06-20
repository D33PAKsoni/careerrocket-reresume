import type { ProfileBundle, CoverLetterContent } from "@/types/profile";

interface CoverLetterPreviewProps {
  bundle: ProfileBundle;
  content: CoverLetterContent | null;
  onRegenerateParagraph?: (paragraph: "hook" | "evidence" | "close") => void;
  regeneratingParagraph?: "hook" | "evidence" | "close" | null;
}

const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

function RegenerateButton({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      title="Regenerate this paragraph"
      className="text-gray-400 hover:text-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 ml-2 print:hidden"
    >
      <svg className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  );
}

export default function CoverLetterPreview({
  bundle,
  content,
  onRegenerateParagraph,
  regeneratingParagraph,
}: CoverLetterPreviewProps) {
  const { profile } = bundle;

  if (!profile?.full_name) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
        <span className="text-3xl opacity-30">✉️</span>
        <p className="text-sm text-gray-500 max-w-xs">
          Fill in your basic info in the Profile section to see your cover letter take shape here.
        </p>
      </div>
    );
  }

  const hasGenerated = content?.hook || content?.evidence || content?.close;

  return (
    <div className="bg-white text-gray-900 rounded-lg p-8 text-sm leading-relaxed shadow-xl">
      <div className="mb-6">
        <p className="font-semibold">{profile.full_name}</p>
        {profile.location && <p className="text-gray-600">{profile.location}</p>}
        {profile.phone && <p className="text-gray-600">{profile.phone}</p>}
        {profile.linkedin_url && <p className="text-gray-600">{profile.linkedin_url}</p>}
      </div>

      <p className="text-gray-600 mb-6">{today}</p>

      <div className="mb-6">
        <p className="text-gray-800">
          {content?.companyName ? `Hiring Team, ${content.companyName}` : "[Hiring Team]"}
        </p>
        {content?.roleName && <p className="text-gray-600">Re: {content.roleName} application</p>}
      </div>

      {hasGenerated ? (
        <div className="space-y-4 text-gray-800">
          {content?.hook && (
            <div className="flex items-start group">
              <p className="flex-1">{content.hook}</p>
              {onRegenerateParagraph && (
                <RegenerateButton onClick={() => onRegenerateParagraph("hook")} isLoading={regeneratingParagraph === "hook"} />
              )}
            </div>
          )}
          {content?.evidence && (
            <div className="flex items-start group">
              <p className="flex-1">{content.evidence}</p>
              {onRegenerateParagraph && (
                <RegenerateButton onClick={() => onRegenerateParagraph("evidence")} isLoading={regeneratingParagraph === "evidence"} />
              )}
            </div>
          )}
          {content?.close && (
            <div className="flex items-start group">
              <p className="flex-1">{content.close}</p>
              {onRegenerateParagraph && (
                <RegenerateButton onClick={() => onRegenerateParagraph("close")} isLoading={regeneratingParagraph === "close"} />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 text-gray-400 italic">
          <p>
            [Opening hook — why you&apos;re excited about this role and company will appear here once generated]
          </p>
          <p>
            [Evidence paragraph — your most relevant experience and achievements, tailored to the job description, will appear here]
          </p>
          <p>
            [Closing paragraph — a confident call to action will appear here]
          </p>
        </div>
      )}

      <p className="mt-6 text-gray-800">
        Sincerely,<br />{profile.full_name}
      </p>
    </div>
  );
}

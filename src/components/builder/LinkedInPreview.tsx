import type { ProfileBundle, LinkedInContent } from "@/types/profile";
import { Link03Icon } from "hugeicons-react";

const HEADLINE_LIMIT = 220;
const ABOUT_LIMIT = 2600;

interface LinkedInPreviewProps {
  bundle: ProfileBundle;
  content: LinkedInContent | null;
}

export default function LinkedInPreview({ bundle, content }: LinkedInPreviewProps) {
  const { profile, skills } = bundle;

  if (!profile?.full_name) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
        <span className="text-3xl opacity-30"><Link03Icon /></span>
        <p className="text-sm text-gray-500 max-w-xs">
          Fill in your basic info in the Profile section to see your LinkedIn summary take shape here.
        </p>
      </div>
    );
  }

  const headline = content?.headline ?? profile.headline ?? "";
  const about = content?.about ?? "";

  return (
    <div className="bg-white text-gray-900 rounded-lg p-8 text-sm leading-relaxed shadow-xl">
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-200">
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg flex-shrink-0">
          {profile.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900">{profile.full_name}</p>
          <p className="text-gray-600 text-xs">{profile.location}</p>
        </div>
      </div>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Headline</h2>
          <span className={`text-[11px] ${headline.length > HEADLINE_LIMIT ? "text-red-500" : "text-gray-400"}`}>
            {headline.length} / {HEADLINE_LIMIT}
          </span>
        </div>
        {headline ? (
          <p className="text-gray-900 font-medium">{headline}</p>
        ) : (
          <p className="text-gray-400 italic">[Your AI-optimised headline will appear here once generated]</p>
        )}
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">About</h2>
          <span className={`text-[11px] ${about.length > ABOUT_LIMIT ? "text-red-500" : "text-gray-400"}`}>
            {about.length} / {ABOUT_LIMIT}
          </span>
        </div>
        {about ? (
          <p className="text-gray-800 whitespace-pre-wrap">{about}</p>
        ) : (
          <p className="text-gray-400 italic">
            [A keyword-optimised About summary covering your background, skills, and goals will appear here once generated]
          </p>
        )}
      </section>

      {skills.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Top Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 8).map((s) => (
              <span key={s.id} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

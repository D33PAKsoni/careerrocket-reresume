import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ResumePreview from "@/components/builder/ResumePreview";
import type { ResumeContent, CoverLetterContent, Profile, ProfileBundle } from "@/types/profile";

interface SharePageProps {
  params: Promise<{ slug: string }>;
}


async function getSharedDocument(slug: string) {
  const supabase = await createClient();

  const { data: document } = await supabase
    .from("documents")
    .select("id, user_id, type, content, template, is_shared")
    .eq("share_slug", slug)
    .maybeSingle();

  if (!document || !document.is_shared) return null;

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, headline, location, phone, github_url, linkedin_url, website_url")
    .eq("user_id", document.user_id)
    .maybeSingle();

  const profileId = profile?.id ?? null;

  const [{ data: education }, { data: experiences }, { data: projects }, { data: skills }, { data: certifications }] = profileId
    ? await Promise.all([
        admin.from("education").select("*").eq("profile_id", profileId),
        admin.from("experiences").select("*").eq("profile_id", profileId),
        admin.from("projects").select("*").eq("profile_id", profileId),
        admin.from("skills").select("*").eq("profile_id", profileId),
        admin.from("certifications").select("*").eq("profile_id", profileId),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];

  return {
    document,
    profile: profile as Profile | null,
    education: education ?? [],
    experiences: experiences ?? [],
    projects: projects ?? [],
    skills: skills ?? [],
    certifications: certifications ?? [],
  };
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getSharedDocument(slug);

  if (!result?.profile?.full_name) {
    return { title: "Resume — ResumeAI" };
  }

  const title = `${result.profile.full_name} — Resume`;
  const description = result.profile.headline ?? "View this resume, built with ResumeAI.";

  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;
  const result = await getSharedDocument(slug);

  if (!result) notFound();

  const { document, profile, education, experiences, projects, skills, certifications } = result;

  const bundle: ProfileBundle = {
    profile: profile ?? null,
    education,
    experiences,
    projects,
    skills,
    certifications,
  };

  return (
    <main className="min-h-screen bg-surface px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Shared via ResumeAI</p>
        </div>
        {document.type === "resume" ? (
          <ResumePreview
            bundle={bundle}
            content={document.content as ResumeContent | null}
            template={document.template}
          />
        ) : (
          <CoverLetterReadOnly profile={profile} content={document.content as CoverLetterContent | null} />
        )}
      </div>
    </main>
  );
}

function CoverLetterReadOnly({ profile, content }: { profile: Profile | null; content: CoverLetterContent | null }) {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="bg-white text-gray-900 rounded-lg p-8 text-sm leading-relaxed shadow-xl">
      <div className="mb-6">
        <p className="font-semibold">{profile?.full_name}</p>
        {profile?.location && <p className="text-gray-600">{profile.location}</p>}
        {profile?.phone && <p className="text-gray-600">{profile.phone}</p>}
      </div>
      <p className="text-gray-600 mb-6">{today}</p>
      <div className="mb-6">
        <p className="text-gray-800">{content?.companyName ? `Hiring Team, ${content.companyName}` : "Hiring Team"}</p>
        {content?.roleName && <p className="text-gray-600">Re: {content.roleName} application</p>}
      </div>
      <div className="space-y-4 text-gray-800">
        {content?.hook && <p>{content.hook}</p>}
        {content?.evidence && <p>{content.evidence}</p>}
        {content?.close && <p>{content.close}</p>}
      </div>
      <p className="mt-6 text-gray-800">Sincerely,<br />{profile?.full_name}</p>
    </div>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PortfolioProjectCard from "@/components/portfolio/PortfolioProjectCard";
import PrivatePortfolioMessage from "@/components/portfolio/PrivatePortfolioMessage";
import type { Profile, Project, Skill, Certification } from "@/types/profile";

interface PortfolioPageProps {
  params: Promise<{ slug: string }>;
}

interface PortfolioData {
  isPublic: boolean;
  profile: Profile | null;
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
}


async function getPortfolioData(slug: string): Promise<PortfolioData | null> {
  const supabase = await createClient();

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("user_id, is_public")
    .eq("slug", slug)
    .maybeSingle();

  if (!portfolio) return null;

  if (!portfolio.is_public) {
    return { isPublic: false, profile: null, projects: [], skills: [], certifications: [] };
  }


  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, headline, location, github_url, linkedin_url, website_url")
    .eq("user_id", portfolio.user_id)
    .maybeSingle();

  const profileId = profile?.id ?? null;

  const [{ data: projects }, { data: skills }, { data: certifications }] = profileId
    ? await Promise.all([
        admin.from("projects").select("*").eq("profile_id", profileId).order("is_featured", { ascending: false }),
        admin.from("skills").select("*").eq("profile_id", profileId),
        admin.from("certifications").select("*").eq("profile_id", profileId),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  return {
    isPublic: true,
    profile: (profile as Profile) ?? null,
    projects: projects ?? [],
    skills: skills ?? [],
    certifications: certifications ?? [],
  };
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPortfolioData(slug);

  if (!data || !data.isPublic || !data.profile?.full_name) {
    return { title: "Portfolio — ResumeAI" };
  }

  const title = `${data.profile.full_name} — Portfolio`;
  const description = data.profile.headline ?? `View ${data.profile.full_name}'s project portfolio.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { slug } = await params;
  const data = await getPortfolioData(slug);

  if (!data) notFound();
  if (!data.isPublic) return <PrivatePortfolioMessage />;

  const { profile, projects, skills, certifications } = data;

  if (!profile?.full_name) notFound();

  const initials = profile.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  const featuredProjects = projects.filter((p) => p.is_featured);
  const otherProjects = projects.filter((p) => !p.is_featured);
  const orderedProjects = [...featuredProjects, ...otherProjects];

  return (
    <main className="min-h-screen bg-surface">
      <section className="relative overflow-hidden border-b border-surface-border">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-brand">
            {initials}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
            {profile.full_name}
          </h1>
          {profile.headline && (
            <p className="text-lg text-gray-400 max-w-xl mx-auto mb-4">{profile.headline}</p>
          )}
          {profile.location && (
            <p className="text-sm text-gray-500 mb-6">{profile.location}</p>
          )}

          <div className="flex items-center justify-center gap-4">
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-brand transition-colors">
                LinkedIn
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-brand transition-colors">
                GitHub
              </a>
            )}
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-brand transition-colors">
                Website
              </a>
            )}
          </div>
        </div>
      </section>

      {orderedProjects.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {orderedProjects.map((project) => (
              <PortfolioProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-12 border-t border-surface-border text-center">
          <h2 className="text-xl font-bold text-white mb-5">Skills</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {skills.map((skill) => (
              <span key={skill.id} className="text-sm bg-surface-card border border-surface-border text-gray-300 px-3.5 py-1.5 rounded-full">
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {certifications.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-12 border-t border-surface-border text-center">
          <h2 className="text-xl font-bold text-white mb-5">Certifications</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {certifications.map((cert) => (
              <span key={cert.id} className="text-sm bg-surface-card border border-surface-border text-gray-300 px-3.5 py-1.5 rounded-full">
                {cert.title}{cert.issuer ? ` · ${cert.issuer}` : ""}
              </span>
            ))}
          </div>
        </section>
      )}

      <footer className="text-center py-10 border-t border-surface-border">
        <p className="text-xs text-gray-600">Built with ResumeAI</p>
      </footer>
    </main>
  );
}

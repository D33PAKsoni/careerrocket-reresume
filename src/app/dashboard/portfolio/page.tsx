import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getProfileBundle } from "@/lib/profile/getProfileBundle";
import { getOrCreatePortfolio } from "@/app/actions/portfolio";
import PortfolioControls from "@/components/portfolio/PortfolioControls";
import { Rocket01Icon } from "hugeicons-react";

async function getAppUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [portfolio, bundle, appUrl] = await Promise.all([
    getOrCreatePortfolio(),
    getProfileBundle(user!.id),
    getAppUrl(),
  ]);

  const { projects } = bundle;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link href="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-white">Portfolio</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Live Portfolio</h1>
        <p className="text-gray-400 text-sm">
          A public page at your own URL showcasing your projects and profile.
        </p>
      </div>

      <PortfolioControls portfolio={portfolio} appUrl={appUrl} />

      <h2 className="text-base font-semibold text-white mb-4">
        {projects.length > 0 ? `Projects on your portfolio (${projects.length})` : "Featured projects"}
      </h2>

      {projects.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="card border-dashed flex flex-col items-center justify-center text-center py-10 gap-2">
              <span className="text-2xl opacity-30"><Rocket01Icon /></span>
              <p className="text-xs text-gray-600">Add projects in your profile first</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {projects.map((project) => (
            <div key={project.id} className="card flex items-start gap-3">
              <span className="text-xl flex-shrink-0"><Rocket01Icon /></span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white truncate">{project.title}</p>
                  {project.is_featured && (
                    <span className="text-[10px] bg-brand/10 border border-brand/20 text-brand px-1.5 py-0.5 rounded-full flex-shrink-0">Featured</span>
                  )}
                </div>
                {project.tech_stack && <p className="text-xs text-gray-500 mt-0.5">{project.tech_stack}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <Link href="/dashboard/profile" className="text-sm text-brand hover:underline">
          {projects.length > 0 ? "Manage projects in your profile →" : "Add projects to profile →"}
        </Link>
      </div>
    </div>
  );
}

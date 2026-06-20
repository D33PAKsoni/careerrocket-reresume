import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfileBundle } from "@/lib/profile/getProfileBundle";
import { computeCompleteness } from "@/lib/profile/completeness";
import { listDocuments } from "@/app/actions/documents";
import DocumentCard from "@/components/dashboard/DocumentCard";
import NewDocumentButton from "@/components/dashboard/NewDocumentButton";
import { WavingHand01Icon, Rocket01Icon, Briefcase03Icon } from "hugeicons-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ profile, education, experiences, projects, skills, certifications }, documents] =
    await Promise.all([getProfileBundle(user!.id), listDocuments()]);

  const completeness = computeCompleteness(profile, education, experiences, projects, skills, certifications);
  const firstName = profile?.full_name?.split(" ")[0] ?? null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          {firstName ? `Welcome back, ${firstName}` : "Dashboard"} <WavingHand01Icon className="inline-block ml-2" />
        </h1>
        <p className="text-gray-400 text-sm">
          {completeness.percentage < 100
            ? "Complete your profile to unlock the AI Builder."
            : "Your profile is complete — head to the Builder to generate documents."}
        </p>
      </div>

      <div className="card mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-14 h-14 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">
          {completeness.percentage >= 67 ? <Rocket01Icon /> : <Briefcase03Icon />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-white mb-1">
            {completeness.percentage >= 67 ? "Ready to build your resume" : "Set up your profile"}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {completeness.percentage >= 67
              ? "Your profile is detailed enough for the AI to generate a tailored resume, cover letter, and LinkedIn summary."
              : "Add your education, experience, projects, and skills so the AI can tailor every document to you."}
          </p>
        </div>
        <Link
          href={completeness.percentage >= 67 ? "/builder" : "/dashboard/profile"}
          className="btn-primary whitespace-nowrap flex-shrink-0"
        >
          {completeness.percentage >= 67 ? "Open Builder" : "Set up profile"}
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-white mb-4">Profile overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Completeness", value: `${completeness.percentage}%`, sub: "of profile filled" },
            { label: "Experience", value: String(experiences.length), sub: "role(s) added" },
            { label: "Projects", value: String(projects.length), sub: "project(s) added" },
            { label: "Skills", value: String(skills.length), sub: "skill(s) listed" },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-gray-300">{stat.label}</p>
              <p className="text-xs text-gray-600 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Profile completeness</span>
            <Link href="/dashboard/profile" className="text-xs text-brand hover:underline">Edit →</Link>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completeness.percentage >= 67 ? "bg-green-500" :
                completeness.percentage >= 34 ? "bg-yellow-500" : "bg-brand"
              }`}
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(completeness.sections).map(([key, done]) => (
              <span key={key} className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                done
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-surface border-surface-border text-gray-600"
              }`}>
                {done ? "✓ " : ""}{key === "basicInfo" ? "Basic Info" : key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Your documents</h2>
          <NewDocumentButton />
        </div>

        {documents.length === 0 ? (
          <div className="card border-dashed text-center py-12">
            <p className="text-gray-500 text-sm mb-4">No documents yet</p>
            <Link href="/builder" className="btn-primary text-sm">Open Builder</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

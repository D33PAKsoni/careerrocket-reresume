import { createClient } from "@/lib/supabase/server";
import { getProfileBundle } from "@/lib/profile/getProfileBundle";
import { computeCompleteness } from "@/lib/profile/completeness";
import SectionShell from "@/components/profile/SectionShell";
import BasicInfoForm from "@/components/profile/BasicInfoForm";
import EducationSection from "@/components/profile/EducationSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import ProjectsSection from "@/components/profile/ProjectsSection";
import SkillsSection from "@/components/profile/SkillsSection";
import CertificationsSection from "@/components/profile/CertificationsSection";
import ResumeUploadFlow from "@/components/profile/ResumeUploadFlow";
import Link from "next/link";
import { ProfileIcon, GraduationScrollIcon, Medal01Icon, Briefcase01Icon, GearsIcon, Rocket01Icon} from "hugeicons-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { profile, education, experiences, projects, skills, certifications } =
    await getProfileBundle(user!.id);

  const completeness = computeCompleteness(profile, education, experiences, projects, skills, certifications);

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <Link href="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-white">Profile</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Build your profile</h1>
          <p className="text-gray-400 text-sm">
            Your profile is the source of truth for all AI-generated documents.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 self-start sm:self-auto">
          <ResumeUploadFlow />
          {completeness.percentage >= 67 && (
            <Link href="/builder" className="btn-primary text-sm whitespace-nowrap">
              Open Builder →
            </Link>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Profile completeness</span>
          <span className={`text-sm font-bold ${
            completeness.percentage >= 67 ? "text-green-400" :
            completeness.percentage >= 34 ? "text-yellow-400" : "text-brand"
          }`}>{completeness.percentage}%</span>
        </div>
        <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completeness.percentage >= 67 ? "bg-green-500" :
              completeness.percentage >= 34 ? "bg-yellow-500" : "bg-brand"
            }`}
            style={{ width: `${completeness.percentage}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
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
        {completeness.percentage < 67 && (
          <p className="text-xs text-gray-600 mt-2">
            Complete {Math.ceil(6 * 0.67) - Object.values(completeness.sections).filter(Boolean).length} more section{Object.values(completeness.sections).filter(Boolean).length < 3 ? "s" : ""} to unlock the AI Builder.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <SectionShell title="Basic Info" icon={<ProfileIcon />} isComplete={completeness.sections.basicInfo}>
          <BasicInfoForm profile={profile} />
        </SectionShell>

        <SectionShell title="Education" icon={<GraduationScrollIcon />} isComplete={completeness.sections.education}>
          <EducationSection items={education} />
        </SectionShell>

        <SectionShell title="Experience" icon={<Briefcase01Icon />} isComplete={completeness.sections.experience}>
          <ExperienceSection items={experiences} />
        </SectionShell>

        <SectionShell title="Projects" icon={<Rocket01Icon />} isComplete={completeness.sections.projects}>
          <ProjectsSection items={projects} />
        </SectionShell>

        <SectionShell title="Skills" icon={<GearsIcon />} isComplete={completeness.sections.skills}>
          <SkillsSection items={skills} />
        </SectionShell>

        <SectionShell title="Certifications" icon={<Medal01Icon />} isComplete={completeness.sections.certifications}>
          <CertificationsSection items={certifications} />
        </SectionShell>
      </div>
    </div>
  );
}

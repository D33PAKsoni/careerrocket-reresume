import type { Profile, ProfileCompleteness } from "@/types/profile";

export function computeCompleteness(
  profile: Profile | null,
  education: { id: string }[],
  experience: { id: string }[],
  projects: { id: string }[],
  skills: { id: string }[],
  certifications: { id: string }[]
): ProfileCompleteness {
  const basicInfo = !!(
    profile?.full_name &&
    profile?.headline &&
    profile?.location
  );

  const sections = {
    basicInfo,
    education: education.length > 0,
    experience: experience.length > 0,
    projects: projects.length > 0,
    skills: skills.length > 0,
    certifications: certifications.length > 0,
  };

  const filled = Object.values(sections).filter(Boolean).length;
  const total = Object.keys(sections).length;
  const percentage = Math.round((filled / total) * 100);

  return { percentage, sections };
}

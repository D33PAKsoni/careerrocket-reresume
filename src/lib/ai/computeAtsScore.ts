import type { AtsScore, ResumeContent, ProfileBundle } from "@/types/profile";


function buildResumeSearchText(bundle: ProfileBundle, content: ResumeContent): string {
  const parts: string[] = [];

  if (content.summary) parts.push(content.summary);

  Object.values(content.experienceBullets ?? {}).forEach((bullets) => parts.push(...bullets));
  Object.values(content.projectBullets ?? {}).forEach((bullets) => parts.push(...bullets));

  bundle.skills.forEach((s) => parts.push(s.name));
  bundle.experiences.forEach((e) => e.description && parts.push(e.description));
  bundle.projects.forEach((p) => {
    if (p.description) parts.push(p.description);
    if (p.tech_stack) parts.push(p.tech_stack);
  });

  return parts.join(" \n ").toLowerCase();
}

export function computeAtsScore(
  bundle: ProfileBundle,
  content: ResumeContent,
  keywords: string[]
): AtsScore {
  if (keywords.length === 0) {
    return { percentage: 0, matchedKeywords: [], missingKeywords: [] };
  }

  const searchText = buildResumeSearchText(bundle, content);

  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of keywords) {
    const needle = keyword.toLowerCase().trim();
    if (!needle) continue;
    if (searchText.includes(needle)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const total = matched.length + missing.length;
  const percentage = total === 0 ? 0 : Math.round((matched.length / total) * 100);

  return { percentage, matchedKeywords: matched, missingKeywords: missing };
}

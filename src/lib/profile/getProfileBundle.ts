import { createClient } from "@/lib/supabase/server";
import type { ProfileBundle } from "@/types/profile";


export async function getProfileBundle(userId: string): Promise<ProfileBundle> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const profileId = profile?.id ?? null;

  const [eduRes, expRes, projRes, skillRes, certRes] = await Promise.all([
    profileId
      ? supabase.from("education").select("*").eq("profile_id", profileId).order("start_year", { ascending: false })
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from("experiences").select("*").eq("profile_id", profileId).order("start_date", { ascending: false })
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from("projects").select("*").eq("profile_id", profileId).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from("skills").select("*").eq("profile_id", profileId).order("category")
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from("certifications").select("*").eq("profile_id", profileId).order("issue_date", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  return {
    profile: profile ?? null,
    education: eduRes.data ?? [],
    experiences: expRes.data ?? [],
    projects: projRes.data ?? [],
    skills: skillRes.data ?? [],
    certifications: certRes.data ?? [],
  };
}

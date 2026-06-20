"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getProfileId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id }, { onConflict: "user_id" })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Profile lookup failed");
  return data.id;
}

function toFullDate(val: string | null | undefined): string | null {
  if (!val) return null;
  return val.length === 7 ? `${val}-01` : val;
}

export async function saveBasicInfo(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    user_id: user.id,
    full_name: (formData.get("full_name") as string)?.trim() || null,
    headline: (formData.get("headline") as string)?.trim() || null,
    location: (formData.get("location") as string)?.trim() || null,
    phone: (formData.get("phone") as string)?.trim() || null,
    github_url: (formData.get("github_url") as string)?.trim() || null,
    linkedin_url: (formData.get("linkedin_url") as string)?.trim() || null,
    website_url: (formData.get("website_url") as string)?.trim() || null,
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "user_id" });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveEducation(formData: FormData) {
  const profileId = await getProfileId();
  const supabase = await createClient();

  const id = formData.get("id") as string | null;
  const payload = {
    profile_id: profileId,
    institution: (formData.get("institution") as string)?.trim(),
    degree: (formData.get("degree") as string)?.trim() || null,
    field_of_study: (formData.get("field_of_study") as string)?.trim() || null,
    start_year: parseInt(formData.get("start_year") as string) || null,
    end_year: parseInt(formData.get("end_year") as string) || null,
    grade: (formData.get("grade") as string)?.trim() || null,
  };

  if (!payload.institution) return { error: "Institution name is required" };

  const { error } = id
    ? await supabase.from("education").update(payload).eq("id", id)
    : await supabase.from("education").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteEducation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("education").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveExperience(formData: FormData) {
  const profileId = await getProfileId();
  const supabase = await createClient();

  const id = toFullDate(formData.get("id") as string | null);
  const isCurrent = toFullDate(formData.get("is_current") as string) === "true";


  const payload = {
    profile_id: profileId,
    role: (formData.get("role") as string)?.trim(),
    organisation: (formData.get("organisation") as string)?.trim(),
    location: (formData.get("location") as string)?.trim() || null,
    start_date: toFullDate(formData.get("start_date") as string),
    end_date: isCurrent ? null : toFullDate(formData.get("end_date") as string),
    is_current: isCurrent,
    description: (formData.get("description") as string)?.trim() || null,
  };

  if (!payload.role) return { error: "Role is required" };
  if (!payload.organisation) return { error: "Organisation is required" };

  const { error } = id
    ? await supabase.from("experiences").update(payload).eq("id", id)
    : await supabase.from("experiences").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExperience(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("experiences").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveProject(formData: FormData) {
  const profileId = await getProfileId();
  const supabase = await createClient();

  const id = formData.get("id") as string | null;
  const payload = {
    profile_id: profileId,
    title: (formData.get("title") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || null,
    tech_stack: (formData.get("tech_stack") as string)?.trim() || null,
    link: (formData.get("link") as string)?.trim() || null,
    repo_link: (formData.get("repo_link") as string)?.trim() || null,
    is_featured: formData.get("is_featured") === "true",
  };

  if (!payload.title) return { error: "Project title is required" };

  const { error } = id
    ? await supabase.from("projects").update(payload).eq("id", id)
    : await supabase.from("projects").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveSkill(formData: FormData) {
  const profileId = await getProfileId();
  const supabase = await createClient();

  const id = formData.get("id") as string | null;
  const payload = {
    profile_id: profileId,
    name: (formData.get("name") as string)?.trim(),
    category: (formData.get("category") as string)?.trim() || null,
  };

  if (!payload.name) return { error: "Skill name is required" };

  const { error } = id
    ? await supabase.from("skills").update(payload).eq("id", id)
    : await supabase.from("skills").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSkill(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveCertification(formData: FormData) {
  const profileId = await getProfileId();
  const supabase = await createClient();

  const id = formData.get("id") as string | null;
  const payload = {
    profile_id: profileId,
    title: (formData.get("title") as string)?.trim(),
    issuer: (formData.get("issuer") as string)?.trim() || null,
    issue_date: toFullDate(formData.get("issue_date") as string || null),
    expiry_date: toFullDate(formData.get("expiry_date") as string || null),
    credential_url: (formData.get("credential_url") as string)?.trim() || null,
  };

  if (!payload.title) return { error: "Certification title is required" };

  const { error } = id
    ? await supabase.from("certifications").update(payload).eq("id", id)
    : await supabase.from("certifications").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCertification(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("certifications").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

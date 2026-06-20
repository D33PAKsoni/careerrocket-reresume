"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugifyName, isValidSlug } from "@/lib/portfolio/slug";
import type { Portfolio } from "@/types/profile";


export async function getOrCreatePortfolio(): Promise<Portfolio> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return existing as Portfolio;


  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const baseSlug = profile?.full_name ? slugifyName(profile.full_name) : `user-${user.id.slice(0, 8)}`;
  const slug = await findAvailableSlug(supabase, baseSlug);

  const { data: created, error } = await supabase
    .from("portfolios")
    .insert({ user_id: user.id, slug, is_public: false })
    .select("*")
    .single();

  if (error || !created) throw new Error(error?.message ?? "Failed to create portfolio");
  return created as Portfolio;
}

async function findAvailableSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseSlug: string
): Promise<string> {
  let candidate = baseSlug;
  for (let attempt = 1; attempt <= 50; attempt++) {
    const { data } = await supabase.from("portfolios").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }
  return `${baseSlug}-${Date.now().toString(36)}`;
}

export async function updatePortfolioSlug(portfolioId: string, newSlug: string) {
  const normalised = newSlug.toLowerCase().trim();

  if (!isValidSlug(normalised)) {
    return {
      error: "Slug must be 3-50 characters: lowercase letters, numbers, and hyphens only (no leading/trailing hyphen).",
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: clash } = await supabase
    .from("portfolios")
    .select("id")
    .eq("slug", normalised)
    .neq("id", portfolioId)
    .maybeSingle();

  if (clash) {
    return { error: "That URL is already taken. Try a different one." };
  }

  const { error } = await supabase.from("portfolios").update({ slug: normalised }).eq("id", portfolioId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/portfolio");
  return { success: true, slug: normalised };
}

export async function togglePortfolioVisibility(portfolioId: string, isPublic: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("portfolios").update({ is_public: isPublic }).eq("id", portfolioId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/portfolio");
  return { success: true };
}

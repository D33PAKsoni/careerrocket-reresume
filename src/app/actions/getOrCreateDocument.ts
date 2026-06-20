"use server";

import { createClient } from "@/lib/supabase/server";
import type { Document, DocumentType } from "@/types/profile";

export async function getOrCreateDocumentByType(
  userId: string,
  type: DocumentType
): Promise<Document> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing as Document;

  const { data: created, error } = await supabase
    .from("documents")
    .insert({ user_id: userId, type, status: "draft" })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Failed to create document");
  }

  return created as Document;
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Document, DocumentType } from "@/types/profile";


export async function createDocument(type: DocumentType): Promise<never> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("documents")
    .insert({ user_id: user!.id, type, status: "draft" })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create document");
  }

  revalidatePath("/dashboard");
  redirect(`/builder/${data.id}`);
}

export async function getDocument(id: string): Promise<Document | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as Document | null;
}

export async function listDocuments(): Promise<Document[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Document[];
}

export async function saveJobDescription(documentId: string, jobDescription: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({ job_description: jobDescription || null })
    .eq("id", documentId);

  if (error) return { error: error.message };
  revalidatePath(`/builder/${documentId}`);
  return { success: true };
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}

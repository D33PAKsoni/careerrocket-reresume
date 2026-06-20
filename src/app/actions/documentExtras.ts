"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ResumeTemplate, DocumentVersion } from "@/types/profile";


export async function setDocumentTemplate(documentId: string, template: ResumeTemplate) {
  const supabase = await createClient();
  const { error } = await supabase.from("documents").update({ template }).eq("id", documentId);
  if (error) return { error: error.message };
  revalidatePath(`/builder/${documentId}`);
  return { success: true };
}


export async function saveDocumentVersion(documentId: string, label?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("content, template")
    .eq("id", documentId)
    .maybeSingle();

  if (docError || !document) return { error: "Document not found" };

  const { error } = await supabase.from("document_versions").insert({
    document_id: documentId,
    user_id: user.id,
    content: document.content,
    template: document.template,
    label: label || null,
  });

  if (error) return { error: error.message };
  revalidatePath(`/builder/${documentId}`);
  return { success: true };
}

export async function listDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });
  return (data ?? []) as DocumentVersion[];
}

export async function restoreDocumentVersion(documentId: string, versionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: version, error: versionError } = await supabase
    .from("document_versions")
    .select("content, template")
    .eq("id", versionId)
    .eq("document_id", documentId)
    .maybeSingle();

  if (versionError || !version) return { error: "Version not found" };

  await saveDocumentVersion(documentId, "Before restore");

  const { error } = await supabase
    .from("documents")
    .update({ content: version.content, template: version.template })
    .eq("id", documentId);

  if (error) return { error: error.message };
  revalidatePath(`/builder/${documentId}`);
  return { success: true, content: version.content, template: version.template };
}


function generateSlug(): string {

  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export async function enableShareLink(documentId: string): Promise<{ error?: string; slug?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: document } = await supabase
    .from("documents")
    .select("share_slug")
    .eq("id", documentId)
    .maybeSingle();


  const slug = document?.share_slug ?? generateSlug();

  const { error } = await supabase
    .from("documents")
    .update({ share_slug: slug, is_shared: true })
    .eq("id", documentId);

  if (error) return { error: error.message };
  revalidatePath(`/builder/${documentId}`);
  return { slug };
}

export async function disableShareLink(documentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({ is_shared: false })
    .eq("id", documentId);

  if (error) return { error: error.message };
  revalidatePath(`/builder/${documentId}`);
  return { success: true };
}

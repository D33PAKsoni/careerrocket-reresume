import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileBundle } from "@/lib/profile/getProfileBundle";
import { computeCompleteness } from "@/lib/profile/completeness";
import BuilderWorkspace from "@/components/builder/BuilderWorkspace";
import type { Document } from "@/types/profile";

interface BuilderDocumentPageProps {
  params: Promise<{ documentId: string }>;
}

export default async function BuilderDocumentPage({ params }: BuilderDocumentPageProps) {
  const { documentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();

  if (!document || document.user_id !== user.id) {
    notFound();
  }

  const bundle = await getProfileBundle(user.id);
  const completeness = computeCompleteness(
    bundle.profile,
    bundle.education,
    bundle.experiences,
    bundle.projects,
    bundle.skills,
    bundle.certifications
  );

  return (
    <BuilderWorkspace
      userId={user.id}
      initialDocument={document as Document}
      bundle={bundle}
      completeness={completeness}
    />
  );
}

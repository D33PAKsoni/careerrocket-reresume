import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfileBundle } from "@/lib/profile/getProfileBundle";
import { extractJobTarget } from "@/lib/ai/extractJobTarget";
import { generateFullResume } from "@/lib/ai/generateResume";
import { generateFullCoverLetter } from "@/lib/ai/generateCoverLetter";
import { generateLinkedInContent } from "@/lib/ai/generateLinkedIn";
import { computeAtsScore } from "@/lib/ai/computeAtsScore";
import type { GenerationTone, ResumeContent } from "@/types/profile";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const documentId: string | undefined = body?.documentId;
  const tone: GenerationTone = body?.tone ?? "balanced";
  const jobDescriptionInput: string | undefined = body?.jobDescription;

  if (!documentId) {
    return NextResponse.json({ error: "documentId is required" }, { status: 400 });
  }

  // Fetch and verify ownership of the document
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();

  if (docError || !document || document.user_id !== user.id) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const jobDescription: string | null =
    (jobDescriptionInput ?? document.job_description)?.trim() || null;

  // Persist it now so it's not lost even if generation fails partway through.
  if (jobDescriptionInput !== undefined && jobDescriptionInput !== document.job_description) {
    await supabase.from("documents").update({ job_description: jobDescription }).eq("id", documentId);
  }

  const bundle = await getProfileBundle(user.id);

  if (!bundle.profile?.full_name) {
    return NextResponse.json(
      { error: "Please complete your Basic Info before generating content." },
      { status: 422 }
    );
  }

  let companyName: string | null = null;
  let roleName: string | null = null;
  let keywords: string[] = [];

  if (jobDescription) {
    const extraction = await extractJobTarget(jobDescription);
    if (extraction.success) {
      companyName = extraction.data.company_name ?? null;
      roleName = extraction.data.role_name ?? null;
      keywords = extraction.data.keywords;

      await supabase.from("job_targets").insert({
        document_id: documentId,
        user_id: user.id,
        raw_text: jobDescription,
        company_name: companyName,
        role_name: roleName,
        keywords,
      });
    }
  }

  let content: unknown;
  let atsScore = null;

  if (document.type === "resume") {
    const result = await generateFullResume(bundle, jobDescription);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
    content = result.data satisfies ResumeContent;
    if (keywords.length > 0) {
      atsScore = computeAtsScore(bundle, result.data, keywords);
    }
  } else if (document.type === "cover_letter") {
    const result = await generateFullCoverLetter({
      bundle,
      jobDescription,
      companyName,
      roleName,
      tone,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
    content = { ...result.data, companyName, roleName, tone };
  } else if (document.type === "linkedin") {
    const result = await generateLinkedInContent(bundle, jobDescription);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
    content = result.data;
  } else {
    return NextResponse.json({ error: "Unknown document type" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("documents")
    .update({ content, status: "generated" })
    .eq("id", documentId);

  if (updateError) {
    return NextResponse.json({ error: "Generated content but failed to save it. Please try again." }, { status: 500 });
  }

  await supabase.from("document_versions").insert({
    document_id: documentId,
    user_id: user.id,
    content,
    template: document.template ?? "classic",
    label: "Generated",
  });

  return NextResponse.json({ success: true, content, atsScore });
}

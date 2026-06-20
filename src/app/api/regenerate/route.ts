import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfileBundle } from "@/lib/profile/getProfileBundle";
import {
  regenerateSummary,
  regenerateExperienceBullets,
  regenerateProjectBullets,
} from "@/lib/ai/generateResume";
import { regenerateCoverLetterParagraph } from "@/lib/ai/generateCoverLetter";
import { computeAtsScore } from "@/lib/ai/computeAtsScore";
import type { GenerationTone, ResumeContent, CoverLetterContent } from "@/types/profile";

interface RegenerateBody {
  documentId: string;
  target:
    | { kind: "summary" }
    | { kind: "experience"; experienceId: string }
    | { kind: "project"; projectId: string }
    | { kind: "paragraph"; paragraph: "hook" | "evidence" | "close" };
  tone?: GenerationTone;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body: RegenerateBody | null = await request.json().catch(() => null);
  if (!body?.documentId || !body?.target) {
    return NextResponse.json({ error: "documentId and target are required" }, { status: 400 });
  }

  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", body.documentId)
    .maybeSingle();

  if (docError || !document || document.user_id !== user.id) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const bundle = await getProfileBundle(user.id);
  const jobDescription: string | null = document.job_description?.trim() || null;

  const { data: latestJobTarget } = await supabase
    .from("job_targets")
    .select("*")
    .eq("document_id", body.documentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const keywords: string[] = latestJobTarget?.keywords ?? [];

  if (document.type === "resume") {
    const existingContent = (document.content ?? {}) as ResumeContent;
    let nextContent: ResumeContent = { ...existingContent };

    if (body.target.kind === "summary") {
      const result = await regenerateSummary(bundle, jobDescription);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 502 });
      nextContent.summary = result.data.summary;
    } else if (body.target.kind === "experience") {
      const result = await regenerateExperienceBullets(bundle, body.target.experienceId, jobDescription);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 502 });
      nextContent = {
        ...nextContent,
        experienceBullets: {
          ...nextContent.experienceBullets,
          [body.target.experienceId]: result.data.bullets,
        },
      };
    } else if (body.target.kind === "project") {
      const result = await regenerateProjectBullets(bundle, body.target.projectId, jobDescription);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 502 });
      nextContent = {
        ...nextContent,
        projectBullets: {
          ...nextContent.projectBullets,
          [body.target.projectId]: result.data.bullets,
        },
      };
    } else {
      return NextResponse.json({ error: "Invalid regeneration target for resume" }, { status: 400 });
    }

    const atsScore = keywords.length > 0 ? computeAtsScore(bundle, nextContent, keywords) : null;

    const { error: updateError } = await supabase
      .from("documents")
      .update({ content: nextContent })
      .eq("id", body.documentId);

    if (updateError) {
      return NextResponse.json({ error: "Regenerated but failed to save. Please try again." }, { status: 500 });
    }

    await supabase.from("document_versions").insert({
      document_id: body.documentId,
      user_id: user.id,
      content: nextContent,
      template: document.template ?? "classic",
      label: `Regenerated: ${body.target.kind}`,
    });

    return NextResponse.json({ success: true, content: nextContent, atsScore });
  }

  if (document.type === "cover_letter") {
    if (body.target.kind !== "paragraph") {
      return NextResponse.json({ error: "Invalid regeneration target for cover letter" }, { status: 400 });
    }

    const existingContent = (document.content ?? {}) as CoverLetterContent;
    const tone = body.tone ?? existingContent.tone ?? "balanced";

    const result = await regenerateCoverLetterParagraph({
      bundle,
      jobDescription,
      companyName: existingContent.companyName ?? null,
      roleName: existingContent.roleName ?? null,
      tone,
      paragraph: body.target.paragraph,
    });

    if (!result.success) return NextResponse.json({ error: result.error }, { status: 502 });

    const nextContent: CoverLetterContent = {
      ...existingContent,
      tone,
      [body.target.paragraph]: result.data.text,
    };

    const { error: updateError } = await supabase
      .from("documents")
      .update({ content: nextContent })
      .eq("id", body.documentId);

    if (updateError) {
      return NextResponse.json({ error: "Regenerated but failed to save. Please try again." }, { status: 500 });
    }

    await supabase.from("document_versions").insert({
      document_id: body.documentId,
      user_id: user.id,
      content: nextContent,
      template: document.template ?? "classic",
      label: `Regenerated: ${body.target.paragraph}`,
    });

    return NextResponse.json({ success: true, content: nextContent });
  }

  return NextResponse.json({ error: "Regeneration is not supported for this document type" }, { status: 400 });
}

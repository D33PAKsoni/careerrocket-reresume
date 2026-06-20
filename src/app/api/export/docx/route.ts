import { NextRequest, NextResponse } from "next/server";
import { Packer } from "docx";
import { createClient } from "@/lib/supabase/server";
import { getProfileBundle } from "@/lib/profile/getProfileBundle";
import { shapeResumeData } from "@/lib/resume/shapeResumeData";
import { buildResumeDocx, buildCoverLetterDocx } from "@/lib/resume/buildDocx";
import type { ResumeContent, CoverLetterContent } from "@/types/profile";

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "document";
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const documentId = request.nextUrl.searchParams.get("documentId");
  if (!documentId) {
    return NextResponse.json({ error: "documentId is required" }, { status: 400 });
  }

  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();

  if (docError || !document || document.user_id !== user.id) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (document.type !== "resume" && document.type !== "cover_letter") {
    return NextResponse.json({ error: "DOCX export is only available for resumes and cover letters" }, { status: 400 });
  }

  const bundle = await getProfileBundle(user.id);

  let docxDocument;
  let filename: string;

  if (document.type === "resume") {
    const data = shapeResumeData(bundle, document.content as ResumeContent | null);
    docxDocument = buildResumeDocx(data, document.template);
    filename = `${slugify(bundle.profile?.full_name ?? "resume")}-resume.docx`;
  } else {
    docxDocument = buildCoverLetterDocx(bundle.profile, document.content as CoverLetterContent | null);
    filename = `${slugify(bundle.profile?.full_name ?? "cover-letter")}-cover-letter.docx`;
  }

  const buffer = await Packer.toBuffer(docxDocument);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

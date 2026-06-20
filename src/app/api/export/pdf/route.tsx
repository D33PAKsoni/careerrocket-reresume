import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getProfileBundle } from "@/lib/profile/getProfileBundle";
import { shapeResumeData } from "@/lib/resume/shapeResumeData";
import { ResumePdfDocument } from "@/lib/resume/ResumePdfDocument";
import { CoverLetterPdfDocument } from "@/lib/resume/CoverLetterPdfDocument";
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
    return NextResponse.json({ error: "PDF export is only available for resumes and cover letters" }, { status: 400 });
  }

  const bundle = await getProfileBundle(user.id);

  let buffer: Buffer;
  let filename: string;

  if (document.type === "resume") {
    const data = shapeResumeData(bundle, document.content as ResumeContent | null);
    buffer = await renderToBuffer(<ResumePdfDocument data={data} template={document.template} />);
    filename = `${slugify(bundle.profile?.full_name ?? "resume")}-resume.pdf`;
  } else {
    buffer = await renderToBuffer(
      <CoverLetterPdfDocument profile={bundle.profile} content={document.content as CoverLetterContent | null} />
    );
    filename = `${slugify(bundle.profile?.full_name ?? "cover-letter")}-cover-letter.pdf`;
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}

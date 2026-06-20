import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractPdfText } from "@/lib/ai/extractPdfText";
import { parseResumeText } from "@/lib/ai/parseResume";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large. Maximum size is 5MB." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const admin = createAdminClient();
  const storagePath = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const { error: uploadError } = await admin.storage
    .from("resume-uploads")
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Failed to store the uploaded file. Please try again." },
      { status: 500 }
    );
  }

  const extraction = await extractPdfText(buffer);
  if (!extraction.success) {
    return NextResponse.json({ error: extraction.error, storagePath }, { status: 422 });
  }

  const parseResult = await parseResumeText(extraction.text);
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error, storagePath }, { status: 422 });
  }

  return NextResponse.json({
    success: true,
    storagePath,
    data: parseResult.data,
  });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfileBundle } from "@/lib/profile/getProfileBundle";
import { redactProfileForAI } from "@/lib/green/redactProfile";
import { generateGreenCareers } from "@/lib/green/generateGreenCareers";

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const bundle = await getProfileBundle(user.id);

  if (!bundle.profile && bundle.experiences.length === 0 && bundle.projects.length === 0 && bundle.skills.length === 0) {
    return NextResponse.json(
      { error: "Add some profile details first — education, experience, projects, or skills — so we have something to match against." },
      { status: 422 }
    );
  }

  const redacted = redactProfileForAI(bundle);
  const result = await generateGreenCareers(redacted);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ success: true, roles: result.data.roles });
}

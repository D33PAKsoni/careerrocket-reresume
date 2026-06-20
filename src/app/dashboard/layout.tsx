import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthenticatedShell from "@/components/layout/AuthenticatedShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <AuthenticatedShell user={user}>{children}</AuthenticatedShell>;
}

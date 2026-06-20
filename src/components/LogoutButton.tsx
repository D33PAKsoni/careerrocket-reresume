"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-400 hover:text-white border border-surface-border hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors duration-200"
    >
      Sign out
    </button>
  );
}

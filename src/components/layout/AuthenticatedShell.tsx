"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

interface AuthenticatedShellProps {
  user: User;
  children: React.ReactNode;
}

export default function AuthenticatedShell({ user, children }: AuthenticatedShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <TopNav user={user} onMenuToggle={() => setSidebarOpen((o) => !o)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

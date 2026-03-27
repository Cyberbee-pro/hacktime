"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import { Bell, Settings, User } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Grab the session data from NextAuth
  const { data: session, status } = useSession();

  // Show a dark-mode loading state while NextAuth verifies the session cookie
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0D1117]">
        <div className="p-8 text-[#4493F8] font-mono animate-pulse text-xl tracking-widest uppercase">
          Verifying Secure Session...
        </div>
      </div>
    );
  }

  // If no session exists, kick them back to the login terminal
  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D1117] text-[#E6EDF3]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 flex justify-between items-center px-8 bg-[#0D1117] border-b border-[#30363D]">
          <h2 className="text-lg font-bold">HackClock</h2>
          <div className="flex items-center gap-4 text-[#8B949E]">
            <Bell size={18} className="cursor-pointer hover:text-white transition-colors" />
            <Settings size={18} className="cursor-pointer hover:text-white transition-colors" />
            
            {/* Show the logged-in user's email dynamically */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#30363D]">
              <span className="text-xs font-mono uppercase text-[#3FB950]">
                {session?.user?.email || 'ADMIN'}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-white border border-[#30363D]">
                <User size={16} />
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
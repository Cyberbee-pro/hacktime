"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import { Bell, Settings, User } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0D1117]">
        <div className="p-8 text-[#4493F8] font-mono animate-pulse text-xl tracking-widest uppercase">
          Verifying Secure Session...
        </div>
      </div>
    );
  }

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
            
            {/* NEW: Clickable Profile Block showing Name and Avatar */}
            <Link href="/profile" className="flex items-center gap-3 ml-4 pl-4 border-l border-[#30363D] cursor-pointer group">
              <span className="text-xs font-mono uppercase text-[#3FB950] group-hover:text-[#4493F8] transition-colors">
                {session?.user?.name || 'ADMIN'}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-white border border-[#30363D] overflow-hidden group-hover:border-[#4493F8] transition-colors">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} />
                )}
              </div>
            </Link>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import NotificationPopover from "@/components/ui/NotificationPopover";
import SettingsPopover from "@/components/ui/SettingsPopover";
import { User, Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#0D1117] text-[#E6EDF3]">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 flex justify-between items-center px-6 bg-[#0D1117] border-b border-[#30363D] z-30 shrink-0">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 -ml-2 text-[#8B949E] hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h2 className="text-lg font-bold tracking-tight">HackClock</h2>
        <div className="w-8" /> {/* Spacer */}
      </header>

      {/* Sidebar - Responsive logic handled within Sidebar or here */}
      <div className={`
        fixed inset-0 z-40 lg:relative lg:inset-auto lg:block
        ${isSidebarOpen ? 'block' : 'hidden'}
      `}>
        {/* Backdrop for mobile */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div className="relative h-full w-64">
          <Sidebar onNavItemClick={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 justify-between items-center px-8 bg-[#0D1117] border-b border-[#30363D] shrink-0">
          <h2 className="text-lg font-bold">HackClock</h2>
          <div className="flex items-center gap-4 text-[#8B949E]">

            <Link href="/profile" className="flex items-center gap-3 cursor-pointer group">
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

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
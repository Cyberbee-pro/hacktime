import Sidebar from "@/components/ui/Sidebar";
import { Bell, Settings, User } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 flex justify-between items-center px-8 bg-[#0D1117] border-b border-[#30363D]">
          <h2 className="text-lg font-bold">HackClock</h2>
          <div className="flex items-center gap-4 text-[#8B949E]">
            <Bell size={18} className="cursor-pointer hover:text-white" />
            <Settings size={18} className="cursor-pointer hover:text-white" />
            <div className="w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center ml-2">
              <User size={16} />
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
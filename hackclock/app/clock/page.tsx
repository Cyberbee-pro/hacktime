import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import JoinRoomControls from "@/components/ui/JoinRoomControls";
import { Clock, LayoutGrid, ArrowRight } from "lucide-react";

export default async function ClockInitialPage() {
  const session = await getServerSession(authOptions);
  const activeRoomId = session?.user && "activeRoomId" in session.user
    ? session.user.activeRoomId
    : undefined;
  
  // If user is authenticated and has an active room, direct them to that room's clock
  if (activeRoomId) {
    redirect(`/room/${activeRoomId}/clock`);
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0B] text-slate-200">
      <div className="hidden lg:block w-72 shrink-0">
        <Sidebar />
      </div>

      <main className="relative flex-1 flex items-center justify-center p-6 md:p-10 stagger-in">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="glass rounded-[3rem] p-8 md:p-16 max-w-xl w-full text-center border-white/5 shadow-[0_64px_128px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden">
          <div className="inline-flex p-5 rounded-3xl bg-blue-500/10 border border-blue-500/20 mb-10 shadow-2xl group transition-all hover:scale-110 duration-500">
            <Clock size={40} className="text-blue-400 group-hover:rotate-12 transition-transform duration-500" />
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
            Station Standby
          </h1>
          
          <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
            No active hackathon timeline detected. Initialize a sequence from the command center to activate the global terminal.
          </p>
          
          <div className="mb-8">
            <JoinRoomControls />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <LayoutGrid size={16} /> Command Center
            </Link>
            <Link 
              href="/flow" 
              className="px-8 py-4 bg-white/5 text-slate-300 border border-white/5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Launch Builder <ArrowRight size={14} />
            </Link>
          </div>

          {/* Footer Status */}
          <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-center gap-2 opacity-40">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
             <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Node Offline</span>
          </div>
        </div>
      </main>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MonitorPlay, LayoutGrid, ArrowRight } from "lucide-react";

export default async function StageHubPage() {
  const session = await getServerSession(authOptions);
  const activeRoomId = session?.user && "activeRoomId" in session.user
    ? session.user.activeRoomId
    : undefined;
  
  // If user is authenticated and has an active room, direct them to that room's stage
  if (activeRoomId) {
    redirect(`/room/${activeRoomId}/stage`);
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 stagger-in bg-[#0A0A0B] text-slate-200">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="glass rounded-[3rem] p-12 md:p-16 max-w-xl w-full text-center border-white/5 shadow-[0_64px_128px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden">
        <div className="inline-flex p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-10 shadow-2xl group transition-all hover:scale-110 duration-500">
          <MonitorPlay size={40} className="text-emerald-400 group-hover:rotate-3 transition-transform duration-500" />
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
          Stage Standby
        </h1>
        
        <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
          No active presentation flow detected. Link a stage endpoint from the command center to activate the immersive broadcast view.
        </p>
        
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
            Create Flow <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-center gap-2 opacity-40">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
           <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Projection Offline</span>
        </div>
      </div>
    </div>
  );
}

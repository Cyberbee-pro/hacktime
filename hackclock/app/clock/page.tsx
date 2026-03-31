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
    <div className="flex min-h-screen" style={{ backgroundColor: '#0F0F10', color: '#E6E6E6' }}>
      <div className="hidden lg:block w-72 shrink-0">
        <Sidebar />
      </div>

      <main className="relative flex-1 flex items-center justify-center p-6 md:p-10 stagger-in">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(93,0,255,0.08) 0%, rgba(255,46,154,0.04) 40%, transparent 70%)' }} />

        <div className="glass rounded-[20px] p-8 md:p-16 max-w-xl w-full text-center shadow-[0_64px_128px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="inline-flex p-5 rounded-[20px] mb-10 shadow-2xl group transition-all hover:scale-110 duration-500" style={{ backgroundColor: 'rgba(255,46,154,0.06)', border: '1px solid rgba(255,46,154,0.15)' }}>
            <Clock size={40} className="group-hover:rotate-12 transition-transform duration-500" style={{ color: '#FF2E9A' }} />
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6" style={{ color: '#E6E6E6' }}>
            Station Standby
          </h1>
          
          <p className="text-lg font-medium leading-relaxed mb-12" style={{ color: '#A0A0A0' }}>
            No active hackathon timeline detected. Initialize a sequence from the command center to activate the global terminal.
          </p>
          
          <div className="mb-8">
            <JoinRoomControls />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 rounded-[20px] font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#CFFF04', color: '#0F0F10' }}
            >
              <LayoutGrid size={16} /> Command Center
            </Link>
            <Link 
              href="/flow" 
              className="px-8 py-4 rounded-[20px] font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#A0A0A0' }}
            >
              Launch Builder <ArrowRight size={14} />
            </Link>
          </div>

          {/* Footer Status */}
          <div className="mt-16 pt-8 flex items-center justify-center gap-2 opacity-40" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#6B7280' }}></div>
             <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Node Offline</span>
          </div>
        </div>
      </main>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock } from "lucide-react";

export default async function ClockInitialPage() {
  const session = await getServerSession(authOptions);
  
  // If user is authenticated and has an active room, direct them to that room's clock
  if (session?.user && (session.user as any).activeRoomId) {
    redirect(`/room/${(session.user as any).activeRoomId}/clock`);
  }

  // Fallback for when there's no active room
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-[#0D1117] text-[#E6EDF3] p-4 text-center">
      <div className="w-16 h-16 bg-[#21262D] rounded-xl flex items-center justify-center mb-6 border border-[#30363D] shadow-lg">
        <Clock size={32} className="text-[#4493F8]" />
      </div>
      <h1 className="text-3xl font-black tracking-tight text-white mb-4">No Active Flow Detected</h1>
      <p className="text-[#8B949E] max-w-md mb-8">
        You haven&apos;t initialized any hackathon timeline yet, or you&apos;re not logged in. 
        Create a timeline from your administration dashboard to access the global clock.
      </p>
      
      <Link href="/dashboard" className="px-6 py-3 bg-[#4493F8] text-white rounded-md font-bold text-sm hover:bg-[#3178C6] transition-colors shadow-[0_0_15px_rgba(68,147,248,0.3)]">
        Return to Dashboard
      </Link>
    </div>
  );
}

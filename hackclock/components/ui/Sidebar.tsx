"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { LayoutGrid, Clock, Network, Monitor, XCircle, UserPlus, X } from 'lucide-react';

interface SidebarProps {
  onNavItemClick?: () => void;
}

export default function Sidebar({ onNavItemClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  
  // Dynamic State for both Organizers and Guests
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    // 1. Check for Organizer Session First
    const sessionRoom = (session?.user as { activeRoomId?: string })?.activeRoomId;
    if (sessionRoom) {
      const timeout = setTimeout(() => {
        setCurrentRoomId(sessionRoom);
        setIsGuest(false);
      }, 0);
      return () => clearTimeout(timeout);
    }

    // 2. Check for Guest Session Fallback
    const guestData = localStorage.getItem('hackclock_guest');
    if (guestData) {
      try {
        const parsed = JSON.parse(guestData);
        if (parsed.roomId) {
          setCurrentRoomId(parsed.roomId);
          setIsGuest(true);
          setGuestName(parsed.teamName || "Guest");
        }
      } catch (e) { console.error("Guest session parse failed"); }
    } else {
      setCurrentRoomId(null);
    }
  }, [session]);

  const handleDisconnect = async () => {
    if (isGuest) {
      // Disconnect Guest
      localStorage.removeItem('hackclock_guest');
      setCurrentRoomId(null);
      router.push('/login');
    } else {
      // Disconnect Organizer
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/active-room`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email, roomId: null })
      });
      await update({ activeRoomId: null });
    }
    onNavItemClick?.();
  };

  const handleJoinSession = async () => {
    const targetRoom = window.prompt("Enter Target Room ID:");
    if (!targetRoom) return;
    
    const teamName = window.prompt("Enter your Team/Participant Name:") || "Guest Terminal";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${targetRoom.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName })
      });

      if (res.ok) {
        localStorage.setItem('hackclock_guest', JSON.stringify({ teamName, roomId: targetRoom.toUpperCase() }));
        window.location.href = `/room/${targetRoom.toUpperCase()}/clock`; // Hard redirect to force state sync
      } else {
        alert("SECURITY FAULT: Room not found or connection rejected.");
      }
    } catch (err) {
      alert("System Error: Network connection failed.");
    }
    onNavItemClick?.();
  };

  // Restrict Nav Items based on Role
  const navItems = [
    ...(!isGuest ? [{ name: 'Dashboard', href: '/dashboard', icon: LayoutGrid }] : []),
    { name: 'Clock View', href: currentRoomId ? `/room/${currentRoomId}/clock` : '/clock', icon: Clock },
    ...(!isGuest ? [{ name: 'Flow Creation', href: '/flow', icon: Network }] : []),
    { name: 'Stage Mode', href: currentRoomId ? `/room/${currentRoomId}/stage` : '/stage', icon: Monitor },
  ];

  return (
    <aside className="w-full h-full bg-[#0A0A0B]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col z-20 overflow-y-auto">
      <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
            <Clock size={14} className="text-white" />
          </div>
          HackClock
        </h2>
        <button className="lg:hidden text-slate-400 hover:text-white transition-colors" onClick={onNavItemClick}>
          <X size={20} />
        </button>
      </div>
      
      <div className="px-6 py-6 border-b border-white/5">
        {currentRoomId ? (
          <div className="glass p-4 rounded-2xl border-blue-500/20 shadow-[0_8px_32px_rgba(0,112,243,0.1)] relative group overflow-hidden">
            {/* <div className="absolute top-0 right-0 p-2 opacity-10">
              <Network size={40} className="text-blue-500" />
            </div> */}
            <p className="text-[9px] text-blue-400 uppercase font-bold tracking-[0.15em] mb-1.5 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> 
               {isGuest ? 'GUEST NODE' : 'ACTIVE HACKATHON'}
            </p>
            <p className="text-sm text-white font-mono tracking-widest truncate font-semibold">{currentRoomId}</p>
            {isGuest && <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">{guestName}</p>}
            
            <button onClick={handleDisconnect} className="absolute right-3 top-3 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
               <XCircle size={16} />
            </button>
          </div>
        ) : (
          <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
            <p className="text-[9px] text-rose-500 uppercase font-bold tracking-[0.15em] mb-1">OFFLINE</p>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">No active connection. Join a room to begin.</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-6 px-4">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href) && item.href !== '/';
            return (
              <li key={item.name}>
                <Link 
                  href={item.href} 
                  onClick={onNavItemClick}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all group ${isActive ? 'bg-blue-600/10 text-blue-400 shadow-[inset_0_0_20px_rgba(0,112,243,0.05)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <item.icon size={18} className={isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300 transition-colors"} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Show Join Button if NOT already in a room */}
      {!currentRoomId && (
        <div className="p-6 border-t border-white/5 bg-[#0A0A0B]/40">
          <button 
            onClick={handleJoinSession}
            className="w-full py-3 bg-white/5 border border-white/5 text-slate-300 rounded-xl font-bold text-[10px] hover:bg-white/10 hover:text-white transition-all flex justify-center items-center gap-2 tracking-[0.1em] uppercase shadow-lg active:scale-95"
          >
            <UserPlus size={14} /> Connect Terminal
          </button>
        </div>
      )}
    </aside>
  );
}
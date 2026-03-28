"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { LayoutGrid, Clock, Network, Monitor, XCircle, UserPlus } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  
  // Dynamic State for both Organizers and Guests
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    // 1. Check for Organizer Session First
    const sessionRoom = (session?.user as any)?.activeRoomId;
    if (sessionRoom) {
      setCurrentRoomId(sessionRoom);
      setIsGuest(false);
      return;
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
      await fetch('http://localhost:5000/api/auth/active-room', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email, roomId: null })
      });
      await update({ activeRoomId: null });
    }
  };

  const handleJoinSession = async () => {
    const targetRoom = window.prompt("Enter Target Room ID:");
    if (!targetRoom) return;
    
    const teamName = window.prompt("Enter your Team/Participant Name:") || "Guest Terminal";

    try {
      const res = await fetch(`http://localhost:5000/api/hackathons/${targetRoom.toUpperCase()}/join`, {
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
  };

  // Restrict Nav Items based on Role
  const navItems = [
    ...(!isGuest ? [{ name: 'Dashboard', href: '/dashboard', icon: LayoutGrid }] : []),
    { name: 'Clock View', href: currentRoomId ? `/room/${currentRoomId}/clock` : '/clock', icon: Clock },
    ...(!isGuest ? [{ name: 'Flow Creation', href: '/flow', icon: Network }] : []),
    { name: 'Stage Mode', href: currentRoomId ? `/room/${currentRoomId}/stage` : '/stage', icon: Monitor },
  ];

  return (
    <aside className="w-64 bg-[#0D1117] border-r border-[#30363D] flex flex-col z-20 h-screen shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-[#30363D]">
        <h2 className="text-white font-bold tracking-tight">HackClock</h2>
      </div>
      
      <div className="px-6 py-4 border-b border-[#30363D]">
        {currentRoomId ? (
          <div className="bg-[#161B22] p-3 rounded-md border border-[#4493F8] shadow-[0_0_10px_rgba(68,147,248,0.15)] relative group">
            <p className="text-[10px] text-[#4493F8] uppercase font-bold tracking-wider mb-1 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[#4493F8] animate-pulse"></span> 
               {isGuest ? 'GUEST SESSION' : 'ACTIVE SESSION'}
            </p>
            <p className="text-sm text-white font-mono tracking-widest">{currentRoomId}</p>
            {isGuest && <p className="text-[10px] text-[#8B949E] uppercase tracking-wider mt-1 truncate">{guestName}</p>}
            
            <button onClick={handleDisconnect} className="absolute right-3 top-4 text-[#8B949E] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
               <XCircle size={16} />
            </button>
          </div>
        ) : (
          <div className="bg-[#2D1A1E] p-3 rounded-md border border-red-900">
            <p className="text-[10px] text-red-500 uppercase font-bold tracking-wider mb-1">NO CONNECTION</p>
            <p className="text-xs text-[#8B949E]">Join a room to activate Terminal.</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href) && item.href !== '/';
            return (
              <li key={item.name}>
                <Link href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold tracking-wide transition-all ${isActive ? 'bg-[#161B22] text-[#4493F8] border border-[#30363D]' : 'text-[#8B949E] border border-transparent hover:text-white hover:bg-[#161B22]/50'}`}>
                  <item.icon size={16} className={isActive ? "text-[#4493F8]" : "text-[#8B949E]"} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Show Join Button if NOT already in a room */}
      {!currentRoomId && (
        <div className="p-4 border-t border-[#30363D] bg-[#0D1117]">
          <button 
            onClick={handleJoinSession}
            className="w-full py-2.5 bg-transparent border border-[#30363D] text-[#8B949E] rounded-md font-bold text-xs hover:border-[#8B949E] hover:text-white transition-colors flex justify-center items-center gap-2 tracking-wider uppercase"
          >
            <UserPlus size={14} /> Join Session
          </button>
        </div>
      )}
    </aside>
  );
}
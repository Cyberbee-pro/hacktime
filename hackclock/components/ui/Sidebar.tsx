"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutGrid, Clock, Network, Monitor, XCircle } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, update } = useSession();
  const activeRoomId = (session?.user as any)?.activeRoomId;

  const handleDisconnect = async () => {
    await fetch('http://localhost:5000/api/auth/active-room', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session?.user?.email, roomId: null })
    });
    await update({ activeRoomId: null });
  };

  // DYNAMIC LINKS: Routes to the specific room if one is active!
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Clock View', href: activeRoomId ? `/room/${activeRoomId}/clock` : '/clock', icon: Clock },
    { name: 'Flow Creation', href: '/flow', icon: Network },
    { name: 'Stage Mode', href: activeRoomId ? `/room/${activeRoomId}/stage` : '/stage', icon: Monitor },
  ];

  return (
    <aside className="w-64 bg-[#0D1117] border-r border-[#30363D] flex flex-col z-20 h-screen shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-[#30363D]">
        <h2 className="text-white font-bold tracking-tight">HackClock</h2>
      </div>
      
      <div className="px-6 py-4 border-b border-[#30363D]">
        {activeRoomId ? (
          <div className="bg-[#161B22] p-3 rounded-md border border-[#4493F8] shadow-[0_0_10px_rgba(68,147,248,0.15)] relative group">
            <p className="text-[10px] text-[#4493F8] uppercase font-bold tracking-wider mb-1 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[#4493F8] animate-pulse"></span> ACTIVE SESSION
            </p>
            <p className="text-sm text-white font-mono tracking-widest">{activeRoomId}</p>
            <button onClick={handleDisconnect} className="absolute right-3 top-4 text-[#8B949E] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
               <XCircle size={16} />
            </button>
          </div>
        ) : (
          <div className="bg-[#2D1A1E] p-3 rounded-md border border-red-900">
            <p className="text-[10px] text-red-500 uppercase font-bold tracking-wider mb-1">NO CONNECTION</p>
            <p className="text-xs text-[#8B949E]">Join a room to activate Stage features.</p>
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
    </aside>
  );
}
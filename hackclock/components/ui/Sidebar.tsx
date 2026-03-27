"use client";

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { LayoutGrid, Clock, Network, Monitor, Rocket, BookOpen, LifeBuoy } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  
  // Extract room ID from URL if we are in a room, otherwise default to a demo room for the UI
  const currentRoom = params?.id ? String(params.id) : 'DEMO';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Clock View', href: `/room/${currentRoom}/clock`, icon: Clock },
    { name: 'Flow Creation', href: '/flow', icon: Network },
    { name: 'Stage Mode', href: `/room/${currentRoom}/stage`, icon: Monitor },
  ];

  return (
    <aside className="w-64 bg-[#0D1117] border-r border-[#30363D] flex flex-col z-20 h-screen">
      <div className="h-16 flex items-center px-6 border-b border-[#30363D]">
        <h2 className="text-white font-bold tracking-tight">HackClock</h2>
      </div>
      
      <div className="px-6 py-4 border-b border-[#30363D]">
        <div className="flex items-center gap-3 bg-[#161B22] p-2 rounded-md border border-[#30363D]">
          <div className="w-8 h-8 bg-[#21262D] rounded flex items-center justify-center">
            <Clock size={16} className="text-[#4493F8]" />
          </div>
          <div>
            <p className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">//:Hacking</p>
            <p className="text-sm text-white font-medium">HackClock V1</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.includes(item.href);
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold tracking-wide transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#161B22] text-[#4493F8] border border-[#30363D] shadow-[0_0_10px_rgba(68,147,248,0.1)]' 
                      : 'text-[#8B949E] border border-transparent hover:text-white hover:bg-[#161B22]/50'
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-[#4493F8]" : "text-[#8B949E]"} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 space-y-4 border-t border-[#30363D] bg-[#0D1117]">
        <button className="w-full py-2.5 bg-[#4493F8] text-white rounded-md font-bold text-sm hover:bg-[#3178C6] transition-colors flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(68,147,248,0.3)]">
          <Rocket size={16} /> Deploy Phase
        </button>
        
        <div className="flex flex-col gap-3 px-2 text-xs font-bold text-[#8B949E]">
          <span className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors"><BookOpen size={14}/> DOCS</span>
          <span className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors"><LifeBuoy size={14}/> SUPPORT</span>
        </div>
      </div>
    </aside>
  );
}
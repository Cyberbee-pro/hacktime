"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Clock, Layers, MonitorPlay } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
    { name: "CLOCK VIEW", href: "/clock", icon: Clock },
    { name: "FLOW CREATION", href: "/flow", icon: Layers },
    { name: "STAGE MODE", href: "/stage", icon: MonitorPlay },
  ];

  return (
    <div className="w-64 h-screen bg-[#161B22] border-r border-[#30363D] flex flex-col">
      <div className="p-6 border-b border-[#30363D]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#3FB950]"></div>
          <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">Phase: Hacking</span>
        </div>
        <h1 className="text-xl font-bold text-white">GitCity Hack</h1>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name}
              href={item.href} 
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive 
                  ? "bg-[#1F2937] text-[#4493F8] border-l-2 border-[#4493F8]" 
                  : "text-[#8B949E] hover:text-white border-l-2 border-transparent hover:bg-[#1F2937]/50"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <button className="w-full py-2 bg-[#1B2E24] text-[#3FB950] border border-[#2EA043] rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#233D30] transition-colors">
          - Deploy Phase
        </button>
      </div>
    </div>
  );
}
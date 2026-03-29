"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Settings, User, Monitor, Palette, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function SettingsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: User, label: 'Profile Settings', href: '/profile' },
    { icon: Monitor, label: 'Stage Preferences', href: '#' },
    { icon: Palette, label: 'Theme Configuration', href: '#' },
  ];

  return (
    <div className="relative" ref={popoverRef}>
      <button title="Terminal Console Settings" onClick={() => setIsOpen(!isOpen)} className="outline-none">
        <Settings 
          size={18} 
          className={`cursor-pointer transition-colors ${isOpen ? 'text-white' : 'hover:text-white'}`}
        />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-4 w-64 bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
          <div className="p-4 border-b border-[#30363D]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Console Settings</h3>
          </div>
          
          <div className="p-2">
            {menuItems.map((item, i) => (
              <Link 
                key={i} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[#8B949E] hover:text-white hover:bg-[#30363D]/50 transition-all"
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="p-2 bg-[#0D1117] border-t border-[#30363D]">
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-950/20 transition-all uppercase tracking-widest"
            >
              <LogOut size={14} />
              Terminate Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

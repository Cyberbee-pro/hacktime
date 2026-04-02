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
          className="cursor-pointer transition-colors hover:text-white"
          style={{ color: isOpen ? '#E6E6E6' : '#A0A0A0' }}
        />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-4 w-64 rounded-[20px] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden" style={{ backgroundColor: '#1C1C1C', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#E6E6E6' }}>Console Settings</h3>
          </div>
          
          <div className="p-2">
            {menuItems.map((item, i) => (
              <Link 
                key={i} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
                style={{ color: '#A0A0A0' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#E6E6E6'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#A0A0A0'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="p-2" style={{ backgroundColor: '#0F0F10', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
              style={{ color: '#F43F5E' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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

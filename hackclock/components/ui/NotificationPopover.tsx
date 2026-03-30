"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Info } from 'lucide-react';

export default function NotificationPopover() {
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

  return (
    <div className="relative" ref={popoverRef}>
      <button title="System Alerts & Notifications" onClick={() => setIsOpen(!isOpen)} className="outline-none">
        <Bell 
          size={18} 
          className={`cursor-pointer transition-colors ${isOpen ? 'text-white' : 'hover:text-white'}`}
        />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-4 border-b border-[#30363D]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">System Notifications</h3>
          </div>
          <div className="p-8 text-center">
            <Info size={32} className="mx-auto mb-4 text-[#30363D]" />
            <p className="text-sm text-[#8B949E]">No active alerts. Your terminal session is nominal.</p>
          </div>
          <div className="p-3 bg-[#0D1117] rounded-b-xl border-t border-[#30363D]">
            <button className="w-full text-[10px] font-bold uppercase tracking-widest text-[#4493F8] hover:text-[#3178C6] transition-colors">
              Clear All Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

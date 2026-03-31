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
          className="cursor-pointer transition-colors hover:text-white"
          style={{ color: isOpen ? '#E6E6E6' : '#A0A0A0' }}
        />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 rounded-[20px] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right" style={{ backgroundColor: '#1C1C1C', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#E6E6E6' }}>System Notifications</h3>
          </div>
          <div className="p-8 text-center">
            <Info size={32} className="mx-auto mb-4" style={{ color: '#6B7280' }} />
            <p className="text-sm" style={{ color: '#A0A0A0' }}>No active alerts. Your terminal session is nominal.</p>
          </div>
          <div className="p-3 rounded-b-[20px]" style={{ backgroundColor: '#0F0F10', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <button className="w-full text-[10px] font-bold uppercase tracking-widest transition-colors" style={{ color: '#FF2E9A' }}>
              Clear All Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

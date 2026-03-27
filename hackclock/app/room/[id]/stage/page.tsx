"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Terminal, Megaphone } from 'lucide-react';

export default function StageMode({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.id;

  // State mapping for dynamic club data (Ready for Socket.io integration)
  const [eventData, setEventData] = useState({
    name: "GitCity Hack",
    stage: "Main Arena",
    status: "HACKING ACTIVE",
    currentPhase: {
      title: "Core Development",
      description: "Infrastructure & API Integrations"
    },
    nextPhase: {
      title: "Technical Review",
      description: "Architecture Walkthrough starts in 45m"
    },
    network: {
      status: "STABLE",
      speed: "1.2GBPS"
    }
  });

  // Dynamic ticking clock state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 8 });

  // Simulate a live countdown timer until we connect the backend
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            hours = hours > 0 ? hours - 1 : 0;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formatting helpers to ensure double digits (e.g., "08" instead of "8")
  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div className="h-screen w-screen bg-[#0D1117] text-[#E6EDF3] flex flex-col overflow-hidden font-sans">
      
      {/* Top Navigation Bar */}
      <header className="h-24 px-12 flex justify-between items-center border-b border-[#30363D]/50">
        <div className="flex items-center gap-6">
          {/* Dashboard Return Link */}
          <Link href="/dashboard" className="cursor-pointer group">
            <div className="w-14 h-14 bg-[#4493F8] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(68,147,248,0.4)] group-hover:bg-[#3178C6] transition-colors">
               <Terminal size={32} className="text-[#0D1117]" strokeWidth={2.5} />
            </div>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white leading-none mb-1">{eventData.name}</h1>
            <p className="text-[11px] text-[#4493F8] font-bold tracking-[0.3em] uppercase">Global Innovation Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="text-right">
            <p className="text-[10px] text-[#8B949E] font-bold tracking-[0.2em] uppercase mb-1">Phase Status</p>
            <p className="text-sm font-bold text-[#3FB950] flex items-center gap-2 justify-end">
              <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse shadow-[0_0_8px_rgba(63,185,80,0.8)]"></span>
              {eventData.status}
            </p>
          </div>
          <div className="border-l border-[#30363D] pl-12 text-right">
            <p className="text-[10px] text-[#8B949E] font-bold tracking-[0.2em] uppercase mb-1">Stage</p>
            <p className="text-xl font-black text-white uppercase tracking-wider">{eventData.stage}</p>
          </div>
        </div>
      </header>

      {/* Main Massive Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative">
        
        {/* Subtle background tech texture */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-[#0D1117] to-[#0D1117]"></div>

        <p className="text-sm text-[#8B949E] font-bold tracking-[0.5em] uppercase mb-8 z-10">
          Time Remaining
        </p>

        {/* Dynamic Massive Glowing Timer */}
        <div className="text-[18rem] font-black tracking-tighter leading-none text-white font-mono drop-shadow-[0_0_80px_rgba(255,255,255,0.2)] z-10 mb-20 flex items-center">
          {formatTime(timeLeft.hours)}
          <span className="text-[#30363D] drop-shadow-none mx-2">:</span>
          {formatTime(timeLeft.minutes)}
          <span className="text-[#30363D] drop-shadow-none mx-2">:</span>
          {formatTime(timeLeft.seconds)}
        </div>

        {/* Dynamic Phase Info Cards */}
        <div className="flex gap-12 z-10">
          <div className="w-[500px] bg-transparent border-l-2 border-[#4493F8] pl-8">
            <p className="text-[11px] text-[#4493F8] font-bold tracking-[0.2em] uppercase mb-3">Current Phase</p>
            <h2 className="text-4xl font-black text-white mb-3 tracking-tight">{eventData.currentPhase.title}</h2>
            <p className="text-[#8B949E] text-lg font-medium">{eventData.currentPhase.description}</p>
          </div>

          <div className="w-[500px] bg-[#161B22]/50 border border-[#30363D] rounded-xl p-8">
            <p className="text-[11px] text-[#8B949E] font-bold tracking-[0.2em] uppercase mb-3">Next Up</p>
            <h2 className="text-4xl font-black text-[#8B949E] mb-3 tracking-tight">{eventData.nextPhase.title}</h2>
            <p className="text-[#484F58] text-lg font-medium">{eventData.nextPhase.description}</p>
          </div>
        </div>
      </main>

      {/* Bottom Footer Bar */}
      <footer className="h-20 flex justify-between items-stretch border-t border-[#30363D]/50 bg-[#0D1117]">
        <div className="w-80 bg-[#21262D] flex items-center px-8 gap-4 border-r border-[#30363D]">
          <Megaphone className="text-[#3FB950]" size={20} />
          <span className="text-sm font-bold tracking-[0.2em] text-white uppercase">Alerts</span>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
           <span className="text-[10px] font-mono text-[#30363D] uppercase tracking-widest">
              ROOM ID // {roomId}
           </span>
        </div>

        <div className="px-12 flex flex-col justify-center border-l border-[#30363D] text-right">
          <p className="text-[9px] text-[#8B949E] font-bold tracking-[0.2em] uppercase mb-1">Network State</p>
          <p className="text-xs font-bold text-[#3FB950] tracking-widest leading-tight">
            {eventData.network.status} <br/>
            // {eventData.network.speed}
          </p>
        </div>
      </footer>

    </div>
  );
}
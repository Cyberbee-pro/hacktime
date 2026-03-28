"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Terminal, Megaphone, Clock } from 'lucide-react';

export default function StageMode({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.id;
  const [eventData, setEventData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [realTime, setRealTime] = useState("");

  useEffect(() => {
    const tick = () => setRealTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchRoom = async () => {
      const res = await fetch(`http://localhost:5000/api/hackathons/${roomId}`);
      if (res.ok) setEventData(await res.json());
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (!eventData) return;
    if (eventData.status === 'PAUSED' && eventData.pausedRemainingMs) {
      const distance = eventData.pausedRemainingMs;
      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
      return; 
    }
    if (!eventData.phaseEndTime || eventData.status !== 'RUNNING') return;

    const targetTime = new Date(eventData.phaseEndTime).getTime();
    const updateTimer = () => {
      const distance = targetTime - new Date().getTime();
      if (distance <= 0) return setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };
    updateTimer(); 
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [eventData]);

  const formatTime = (time: number) => Math.max(0, time).toString().padStart(2, '0');
  if (!eventData) return <div className="h-screen w-screen bg-[#0D1117]"></div>;

  const currentPhase = eventData.phases[eventData.currentPhaseIndex] || {};
  const nextPhase = eventData.phases[eventData.currentPhaseIndex + 1] || null;
  const accent = eventData.branding?.accentColor || '#4493F8';

  return (
    <div className="h-screen w-screen bg-[#0D1117] text-[#E6EDF3] flex flex-col overflow-hidden font-sans">
      <header className="h-24 px-12 flex justify-between items-center border-b border-[#30363D]/50">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="cursor-pointer group">
            {eventData.branding?.logoUrl ? (
              <div className="h-14 bg-white/5 rounded-xl flex items-center justify-center px-4 border border-[#30363D] hover:border-white transition-colors">
                <img src={eventData.branding.logoUrl} alt="Logo" className="h-8 object-contain" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: accent, boxShadow: `0 0 20px ${accent}40` }}>
                 <Terminal size={32} className="text-[#0D1117]" strokeWidth={2.5} />
              </div>
            )}
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white leading-none mb-1">{eventData.name}</h1>
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: accent }}>Global Innovation Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="text-right">
            <p className="text-[10px] text-[#8B949E] font-bold tracking-[0.2em] uppercase mb-1">Phase Status</p>
            <p className={`text-sm font-bold flex items-center gap-2 justify-end ${eventData.status === 'RUNNING' ? 'text-white' : 'text-red-500 animate-pulse'}`}>
              <span className={`w-2 h-2 rounded-full ${eventData.status === 'RUNNING' ? 'animate-pulse' : 'bg-red-500'}`} style={{ backgroundColor: eventData.status === 'RUNNING' ? accent : undefined, boxShadow: eventData.status === 'RUNNING' ? `0 0 8px ${accent}` : undefined }}></span>
              {eventData.status}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-[#0D1117] to-[#0D1117]"></div>
        <p className="text-sm text-[#8B949E] font-bold tracking-[0.5em] uppercase mb-8 z-10">Time Remaining</p>
        <div className="text-[18rem] font-black tracking-tighter leading-none text-white font-mono z-10 mb-16 flex items-center" style={{ textShadow: `0 0 80px ${accent}30` }}>
          {formatTime(timeLeft.hours)}
          <span className="text-[#30363D] drop-shadow-none mx-2">:</span>
          {formatTime(timeLeft.minutes)}
          <span className="text-[#30363D] drop-shadow-none mx-2">:</span>
          {formatTime(timeLeft.seconds)}
        </div>

        <div className="flex gap-12 z-10 mb-12">
          <div className="w-[500px] bg-transparent border-l-4 pl-8" style={{ borderColor: accent }}>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: accent }}>Current Phase</p>
            <h2 className="text-4xl font-black text-white mb-3 tracking-tight">{currentPhase.name}</h2>
            <p className="text-[#8B949E] text-lg font-medium">{currentPhase.durationMinutes} Minute Sprint</p>
          </div>
          {nextPhase && (
            <div className="w-[500px] bg-[#161B22]/50 border border-[#30363D] rounded-xl p-8">
              <p className="text-[11px] text-[#8B949E] font-bold tracking-[0.2em] uppercase mb-3">Next Up</p>
              <h2 className="text-4xl font-black text-[#8B949E] mb-3 tracking-tight">{nextPhase.name}</h2>
            </div>
          )}
        </div>

        {/* NEW: Massive Centralized Room ID Block */}
        <div className="z-10 text-center bg-[#161B22]/80 border border-[#30363D] px-16 py-6 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
           <p className="text-[11px] font-bold tracking-[0.5em] uppercase mb-2" style={{ color: accent }}>Participant Connection Room</p>
           <p className="text-7xl font-black text-white font-mono tracking-widest">{roomId}</p>
        </div>
      </main>

      <footer className="h-20 flex justify-between items-stretch border-t border-[#30363D]/50 bg-[#0D1117]">
        <div className="w-80 bg-[#21262D] flex items-center px-8 gap-4 border-r border-[#30363D]">
          <Megaphone size={20} style={{ color: accent }} />
          <span className="text-sm font-bold tracking-[0.2em] text-white uppercase truncate">{eventData.announcement || "SYSTEM NOMINAL"}</span>
        </div>
        
        <div className="flex-1 flex items-center justify-center gap-6">
           <div className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] px-4 py-2 rounded-md">
              <Clock size={14} style={{ color: accent }} />
              <span className="text-xs font-mono text-white tracking-widest">{realTime}</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
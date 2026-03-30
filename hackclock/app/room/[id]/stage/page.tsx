"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Terminal, Megaphone, Clock, X, History } from 'lucide-react';
import ClockFace from '@/components/ui/ClockFace';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StageMode({ params }: { params: Promise<{ id: string }> }) {
  const [roomId, setRoomId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [realTime, setRealTime] = useState("");

  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [lastAnnouncementTime, setLastAnnouncementTime] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    params.then(p => setRoomId(p.id));
  }, [params]);

  useEffect(() => {
    if (roomId) {
      const localHistory = localStorage.getItem(`stage_history_${roomId}`);
      if (localHistory) {
        const timeout = setTimeout(() => {
          setHistory(JSON.parse(localHistory));
        }, 0);
        return () => clearTimeout(timeout);
      }
    }
  }, [roomId]);

  const { data: eventData } = useSWR(
    roomId ? `${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${roomId}` : null, 
    fetcher, 
    { refreshInterval: 5000 }
  );

  useEffect(() => {
    const tick = () => setRealTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!eventData) return;

    // 1. History Tracking logic (Fire once per unique timestamp)
    if (eventData.announcementTimestamp && eventData.announcementTimestamp !== lastAnnouncementTime) {
      if (eventData.announcement) {
        const timeout = setTimeout(() => {
          setHistory(prev => {
            if (prev.includes(eventData.announcement)) return prev;
            const newHistory = [eventData.announcement, ...prev].slice(0, 10);
            localStorage.setItem(`stage_history_${roomId}`, JSON.stringify(newHistory));
            return newHistory;
          });
        }, 0);
        return () => clearTimeout(timeout);
      }
    }

    // 2. Overlay Trigger logic
    if (isInitialLoad) {
      const ts = eventData.announcementTimestamp;
      setTimeout(() => {
        setLastAnnouncementTime(ts);
        setIsInitialLoad(false);
      }, 0);
      return;
    }

    if (eventData.announcementTimestamp && eventData.announcementTimestamp !== lastAnnouncementTime) {
      setTimeout(() => setLastAnnouncementTime(eventData.announcementTimestamp), 0);
      if (eventData.announcement) {
        const announcementTimeout = setTimeout(() => setShowAnnouncement(true), 0);
        const durationMs = (eventData.announcementDuration || 10) * 1000;
        const timer = setTimeout(() => setShowAnnouncement(false), durationMs);
        return () => {
          clearTimeout(announcementTimeout);
          clearTimeout(timer);
        };
      }
    }
  }, [eventData, isInitialLoad, lastAnnouncementTime, roomId]);

  useEffect(() => {
    if (!eventData) return;
    if (eventData.status === 'PAUSED' && eventData.pausedRemainingMs) {
      const distance = eventData.pausedRemainingMs;
      const timeout = setTimeout(() => {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }, 0);
      return () => clearTimeout(timeout);
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
  
  if (!eventData || eventData.error || !eventData.phases) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-[#0A0A0B]">
        <div className="glass rounded-[3rem] p-12 md:p-16 max-w-xl w-full text-center border-white/5 shadow-2xl relative z-10 overflow-hidden">
          <div className="inline-flex p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 mb-10 shadow-2xl">
            <X size={40} className="text-rose-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
            Hackathon Not Found
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
            The stage endpoint you are attempting to access does not exist or has been decommissioned.
          </p>
          <Link 
            href="/dashboard" 
            className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-xl active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <Terminal size={16} /> Hub Terminal
          </Link>
        </div>
      </div>
    );
  }

  const currentPhase = eventData.phases[eventData.currentPhaseIndex] || {};
  const nextPhase = eventData.phases[eventData.currentPhaseIndex + 1] || null;
  const accent = eventData.branding?.accentColor || '#4493F8';

  return (
    <div className="h-screen w-screen bg-[#0D1117] text-[#E6EDF3] flex flex-col overflow-hidden font-sans relative">
      <header className="h-20 md:h-24 px-6 md:px-12 flex justify-between items-center border-b border-[#30363D]/50 shrink-0">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/dashboard" className="cursor-pointer group">
            {eventData.branding?.logoUrl ? (
              <div className="h-10 md:h-14 bg-white/5 rounded-xl flex items-center justify-center px-3 md:px-4 border border-[#30363D] hover:border-white transition-colors">
                <img src={eventData.branding.logoUrl} alt="Logo" className="h-6 md:h-8 object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: accent, boxShadow: `0 0 20px ${accent}40` }}>
                 <Terminal size={24} className="text-[#0D1117] md:size-[32px]" strokeWidth={2.5} />
              </div>
            )}
          </Link>
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight text-white leading-none mb-1 truncate max-w-[150px] sm:max-w-none">{eventData.name}</h1>
            <p className="text-[9px] md:text-[11px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase" style={{ color: accent }}>Innovation Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-12">
          <div className="text-right">
            <p className="text-[8px] md:text-[10px] text-[#8B949E] font-bold tracking-[0.2em] uppercase mb-1">Status</p>
            <p className={`text-xs md:text-sm font-bold flex items-center gap-2 justify-end ${eventData.status === 'RUNNING' ? 'text-white' : 'text-red-500 animate-pulse'}`}>
              <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${eventData.status === 'RUNNING' ? 'animate-pulse' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} style={{ backgroundColor: eventData.status === 'RUNNING' ? accent : undefined, boxShadow: eventData.status === 'RUNNING' ? `0 0 8px ${accent}` : undefined }}></span>
              <span className="hidden sm:inline">{eventData.status}</span>
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative p-6">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-[#0D1117] to-[#0D1117]"></div>
        
        <p className="text-[10px] md:text-sm text-[#8B949E] font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase mb-4 md:mb-8 z-10">Time Remaining</p>
        
        <ClockFace
          hours={formatTime(timeLeft.hours)}
          minutes={formatTime(timeLeft.minutes)}
          seconds={formatTime(timeLeft.seconds)}
          className="z-10 mb-8 md:mb-16"
        />

        <div className="flex flex-col md:flex-row gap-6 md:gap-12 z-10 mb-8 md:mb-12 w-full max-w-5xl">
          <div className="flex-1 bg-transparent border-l-4 pl-6 md:pl-8" style={{ borderColor: accent }}>
            <p className="text-[9px] md:text-[11px] font-bold tracking-[0.2em] uppercase mb-2 md:mb-3" style={{ color: accent }}>Current Phase</p>
            <h2 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-3 tracking-tight">{currentPhase.name}</h2>
            <p className="text-[#8B949E] text-sm md:text-lg font-medium">{currentPhase.durationMinutes} Minute Sprint</p>
          </div>
          {nextPhase && (
            <div className="flex-1 bg-[#161B22]/50 border border-[#30363D] rounded-xl p-6 md:p-8">
              <p className="text-[9px] md:text-[11px] text-[#8B949E] font-bold tracking-[0.2em] uppercase mb-2 md:mb-3">Next Up</p>
              <h2 className="text-2xl md:text-4xl font-black text-[#8B949E] mb-1 tracking-tight">{nextPhase.name}</h2>
            </div>
          )}
        </div>

        <div className="z-10 text-center bg-[#161B22]/80 border border-[#30363D] px-8 md:px-16 py-4 md:py-6 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
           <p className="text-[9px] md:text-[11px] font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase mb-1 md:mb-2" style={{ color: accent }}>Room Access Code</p>
           <p className="text-4xl md:text-7xl font-black text-white font-mono tracking-widest">{roomId}</p>
        </div>
      </main>

      <footer className="h-16 md:h-20 flex justify-between items-stretch border-t border-[#30363D]/50 bg-[#0D1117] shrink-0">
        <div 
          onClick={() => setShowHistory(true)}
          className="w-40 md:w-80 bg-[#21262D] flex items-center px-4 md:px-8 gap-3 md:gap-4 border-r border-[#30363D] cursor-pointer hover:bg-[#30363D] transition-all group"
        >
          <Megaphone size={16} className="md:size-[20px] transition-transform group-hover:scale-110" style={{ color: accent }} />
          <span className="text-[10px] md:text-sm font-bold tracking-[0.1em] md:tracking-[0.2em] text-white uppercase truncate">{eventData.announcement || "SYSTEM NOMINAL"}</span>
        </div>
        
        <div className="flex-1 flex items-center justify-center gap-4 md:gap-6">
           <div className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] px-3 md:px-4 py-1.5 md:py-2 rounded-md">
              <Clock size={12} className="md:size-[14px]" style={{ color: accent }} />
              <span className="text-[10px] md:text-xs font-mono text-white tracking-widest">{realTime}</span>
           </div>
        </div>
      </footer>

      {/* Expandable History Overlay */}
      {showHistory && (
        <div 
          className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-end justify-start p-6 md:p-12 animate-in fade-in duration-300"
          onClick={() => setShowHistory(false)}
        >
          <div 
            className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#30363D] flex justify-between items-center bg-[#0D1117]">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white flex items-center gap-3">
                <History size={16} className="text-[#4493F8]" /> Broadcast History
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-[#8B949E] hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {history.length === 0 ? (
                <p className="text-xs text-[#444] italic text-center py-12">No previous broadcasts captured.</p>
              ) : (
                history.map((item, i) => (
                  <div key={i} className="p-4 bg-[#0D1117] border border-[#30363D] rounded-xl animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 50}ms` }}>
                    <p className="text-sm text-white font-medium leading-relaxed">{item}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MASSIVE FULL SCREEN OVERLAY */}
      {showAnnouncement && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer p-6"
          onClick={() => setShowAnnouncement(false)}
        >
          <div className="relative max-w-[90%] w-full text-center animate-in fade-in zoom-in duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowAnnouncement(false); }}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={24} className="md:size-[32px]" />
            </button>
            <Megaphone size={48} className="md:size-[96px] mx-auto mb-8 md:mb-12 animate-pulse" style={{ color: accent }} />
            <h1 className="text-4xl md:text-7xl lg:text-[140px] font-black text-white tracking-tighter leading-tight md:leading-none drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] break-words">
              {eventData.announcement}
            </h1>
            <p className="mt-8 md:mt-16 text-[#8B949E] tracking-[0.3em] uppercase text-sm md:text-xl font-bold animate-pulse">
              Tap to dismiss
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0D1117;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #30363D;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8B949E;
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Sidebar from '@/components/ui/Sidebar';
import { Megaphone, X } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClockView({ params }: { params: Promise<{ id: string }> }) {
  const [roomId, setRoomId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  // Broadcast States
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [lastAnnouncementTime, setLastAnnouncementTime] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    params.then(p => setRoomId(p.id));
  }, [params]);

  const { data: eventData } = useSWR(
    roomId ? `${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${roomId}` : null, 
    fetcher, 
    { refreshInterval: 5000 }
  );

  // Broadcast Full-Screen Override Logic
  useEffect(() => {
    if (!eventData) return;
    
    // Prevent old announcements from popping up when you first load the page
    if (isInitialLoad) {
      setLastAnnouncementTime(eventData.announcementTimestamp);
      setIsInitialLoad(false);
      return;
    }

    if (eventData.announcementTimestamp && eventData.announcementTimestamp !== lastAnnouncementTime) {
      setLastAnnouncementTime(eventData.announcementTimestamp);
      
      if (eventData.announcement) {
        setShowAnnouncement(true);
        const durationMs = (eventData.announcementDuration || 10) * 1000;
        const timer = setTimeout(() => setShowAnnouncement(false), durationMs);
        return () => clearTimeout(timer);
      }
    }
  }, [eventData, isInitialLoad, lastAnnouncementTime]);

  // Normal Clock Logic
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
  
  if (!eventData) return <div className="h-screen w-screen bg-[#0D1117] flex items-center justify-center text-[#4493F8] font-mono tracking-widest uppercase animate-pulse">Syncing...</div>;

  const currentPhase = eventData.phases[eventData.currentPhaseIndex] || {};
  const accent = eventData.branding?.accentColor || '#4493F8';

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D1117] text-[#E6EDF3] relative">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 flex justify-between items-center px-8 bg-[#161B22] border-b border-[#30363D]">
          <div className="flex items-center gap-3 text-sm">
            <Megaphone size={16} style={{ color: accent }} />
            <span style={{ color: accent }} className="font-bold uppercase tracking-wider text-xs">LATEST:</span>
            <span className="text-[#8B949E] truncate max-w-xl">{eventData.announcement || "Setup your workstations!"}</span>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
            <div className="absolute top-6 left-6 flex items-center gap-4">
              <span className="border px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase bg-[#0D1117]" style={{ borderColor: accent, color: accent }}>{eventData.status}</span>
            </div>
            <div className="text-[12rem] font-black tracking-tighter leading-none text-white font-mono my-8" style={{ textShadow: `0 0 40px ${accent}40` }}>
              {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Upcoming Flow</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventData.phases.map((phase: any, index: number) => {
                if (index < eventData.currentPhaseIndex) return null; 
                const isCurrent = index === eventData.currentPhaseIndex;
                return (
                  <div key={index} className={`bg-[#161B22] border rounded-xl p-5 ${isCurrent ? '' : 'border-[#30363D]'}`} style={{ borderColor: isCurrent ? accent : undefined }}>
                     <h4 className={`font-bold mb-2 ${isCurrent ? 'text-white' : 'text-[#8B949E]'}`}>{phase.name}</h4>
                     <p className="text-xs text-[#8B949E] mb-4">{phase.durationMinutes} Minutes</p>
                     {isCurrent ? (
                       <span className="bg-[#1B2E24] text-[#3FB950] px-2 py-0.5 rounded text-[10px] font-bold uppercase">In Progress</span>
                     ) : (
                       <span className="bg-[#21262D] text-[#8B949E] px-2 py-0.5 rounded text-[10px] font-bold uppercase">Upcoming</span>
                     )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* MASSIVE FULL SCREEN OVERLAY */}
      {showAnnouncement && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer"
          onClick={() => setShowAnnouncement(false)}
        >
          <div className="relative max-w-5xl w-full p-12 text-center animate-in fade-in zoom-in duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowAnnouncement(false); }}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={32} />
            </button>
            <Megaphone size={64} style={{ color: accent }} className="mx-auto mb-8 animate-pulse" />
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              {eventData.announcement}
            </h1>
            <p className="mt-12 text-[#8B949E] tracking-[0.3em] uppercase text-sm font-bold animate-pulse">
              Click anywhere to dismiss
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
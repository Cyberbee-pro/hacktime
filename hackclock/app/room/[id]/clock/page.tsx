"use client";

import { use, useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { Megaphone, Lightbulb, Wifi, HelpCircle, Bell, Settings, User } from 'lucide-react';

export default function ClockView({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.id;
  const [eventData, setEventData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

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
  const accent = eventData.branding?.accentColor || '#4493F8';

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D1117] text-[#E6EDF3]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 flex justify-between items-center px-8 bg-[#161B22] border-b border-[#30363D]">
          <div className="flex items-center gap-3 text-sm">
            <Megaphone size={16} style={{ color: accent }} />
            <span style={{ color: accent }} className="font-bold uppercase tracking-wider text-xs">LATEST:</span>
            <span className="text-[#8B949E]">{eventData.announcement || "Setup your workstations!"}</span>
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

          {/* NEW: Upcoming Flow Timeline */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Upcoming Flow</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventData.phases.map((phase: any, index: number) => {
                if (index < eventData.currentPhaseIndex) return null; // Hide past phases
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
    </div>
  );
}
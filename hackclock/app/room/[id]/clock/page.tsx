"use client";

import { use, useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { Megaphone, Lightbulb, Wifi, HelpCircle, Bell, Settings, User } from 'lucide-react';

export default function ClockView({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.id;

  const [eventData, setEventData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/hackathons/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setEventData(data);
        }
      } catch (err) {
        console.error("Failed to fetch room");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (!eventData?.phaseEndTime || eventData.status !== 'RUNNING') return;

    const targetTime = new Date(eventData.phaseEndTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

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

  if (isLoading) return <div className="h-screen w-screen bg-[#0D1117] flex items-center justify-center text-[#4493F8] font-mono tracking-widest uppercase animate-pulse">Establishing Connection...</div>;
  if (!eventData) return <div className="h-screen w-screen bg-[#0D1117] flex items-center justify-center text-red-500 font-mono tracking-widest uppercase">Room Not Found</div>;

  const currentPhase = eventData.phases[eventData.currentPhaseIndex] || {};

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D1117] text-[#E6EDF3]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 flex justify-between items-center px-8 bg-[#161B22] border-b border-[#30363D]">
          <div className="flex items-center gap-3 text-sm">
            <Megaphone size={16} className="text-[#4493F8]" />
            <span className="text-[#4493F8] font-bold">LATEST:</span>
            <span className="text-[#8B949E]">{eventData.announcement || `Welcome to ${eventData.name}. Setup your workstations!`}</span>
          </div>
          <div className="flex items-center gap-4 text-[#8B949E] text-xs font-bold tracking-wider">
            LIVE
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#30363D]">
              <Bell size={16} className="hover:text-white cursor-pointer" />
              <Settings size={16} className="hover:text-white cursor-pointer" />
              <div className="w-6 h-6 rounded-full bg-[#21262D] flex items-center justify-center"><User size={12}/></div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
            <div className="absolute top-6 left-6 flex items-center gap-4">
              <span className={`border px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${eventData.status === 'RUNNING' ? 'bg-[#1B2E24] text-[#3FB950] border-[#2EA043]' : 'bg-[#2D1A1E] text-red-500 border-red-900 animate-pulse'}`}>
                {eventData.status}
              </span>
            </div>

            <div className="text-[12rem] font-black tracking-tighter leading-none text-white font-mono drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] my-8">
              {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </div>

            <div className="flex items-center gap-16 mt-4">
              <div>
                <p className="text-[10px] text-[#8B949E] font-bold tracking-widest uppercase mb-1">Current Phase</p>
                <p className="text-2xl font-bold text-white">{currentPhase.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#21262D] rounded border border-[#30363D] flex items-center justify-center">
              <Lightbulb size={20} className="text-[#4493F8]" />
            </div>
            <div>
              <p className="text-[10px] text-[#4493F8] font-bold tracking-widest uppercase">Quick Tip</p>
              <p className="text-sm text-[#8B949E]">"Remember to commit early and often. The deployment pipeline gets congested in the final 30 minutes!"</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pb-8">
            <div className="col-span-2 bg-[#161B22] border border-[#30363D] rounded-xl p-6 flex justify-between items-center relative overflow-hidden">
              <div className="z-10">
                <p className="text-[10px] text-[#8B949E] font-bold tracking-widest uppercase mb-4">Network Status</p>
                <div className="flex items-center gap-4 mb-2">
                  <Wifi size={24} className="text-[#3FB950]" />
                  <div>
                    <h4 className="font-bold text-white text-lg">Gigabit Fiber</h4>
                    <p className="text-xs text-[#8B949E]">SSID: GitCity_5G_Ext</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 bg-[#161B22] border border-[#30363D] rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-[#21262D] rounded-full flex items-center justify-center mb-4 border border-[#30363D]">
                <HelpCircle size={24} className="text-[#4493F8]" />
              </div>
              <h4 className="font-bold text-white mb-2">Need Help?</h4>
              <p className="text-xs text-[#8B949E] mb-6">Our support desk is open 24/7 during the event.</p>
              <button className="w-full py-2 bg-transparent border border-[#30363D] text-[#8B949E] rounded text-xs font-bold uppercase tracking-wider hover:text-white hover:border-[#8B949E] transition-colors">
                Join Discord
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
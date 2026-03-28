"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Network, Play, Pause, FastForward, Megaphone, Terminal, Clock, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const activeRoomId = (session?.user as any)?.activeRoomId;
  const userEmail = session?.user?.email;
  
  const [eventData, setEventData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeRoomId) {
      setIsLoading(false);
      return;
    }
    const fetchRoom = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/hackathons/${activeRoomId}`);
        if (res.ok) {
          const data = await res.json();
          setEventData(data);
        }
      } catch (err) {
        console.error("Failed to fetch active room");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();
  }, [activeRoomId]);

  // ENGINE CONTROL HANDLER
  const handleEngineControl = async (action: 'PAUSE' | 'RESUME' | 'NEXT_PHASE') => {
    if (!activeRoomId || !userEmail) return;

    if (action === 'NEXT_PHASE') {
      const confirm = window.confirm("WARNING: Are you sure you want to force the next phase? This cannot be undone.");
      if (!confirm) return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/hackathons/${activeRoomId}/state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, organizerSecret: userEmail }) // Pass email for authorization!
      });

      const data = await res.json();

      if (res.ok) {
        setEventData(data); // Instantly update the UI to reflect the new state
      } else {
        alert(data.error); // Show the Security Fault if unauthorized!
      }
    } catch (error) {
      alert("System Error: Could not connect to Master Node.");
    }
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-[#4493F8] font-mono tracking-widest uppercase animate-pulse">Syncing Master Node...</div>;
  }

  if (!activeRoomId || !eventData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-[#161B22] border border-[#30363D] rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
          <Terminal size={40} className="text-[#8B949E]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">No Active Session</h1>
        <p className="text-[#8B949E] mb-8">You are currently disconnected. Deploy a new hackathon flow or connect to an existing room to initialize the control panel.</p>
        <Link href="/flow" className="px-8 py-4 bg-[#4493F8] text-white rounded-lg font-bold hover:bg-[#3178C6] transition-colors shadow-[0_0_15px_rgba(68,147,248,0.3)] flex items-center gap-2 uppercase tracking-wider text-sm">
          <Network size={18} /> Deploy New Flow
        </Link>
      </div>
    );
  }

  if (eventData.status === 'COMPLETED') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        <CheckCircle2 size={64} className="text-[#3FB950] mb-6" />
        <h1 className="text-3xl font-bold text-white mb-2">Hackathon Concluded</h1>
        <p className="text-[#8B949E]">All phases have been successfully executed. The engine has powered down.</p>
      </div>
    );
  }

  const currentPhase = eventData.phases[eventData.currentPhaseIndex] || {};
  const accent = eventData.branding?.accentColor || '#4493F8';

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-4">
            {eventData.branding?.logoUrl && (
              <img src={eventData.branding.logoUrl} alt="Logo" className="h-8 object-contain" />
            )}
            {eventData.name}
          </h1>
          <p className="text-[#8B949E] font-mono tracking-widest uppercase text-xs">
            ROOM ID // <span style={{ color: accent }}>{activeRoomId}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#8B949E] font-bold tracking-[0.2em] uppercase mb-1">Engine Status</p>
          <p className={`text-sm font-bold flex items-center justify-end gap-2 ${eventData.status === 'RUNNING' ? 'text-[#3FB950]' : 'text-yellow-500'}`}>
             <span className={`w-2 h-2 rounded-full ${eventData.status === 'RUNNING' ? 'bg-[#3FB950] animate-pulse' : 'bg-yellow-500'}`}></span>
             {eventData.status}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-[#161B22] border border-[#30363D] rounded-xl p-8 relative overflow-hidden" style={{ borderLeftColor: accent, borderLeftWidth: '4px' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Clock size={100} style={{ color: accent }} />
          </div>
          <p className="text-[10px] text-[#8B949E] font-bold tracking-widest uppercase mb-2">Current Execution Phase</p>
          <h2 className="text-4xl font-black text-white mb-2">{currentPhase.name || "Standby"}</h2>
          <p className="text-sm text-[#8B949E] font-medium mb-8">Duration: {currentPhase.durationMinutes} Minutes</p>
          
          <div className="flex gap-4 relative z-10">
            {eventData.status === 'RUNNING' ? (
              <button onClick={() => handleEngineControl('PAUSE')} className="flex-1 py-3 bg-[#2D1A1E] text-red-500 border border-red-900 rounded-md font-bold text-sm hover:bg-red-950 transition-colors flex justify-center items-center gap-2 uppercase tracking-wider">
                <Pause size={16} /> Pause Timer
              </button>
            ) : (
              <button onClick={() => handleEngineControl('RESUME')} className="flex-1 py-3 bg-[#1B2E24] text-[#3FB950] border border-[#2EA043] rounded-md font-bold text-sm hover:bg-[#1B2E24]/80 transition-colors flex justify-center items-center gap-2 uppercase tracking-wider">
                <Play size={16} /> Resume Timer
              </button>
            )}
            <button onClick={() => handleEngineControl('NEXT_PHASE')} className="flex-1 py-3 bg-[#0D1117] border border-[#30363D] text-white rounded-md font-bold text-sm hover:border-[#8B949E] transition-colors flex justify-center items-center gap-2 uppercase tracking-wider">
              <FastForward size={16} /> Force Next Phase
            </button>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-[#8B949E] font-bold tracking-widest uppercase mb-4">Event Timeline</p>
            <div className="space-y-4">
              {eventData.phases.map((phase: any, idx: number) => (
                <div key={phase._id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${idx === eventData.currentPhaseIndex && eventData.status === 'RUNNING' ? 'animate-pulse' : ''}`} style={{ backgroundColor: idx === eventData.currentPhaseIndex ? accent : '#30363D' }}></div>
                  <span className={`text-sm ${idx === eventData.currentPhaseIndex ? 'text-white font-bold' : 'text-[#8B949E]'}`}>{phase.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
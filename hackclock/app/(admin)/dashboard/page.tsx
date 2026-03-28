"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import useSWR from 'swr';
import { Network, Play, Pause, FastForward, Megaphone, Terminal, Clock, CheckCircle2, Users } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: session } = useSession();
  const activeRoomId = (session?.user as any)?.activeRoomId;
  const userEmail = session?.user?.email;
  
  const [announcementInput, setAnnouncementInput] = useState("");
  const [announcementDuration, setAnnouncementDuration] = useState(10); // Default 10s

  const { data: eventData, error, mutate } = useSWR(
    activeRoomId ? `${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${activeRoomId}` : null,
    fetcher,
    { refreshInterval: 5000 } 
  );

  const isLoading = !eventData && !error && activeRoomId;

  const handleEngineControl = async (action: 'PAUSE' | 'RESUME' | 'NEXT_PHASE') => {
    if (!activeRoomId || !userEmail) return;
    if (action === 'NEXT_PHASE') {
      if (!window.confirm("WARNING: Force the next phase? This cannot be undone.")) return;
    }
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${activeRoomId}/state`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, organizerSecret: userEmail }) 
      });
      mutate(); 
    } catch (error) { alert("System Error: Could not connect to Master Node."); }
  };

  const handleBroadcast = async () => {
    if (!activeRoomId || !userEmail || !announcementInput.trim()) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${activeRoomId}/state`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'ANNOUNCE', 
          organizerSecret: userEmail, 
          announcementText: announcementInput,
          announcementDuration: announcementDuration
        }) 
      });
      setAnnouncementInput("");
      mutate(); 
    } catch (error) { alert("System Error: Could not connect to Master Node."); }
  };

  if (isLoading) return <div className="h-full flex items-center justify-center text-[#4493F8] font-mono tracking-widest uppercase animate-pulse">Syncing Master Node...</div>;
  
  if (!activeRoomId || !eventData) return (
    <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
      <div className="w-20 h-20 bg-[#161B22] border border-[#30363D] rounded-2xl flex items-center justify-center mb-6"><Terminal size={40} className="text-[#8B949E]" /></div>
      <h1 className="text-3xl font-bold text-white mb-4">No Active Session</h1>
      <Link href="/flow" className="px-8 py-4 bg-[#4493F8] text-white rounded-lg font-bold hover:bg-[#3178C6] transition-colors flex items-center gap-2 uppercase tracking-wider text-sm"><Network size={18} /> Deploy New Flow</Link>
    </div>
  );

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
            {eventData.branding?.logoUrl && <img src={eventData.branding.logoUrl} alt="Logo" className="h-8 object-contain" />}
            {eventData.name}
          </h1>
          <p className="text-[#8B949E] font-mono tracking-widest uppercase text-xs">ROOM ID // <span style={{ color: accent }}>{activeRoomId}</span></p>
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
          <div className="absolute top-0 right-0 p-6 opacity-10"><Clock size={100} style={{ color: accent }} /></div>
          <p className="text-[10px] text-[#8B949E] font-bold tracking-widest uppercase mb-2">Current Execution Phase</p>
          <h2 className="text-4xl font-black text-white mb-2">{currentPhase.name || "Standby"}</h2>
          <p className="text-sm text-[#8B949E] font-medium mb-8">Duration: {currentPhase.durationMinutes} Minutes</p>
          
          <div className="flex gap-4 relative z-10">
            {eventData.status === 'RUNNING' ? (
              <button onClick={() => handleEngineControl('PAUSE')} className="flex-1 py-3 bg-[#2D1A1E] text-red-500 border border-red-900 rounded-md font-bold text-sm hover:bg-red-950 transition-colors flex justify-center items-center gap-2 uppercase tracking-wider"><Pause size={16} /> Pause Timer</button>
            ) : (
              <button onClick={() => handleEngineControl('RESUME')} className="flex-1 py-3 bg-[#1B2E24] text-[#3FB950] border border-[#2EA043] rounded-md font-bold text-sm hover:bg-[#1B2E24]/80 transition-colors flex justify-center items-center gap-2 uppercase tracking-wider"><Play size={16} /> Resume Timer</button>
            )}
            <button onClick={() => handleEngineControl('NEXT_PHASE')} className="flex-1 py-3 bg-[#0D1117] border border-[#30363D] text-white rounded-md font-bold text-sm hover:border-[#8B949E] transition-colors flex justify-center items-center gap-2 uppercase tracking-wider"><FastForward size={16} /> Force Next Phase</button>
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

      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
        <h2 className="text-xs font-bold tracking-wider uppercase text-white mb-4 flex items-center gap-2"><Megaphone size={16} style={{ color: accent }} /> Broadcast Announcement System</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={announcementInput}
            onChange={(e) => setAnnouncementInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBroadcast()}
            placeholder="Push full-screen override to all connected views..." 
            className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-md py-3 px-4 text-white outline-none focus:border-[#8B949E] text-sm" 
          />
          <div className="relative w-28">
            <input 
              type="number" 
              value={announcementDuration}
              onChange={(e) => setAnnouncementDuration(parseInt(e.target.value) || 10)}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 pl-4 pr-8 text-white outline-none focus:border-[#8B949E] text-sm text-center font-mono" 
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B949E] font-bold uppercase tracking-wider">Sec</span>
          </div>
          <button onClick={handleBroadcast} className="px-8 py-3 bg-white text-[#0D1117] rounded-md font-bold text-sm hover:bg-[#E6EDF3] transition-colors uppercase tracking-wider shadow-lg">Broadcast</button>
        </div>
      </div>

      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 mt-6">
        <h2 className="text-xs font-bold tracking-wider uppercase text-white mb-4 flex items-center gap-2"><Users size={16} style={{ color: accent }} /> Connected Terminals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {eventData.participants?.map((p: any, i: number) => (
             <div key={i} className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse"></div>
                <span className="text-sm text-[#8B949E] font-bold truncate">{p.teamName}</span>
             </div>
          ))}
          {(!eventData.participants || eventData.participants.length === 0) && (
            <p className="text-xs text-[#8B949E] col-span-4 italic">Waiting for teams to connect...</p>
          )}
        </div>
      </div>
    </div>
  );
}
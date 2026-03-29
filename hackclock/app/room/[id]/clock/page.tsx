"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import Sidebar from '@/components/ui/Sidebar';
import { Megaphone, X, Menu, Edit, Plus, Trash2, Save, CheckCircle2, Clock as ClockIcon } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClockView({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const [roomId, setRoomId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Admin Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editablePhases, setEditablePhases] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Broadcast States
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [lastAnnouncementTime, setLastAnnouncementTime] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    params.then(p => setRoomId(p.id));
  }, [params]);

  const { data: eventData, mutate } = useSWR(
    roomId ? `${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${roomId}` : null, 
    fetcher, 
    { refreshInterval: 5000 }
  );

  const isOrganizer = session?.user?.email === eventData?.organizerSecret;

  useEffect(() => {
    if (eventData?.phases && !isEditing) {
      setEditablePhases(eventData.phases.map((p: any, i: number) => ({ ...p, id: p._id || i })));
    }
  }, [eventData, isEditing]);

  // Broadcast logic
  useEffect(() => {
    if (!eventData) return;
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

  const handleUpdatePhases = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          organizerSecret: session?.user?.email,
          phases: editablePhases 
        })
      });
      if (res.ok) {
        await mutate();
        setIsEditing(false);
      } else {
        alert("Failed to update phases structure.");
      }
    } catch {
      alert("System error during structural update.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (time: number) => Math.max(0, time).toString().padStart(2, '0');
  
  if (!eventData) return <div className="h-screen w-screen bg-[#0D1117] flex items-center justify-center text-[#4493F8] font-mono tracking-widest uppercase animate-pulse">Syncing...</div>;

  const currentPhase = eventData.phases[eventData.currentPhaseIndex] || {};
  const accent = eventData.branding?.accentColor || '#4493F8';

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#0D1117] text-[#E6EDF3] relative">
      <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden absolute top-4 left-4 z-30 p-2 bg-[#161B22] border border-[#30363D] rounded-md text-[#8B949E]">
        <Menu size={20} />
      </button>

      <div className={`fixed inset-0 z-40 lg:relative lg:inset-auto lg:block ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        <div className="relative h-full w-64 shrink-0">
          <Sidebar onNavItemClick={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <header className="h-16 flex justify-between items-center px-6 md:px-8 bg-[#161B22] border-b border-[#30363D] shrink-0">
          <div className="flex items-center gap-3 text-sm overflow-hidden">
            <Megaphone size={16} className="shrink-0" style={{ color: accent }} />
            <span style={{ color: accent }} className="font-bold uppercase tracking-wider text-[10px] shrink-0">LATEST:</span>
            <span className="text-[#8B949E] truncate text-xs md:text-sm">{eventData.announcement || "Setup your workstations!"}</span>
          </div>
          {isOrganizer && (
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              title="Admin: Adjust Flow Structure"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${isEditing ? 'bg-[#4493F8] text-white' : 'bg-[#21262D] text-[#8B949E] hover:text-white'}`}
            >
              <Edit size={14} /> {isEditing ? 'Discard Changes' : 'Edit Schedule'}
            </button>
          )}
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 md:p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
            <div className="absolute top-4 md:top-6 left-4 md:left-6 flex items-center gap-4">
              <span className="border px-2 md:px-3 py-0.5 md:py-1 rounded text-[8px] md:text-[10px] font-bold tracking-widest uppercase bg-[#0D1117]" style={{ borderColor: accent, color: accent }}>{eventData.status}</span>
            </div>
            <div className="text-[clamp(3rem,18vw,12rem)] font-black tracking-tighter leading-none text-white font-mono my-4 md:my-8 text-center" style={{ textShadow: `0 0 40px ${accent}40` }}>
              {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </div>
            <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-[#8B949E]">{currentPhase.name || "Standby"}</p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-bold text-white">Event Flow</h3>
              {isEditing && (
                <button 
                  onClick={() => setEditablePhases([...editablePhases, { id: Date.now(), name: 'New Phase', durationMinutes: 60, autoTransition: false }])}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#4493F8] hover:text-white transition-colors"
                >
                  <Plus size={14} /> Add Phase
                </button>
              )}
            </div>

            <div className="space-y-4">
              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {eventData.phases.map((phase: any, index: number) => {
                    if (index < eventData.currentPhaseIndex) return null; 
                    const isCurrent = index === eventData.currentPhaseIndex;
                    return (
                      <div key={index} className={`bg-[#161B22] border rounded-xl p-4 md:p-5 transition-all hover:border-[#8B949E] ${isCurrent ? '' : 'border-[#30363D]'}`} style={{ borderColor: isCurrent ? accent : undefined }}>
                         <h4 className={`font-bold mb-1 md:mb-2 text-sm md:text-base ${isCurrent ? 'text-white' : 'text-[#8B949E]'}`}>{phase.name}</h4>
                         <p className="text-[10px] md:text-xs text-[#8B949E] mb-3 md:mb-4">{phase.durationMinutes} Minutes</p>
                         {isCurrent ? (
                           <span className="bg-[#1B2E24] text-[#3FB950] px-2 py-0.5 rounded text-[8px] md:text-[10px] font-bold uppercase">In Progress</span>
                         ) : (
                           <span className="bg-[#21262D] text-[#8B949E] px-2 py-0.5 rounded text-[8px] md:text-[10px] font-bold uppercase">Upcoming</span>
                         )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3 bg-[#0D1117] border border-[#30363D] p-6 rounded-xl animate-in slide-in-from-top-4 duration-300">
                  <p className="text-[10px] font-bold text-[#4493F8] uppercase tracking-[0.2em] mb-4">Master Sequence Override</p>
                  {editablePhases.map((phase, idx) => (
                    <div key={phase.id} className="flex flex-col sm:flex-row items-center gap-4 bg-[#161B22] p-3 rounded-lg border border-[#30363D]">
                      <div className="flex-1 w-full">
                        <input 
                          type="text" 
                          value={phase.name} 
                          onChange={(e) => setEditablePhases(editablePhases.map(p => p.id === phase.id ? { ...p, name: e.target.value } : p))}
                          className="bg-transparent border-none text-sm font-bold text-white outline-none w-full"
                        />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <ClockIcon size={12} className="text-[#8B949E]" />
                        <input 
                          type="number" 
                          value={phase.durationMinutes} 
                          onChange={(e) => setEditablePhases(editablePhases.map(p => p.id === phase.id ? { ...p, durationMinutes: parseInt(e.target.value)||0 } : p))}
                          className="w-12 bg-[#0D1117] border border-[#30363D] rounded text-xs text-center py-1 font-mono text-white"
                        />
                        <span className="text-[10px] text-[#8B949E] font-mono">m</span>
                      </div>
                      <button 
                        onClick={() => setEditablePhases(editablePhases.map(p => p.id === phase.id ? { ...p, autoTransition: !p.autoTransition } : p))}
                        title="Toggle Auto-Transition"
                        className={`px-2 py-1 rounded text-[8px] font-bold uppercase ${phase.autoTransition ? 'bg-[#3FB950] text-[#0D1117]' : 'bg-[#30363D] text-[#8B949E]'}`}
                      >
                        {phase.autoTransition ? 'Auto-On' : 'Manual'}
                      </button>
                      <button onClick={() => setEditablePhases(editablePhases.filter(p => p.id !== phase.id))} className="text-red-500/50 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-end gap-3">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-[10px] font-bold uppercase text-[#8B949E] hover:text-white">Cancel</button>
                    <button 
                      onClick={handleUpdatePhases} 
                      disabled={isSaving}
                      className="px-6 py-2 bg-[#3FB950] text-[#0D1117] rounded font-bold text-[10px] uppercase tracking-widest hover:bg-[#2EA043] flex items-center gap-2"
                    >
                      {isSaving ? <><Loader2 size={12} className="animate-spin" /> Updating...</> : <><Save size={12} /> Save Changes</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showAnnouncement && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer p-6" onClick={() => setShowAnnouncement(false)}>
          <div className="relative max-w-5xl w-full text-center animate-in fade-in zoom-in duration-300">
            <button onClick={(e) => { e.stopPropagation(); setShowAnnouncement(false); }} className="absolute -top-12 right-0 md:top-4 md:right-4 text-white/50 hover:text-white"><X size={32} /></button>
            <Megaphone size={48} className="md:size-[64px] mx-auto mb-6 md:mb-8 animate-pulse" style={{ color: accent }} />
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tight leading-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] break-words">{eventData.announcement}</h1>
            <p className="mt-8 md:mt-12 text-[#8B949E] tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm font-bold animate-pulse">Tap anywhere to dismiss</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Loader2({ size, className }: { size: number, className: string }) {
  return <CheckCircle2 size={size} className={className} />; // Placeholder if loader icon is missing
}

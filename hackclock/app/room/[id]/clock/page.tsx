"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import useSWR from 'swr';
import Sidebar from '@/components/ui/Sidebar';
import { Megaphone, X, Menu, Edit, Plus, Trash2, Save, CheckCircle2, Clock as ClockIcon, Activity, ChevronRight, AlertCircle, Loader2, History } from 'lucide-react';

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
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    params.then(p => setRoomId(p.id));
  }, [params]);

  const { data: eventData, mutate } = useSWR(
    roomId ? `${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${roomId}` : null, 
    fetcher, 
    { 
      refreshInterval: 3000,
      keepPreviousData: true 
    }
  );

  const isOrganizer = session?.user?.email === eventData?.organizerSecret;

  // Load history and last seen TS from local storage
  useEffect(() => {
    if (roomId) {
      const localHistory = localStorage.getItem(`clock_history_${roomId}`);
      if (localHistory) setHistory(JSON.parse(localHistory));
      
      const lastTS = localStorage.getItem(`last_broadcast_${roomId}`);
      if (lastTS) setLastAnnouncementTime(lastTS);
    }
  }, [roomId]);

  useEffect(() => {
    if (eventData?.phases && !isEditing) {
      setEditablePhases(eventData.phases.map((p: any, i: number) => ({ ...p, id: p._id || i })));
    }
  }, [eventData, isEditing]);

  // Broadcast logic
  useEffect(() => {
    if (!eventData || !roomId) return;

    const currentTS = eventData.announcementTimestamp;
    
    if (isInitialLoad) {
      // On first load, if we already have a seen TS in state, don't trigger
      if (!lastAnnouncementTime && currentTS) {
        setLastAnnouncementTime(currentTS);
        localStorage.setItem(`last_broadcast_${roomId}`, currentTS);
      }
      setIsInitialLoad(false);
      return;
    }

    if (currentTS && currentTS !== lastAnnouncementTime) {
      setLastAnnouncementTime(currentTS);
      localStorage.setItem(`last_broadcast_${roomId}`, currentTS);
      
      if (eventData.announcement) {
        // Add to history
        setHistory(prev => {
          const newHistory = [eventData.announcement, ...prev.filter(h => h !== eventData.announcement)].slice(0, 10);
          localStorage.setItem(`clock_history_${roomId}`, JSON.stringify(newHistory));
          return newHistory;
        });

        // Show Overlay
        setShowAnnouncement(true);
        const durationMs = (eventData.announcementDuration || 10) * 1000;
        const timer = setTimeout(() => setShowAnnouncement(false), durationMs);
        return () => clearTimeout(timer);
      }
    }
  }, [eventData, isInitialLoad, lastAnnouncementTime, roomId]);

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
    if (!eventData.phaseEndTime || eventData.status !== 'RUNNING') {
      if (eventData.status === 'COMPLETED' || eventData.status === 'DRAFT') {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
      return;
    }

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
  
  if (!eventData || eventData.error || !eventData.phases) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-[#0A0A0B]">
        <div className="glass rounded-[3rem] p-12 md:p-16 max-w-xl w-full text-center border-white/5 shadow-2xl relative z-10 overflow-hidden">
          <div className="inline-flex p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 mb-10 shadow-2xl">
            <ClockIcon size={40} className="text-rose-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
            Node Not Found
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
            The clock terminal you are attempting to link with does not exist or has been decommissioned.
          </p>
          <Link 
            href="/dashboard" 
            className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-xl active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <ClockIcon size={16} /> Hub Terminal
          </Link>
        </div>
      </div>
    );
  }

  const currentPhase = eventData.phases[eventData.currentPhaseIndex] || {};
  const accent = eventData.branding?.accentColor || '#0070F3';

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#0A0A0B] text-slate-200 relative">
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(true)} 
        className="lg:hidden absolute top-6 left-6 z-30 p-3 glass rounded-2xl text-slate-400 active:scale-95 transition-all"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar Desktop/Mobile */}
      <div className={`fixed inset-0 z-40 lg:relative lg:inset-auto lg:block ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        <div className="relative h-full w-72 shrink-0">
          <Sidebar onNavItemClick={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      <main className="flex-1 flex flex-col overflow-y-auto min-w-0 stagger-in">
        {/* Top Header / Announcement Bar */}
        <header className="h-20 flex justify-between items-center px-8 bg-black/20 border-b border-white/5 backdrop-blur-xl shrink-0 z-10">
          <div 
            className="flex items-center gap-4 overflow-hidden group cursor-pointer"
            onClick={() => setShowHistory(true)}
          >
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-all">
              <Megaphone size={18} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Latest Broadcast</span>
              <span className="text-sm font-semibold text-white truncate max-w-md">
                {eventData.announcement || "Station initialization complete. Awaiting further commands."}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isOrganizer && (
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${isEditing ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'}`}
              >
                {isEditing ? <X size={14} /> : <Edit size={14} />}
                {isEditing ? 'Discard' : 'Edit Flow'}
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-12">
          
          {/* THE CLOCK */}
          <div className="glass rounded-[3rem] p-10 md:p-20 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] shadow-[0_64px_128px_rgba(0,0,0,0.6)] border-white/5 transition-all hover:border-white/10 group">
            {/* Status Badge */}
            <div className="absolute top-8 md:top-12 flex flex-col items-center gap-3">
              <span 
                className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase bg-black/40 border transition-all" 
                style={{ borderColor: `${accent}40`, color: accent, boxShadow: `0 0 20px ${accent}15` }}
              >
                {eventData.status}
              </span>
            </div>

            <div 
              className="text-[clamp(4rem,22vw,14rem)] font-black tracking-tighter leading-none text-white font-mono my-6 md:my-10 text-center select-none" 
              style={{ textShadow: `0 0 60px ${accent}30` }}
            >
              {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-[11px] md:text-sm font-bold tracking-[0.4em] uppercase text-slate-500 group-hover:text-slate-300 transition-colors">
                {currentPhase.name || "Station Standby"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-12 h-0.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Flow Section */}
          <div className="space-y-8">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                  <Activity size={18} />
                </div>
                <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-white">Event Flow</h3>
              </div>
              {isEditing && (
                <button 
                  onClick={() => setEditablePhases([...editablePhases, { id: Date.now(), name: 'New Phase', durationMinutes: 60, autoTransition: false }])}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-lg"
                >
                  <Plus size={14} /> Add Phase
                </button>
              )}
            </div>

            <div className="relative">
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-in">
                  {eventData.phases.map((phase: any, index: number) => {
                    if (index < eventData.currentPhaseIndex) return null; 
                    const isCurrent = index === eventData.currentPhaseIndex;
                    return (
                      <div 
                        key={index} 
                        className={`glass rounded-3xl p-6 transition-all glass-hover group ${isCurrent ? 'border-blue-500/30 bg-blue-500/[0.03]' : 'border-white/5'}`}
                      >
                         <div className="flex justify-between items-start mb-4">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                              Phase {String(index + 1).padStart(2, '0')}
                            </span>
                            {isCurrent && (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[8px] font-bold text-emerald-500 uppercase">Active</span>
                              </div>
                            )}
                         </div>
                         <h4 className={`text-xl font-bold mb-2 transition-colors ${isCurrent ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                           {phase.name}
                         </h4>
                         <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                            <ClockIcon size={12} className="text-blue-400/60" />
                            <span>{phase.durationMinutes} Minutes</span>
                         </div>
                         
                         {isCurrent && (
                           <div className="mt-6 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 w-1/3"></div>
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle size={16} className="text-blue-400" />
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">Master Sequence Override</p>
                  </div>
                  
                  <div className="space-y-3">
                    {editablePhases.map((phase, idx) => (
                      <div key={phase.id} className="flex flex-col sm:flex-row items-center gap-6 bg-black/20 p-4 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                        <div className="flex-1 w-full">
                          <input 
                            type="text" 
                            value={phase.name} 
                            onChange={(e) => setEditablePhases(editablePhases.map(p => p.id === phase.id ? { ...p, name: e.target.value } : p))}
                            className="bg-transparent border-none text-base font-bold text-white outline-none w-full focus:text-blue-400 transition-colors"
                          />
                        </div>
                        <div className="flex items-center gap-6 shrink-0">
                          <div className="flex items-center gap-3 bg-black/40 rounded-xl px-4 py-2 border border-white/5">
                            <input 
                              type="number" 
                              value={phase.durationMinutes} 
                              onChange={(e) => setEditablePhases(editablePhases.map(p => p.id === phase.id ? { ...p, durationMinutes: parseInt(e.target.value)||0 } : p))}
                              className="w-12 bg-transparent text-sm font-mono font-bold text-white text-center outline-none"
                            />
                            <span className="text-[10px] text-slate-600 font-bold uppercase">Min</span>
                          </div>
                          
                          <button 
                            onClick={() => setEditablePhases(editablePhases.map(p => p.id === phase.id ? { ...p, autoTransition: !p.autoTransition } : p))}
                            className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${phase.autoTransition ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-slate-500 border border-white/5'}`}
                          >
                            {phase.autoTransition ? 'Auto-Next' : 'Manual'}
                          </button>
                          
                          <button onClick={() => setEditablePhases(editablePhases.filter(p => p.id !== phase.id))} className="p-2 text-slate-600 hover:text-rose-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 flex justify-end gap-4">
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                    >
                      Cancel Changes
                    </button>
                    <button 
                      onClick={handleUpdatePhases} 
                      disabled={isSaving}
                      className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 disabled:opacity-50 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                      {isSaving ? 'Synchronizing...' : 'Commit Sequence'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* History Overlay */}
      {showHistory && (
        <div 
          className="absolute inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setShowHistory(false)}
        >
          <div 
            className="glass rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-[0_64px_128px_rgba(0,0,0,0.8)] border-white/10 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <History size={20} className="text-blue-400" />
                <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-white">Broadcast History</h3>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                   <Megaphone size={48} className="mb-4" />
                   <p className="text-sm font-bold uppercase tracking-widest">No transmissions captured.</p>
                </div>
              ) : (
                history.map((item, i) => (
                  <div key={i} className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                    <p className="text-white font-medium leading-relaxed">{item}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Announcement Overlay */}
      {showAnnouncement && (
        <div 
          className="absolute inset-0 z-[100] flex items-center justify-center bg-[#0A0A0B]/95 backdrop-blur-2xl cursor-pointer p-12 overflow-hidden" 
          onClick={() => setShowAnnouncement(false)}
        >
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: `radial-gradient(circle at center, ${accent} 0%, transparent 70%)` }}
          />
          
          <div className="relative max-w-6xl w-full text-center animate-in fade-in zoom-in slide-in-from-bottom-12 duration-700 ease-out">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowAnnouncement(false); }} 
              className="absolute -top-20 right-0 md:top-0 md:right-0 p-4 glass rounded-2xl text-slate-400 hover:text-white active:scale-90 transition-all"
            >
              <X size={32} />
            </button>
            
            <div className="mb-12 inline-block p-6 bg-white/5 rounded-[2rem] border border-white/10 shadow-2xl animate-bounce">
              <Megaphone size={64} className="md:size-[80px]" style={{ color: accent }} />
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[9rem] font-black text-white tracking-tighter leading-[0.9] drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] break-words mb-12">
              {eventData.announcement}
            </h1>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white animate-progress origin-left"></div>
              </div>
              <p className="text-slate-500 tracking-[0.4em] uppercase text-[10px] font-bold animate-pulse">
                System Broadcast in Progress
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        .animate-progress {
          animation: progress ${eventData?.announcementDuration || 10}s linear forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

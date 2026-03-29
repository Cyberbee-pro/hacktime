"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import useSWR from 'swr';
import { Network, Play, Pause, FastForward, Megaphone, Terminal, CheckCircle2, Square, Trash2, ChevronDown, ChevronUp, History, AlertTriangle, RefreshCw } from 'lucide-react';
import Modal from '@/components/ui/Modal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface HackathonFlow {
  roomId: string;
  name: string;
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  currentPhaseIndex: number;
  phases: Array<{ name: string; durationMinutes: number }>;
  branding?: { accentColor?: string; logoUrl?: string };
  participants?: Array<{ teamName: string }>;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, update } = useSession();
  const activeRoomId = (session?.user as { activeRoomId?: string })?.activeRoomId;
  const userEmail = session?.user?.email;

  const [announcementInput, setAnnouncementInput] = useState("");
  const [announcementDuration, setAnnouncementDuration] = useState(10);
  const [showHistory, setShowHistory] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState<string[]>([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'DELETE' | 'STOP' | 'NEXT_PHASE';
    roomId: string;
    flowName: string;
  }>({
    isOpen: false,
    type: 'DELETE',
    roomId: '',
    flowName: ''
  });

  // Fetch all flows for the organizer
  const { data: allFlows, mutate: mutateAll } = useSWR<HackathonFlow[]>(
    userEmail ? `${process.env.NEXT_PUBLIC_API_URL}/api/hackathons?organizerSecret=${userEmail}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  // Fetch specific active room data
  const { data: activeEvent, mutate: mutateActive } = useSWR<HackathonFlow>(
    activeRoomId ? `${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${activeRoomId}` : null,
    fetcher,
    { refreshInterval: 2000 } 
  );

  useEffect(() => {
    const history = localStorage.getItem('broadcast_history');
    if (history) {
      const timeout = setTimeout(() => {
        setBroadcastHistory(JSON.parse(history));
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, []);

  const openConfirmModal = (type: 'DELETE' | 'STOP' | 'NEXT_PHASE', roomId: string, flowName: string) => {
    setConfirmModal({ isOpen: true, type, roomId, flowName });
  };

  const handleConfirmedAction = async () => {
    const { type, roomId } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));

    if (type === 'DELETE') {
      await deleteFlowExecution(roomId);
    } else if (type === 'STOP') {
      await engineControlExecution(roomId, 'STOP');
    } else if (type === 'NEXT_PHASE') {
      await engineControlExecution(roomId, 'NEXT_PHASE');
    }
  };

  const engineControlExecution = async (roomId: string, action: 'PAUSE' | 'RESUME' | 'NEXT_PHASE' | 'STOP') => {
    if (!userEmail) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${roomId}/state`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, organizerSecret: userEmail }) 
      });
      mutateAll();
      if (roomId === activeRoomId) mutateActive();
      if (action === 'STOP' && roomId === activeRoomId) {
        await update({ activeRoomId: null });
      }
    } catch { alert("System Error: Could not connect to Master Node."); }
  };

  const deleteFlowExecution = async (roomId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${roomId}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizerSecret: userEmail })
      });
      mutateAll();
      if (roomId === activeRoomId) {
        mutateActive();
        await update({ activeRoomId: null });
      }
    } catch { alert("System Error: Deletion failed."); }
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

      const newHistory = [announcementInput, ...broadcastHistory.slice(0, 9)];
      setBroadcastHistory(newHistory);
      localStorage.setItem('broadcast_history', JSON.stringify(newHistory));

      setAnnouncementInput("");
      mutateActive(); 
    } catch { alert("System Error: Could not connect to Master Node."); }
  };

  const activeFlows = allFlows?.filter((f) => f.status === 'RUNNING' || f.status === 'PAUSED') || [];
  const drafts = allFlows?.filter((f) => f.status === 'DRAFT') || [];
  const completed = allFlows?.filter((f) => f.status === 'COMPLETED') || [];

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-10">

      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
          <p className="text-[#8B949E] font-mono text-xs uppercase tracking-widest">Organizer: <span className="text-[#3FB950]">{userEmail}</span></p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/flow" 
            title="Design New Hackathon Structure"
            className="px-5 py-2.5 bg-[#4493F8] text-white rounded-md font-bold hover:bg-[#3178C6] transition-all flex items-center gap-2 uppercase tracking-wider text-[10px] shadow-[0_0_15px_rgba(68,147,248,0.25)]"
          >
            <Network size={14} /> Design New Flow
          </Link>
        </div>
      </div>

      {/* 2. Active Engines (The live sessions) */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3FB950] animate-pulse shadow-[0_0_8px_rgba(63,185,80,0.4)]"></div>
          <h2 className="text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2">
            <RefreshCw size={12} className="text-[#8B949E]" /> Active Engines ({activeFlows.length})
          </h2>
        </div>

        {activeFlows.length === 0 ? (
          <div className="bg-[#161B22] border border-[#30363D] border-dashed rounded-xl p-12 text-center group hover:border-[#4493F8]/50 transition-colors">
            <Terminal size={40} className="text-[#30363D] mx-auto mb-4 group-hover:text-[#4493F8]/30 transition-colors" />
            <p className="text-[#8B949E] text-sm">No active hackathon sessions detected.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeFlows.map((flow: any, idx: number) => (
              <div 
                key={flow.roomId} 
                className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 relative overflow-hidden group transition-all hover:border-[#8B949E] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in fade-in slide-in-from-left-4 duration-500"
                style={{ borderLeft: `4px solid ${flow.branding?.accentColor || '#4493F8'}`, animationDelay: `${idx * 100}ms` }}
              >

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#4493F8] transition-colors">{flow.name}</h3>
                    <p className="text-[10px] font-mono text-[#8B949E] tracking-widest uppercase">ROOM ID // {flow.roomId}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openConfirmModal('DELETE', flow.roomId, flow.name)} 
                      title="Delete this Flow Blueprint"
                      className="p-2 text-[#8B949E] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${flow.status === 'RUNNING' ? 'bg-[#1B2E24] text-[#3FB950]' : 'bg-[#2D1A1E] text-yellow-500'}`}>
                      {flow.status}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  {flow.status === 'RUNNING' ? (
                    <button 
                      onClick={() => engineControlExecution(flow.roomId, 'PAUSE')} 
                      title="Pause Global Timer"
                      className="flex-1 py-2 bg-[#21262D] border border-[#30363D] text-white rounded font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#30363D]"
                    >
                      <Pause size={12} /> Pause
                    </button>
                  ) : (
                    <button 
                      onClick={() => engineControlExecution(flow.roomId, 'RESUME')} 
                      title="Resume Global Timer"
                      className="flex-1 py-2 bg-[#1B2E24] border border-[#2EA043] text-[#3FB950] rounded font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#1B2E24]/80"
                    >
                      <Play size={12} /> Resume
                    </button>
                  )}
                  <button 
                    onClick={() => openConfirmModal('NEXT_PHASE', flow.roomId, flow.name)}
                    title="Force Transition to Next Phase"
                    className="flex-1 py-2 bg-[#21262D] border border-[#30363D] text-white rounded font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#30363D]"
                  >
                    <FastForward size={12} /> Next
                  </button>
                  <button 
                    onClick={() => openConfirmModal('STOP', flow.roomId, flow.name)} 
                    title="Permanently Conclude Session"
                    className="p-2 bg-[#21262D] border border-[#30363D] text-[#8B949E] hover:text-red-500 rounded transition-colors"
                  >
                    <Square size={14} />
                  </button>
                </div>

                <Link href={flow.roomId === activeRoomId ? "#active-control" : `/room/${flow.roomId}/clock`} onClick={async () => { if (flow.roomId !== activeRoomId) await update({ activeRoomId: flow.roomId }); }} className="block mt-4 text-center text-[10px] font-bold text-[#4493F8] uppercase tracking-widest hover:underline">
                  {flow.roomId === activeRoomId ? "Currently Linked to Terminal" : "Link to Command Terminal"}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Global Control (Only if an active room is linked) */}
      {activeEvent && activeEvent.status !== 'COMPLETED' && (
        <section id="active-control" className="bg-[#161B22] border border-[#4493F8]/30 rounded-xl p-8 shadow-[0_0_30px_rgba(68,147,248,0.05)]">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#4493F8] animate-pulse"></div>
                <h2 className="text-xs font-bold tracking-widest uppercase text-white">Live Engine Console: {activeEvent.name}</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#0D1117] p-4 rounded-lg border border-[#30363D]">
                   <p className="text-[9px] text-[#8B949E] uppercase font-bold mb-1">Status</p>
                   <p className="text-sm font-bold text-white uppercase">{activeEvent.status}</p>
                </div>
                <div className="bg-[#0D1117] p-4 rounded-lg border border-[#30363D]">
                   <p className="text-[9px] text-[#8B949E] uppercase font-bold mb-1">Current Phase</p>
                   <p className="text-sm font-bold text-white truncate">{activeEvent.phases[activeEvent.currentPhaseIndex]?.name || "N/A"}</p>
                </div>
                <div className="bg-[#0D1117] p-4 rounded-lg border border-[#30363D]">
                   <p className="text-[9px] text-[#8B949E] uppercase font-bold mb-1">Participants</p>
                   <div className="flex items-center gap-2">
                     <p className="text-sm font-bold text-white">{activeEvent.participants?.length || 0}</p>
                     <RefreshCw size={10} className="text-[#30363D] hover:text-[#4493F8] cursor-pointer transition-all active:rotate-180" title="Sync Master Node Data" onClick={() => mutateActive()} />
                   </div>
                </div>
                <div className="bg-[#0D1117] p-4 rounded-lg border border-[#30363D]">
                   <p className="text-[9px] text-[#8B949E] uppercase font-bold mb-1">Room ID</p>
                   <p className="text-sm font-bold text-[#4493F8] font-mono">{activeRoomId}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[#8B949E] uppercase tracking-widest flex items-center gap-2">
                  <Megaphone size={12} className="text-[#4493F8]" title="Announcements System" /> Terminal Broadcast
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    value={announcementInput}
                    onChange={(e) => setAnnouncementInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBroadcast()}
                    placeholder="Message to all screens..." 
                    className="flex-1 bg-[#0D1117] border border-[#30363D] rounded py-2.5 px-4 text-sm text-white focus:border-[#4493F8] outline-none transition-colors"
                  />
                  <div className="flex gap-3">
                    <div className="relative">
                      <input 
                        type="number" 
                        value={announcementDuration}
                        title="Announcement Duration (seconds)"
                        onChange={(e) => setAnnouncementDuration(parseInt(e.target.value) || 5)}
                        className="w-20 bg-[#0D1117] border border-[#30363D] rounded py-2.5 pr-8 pl-3 text-center text-sm text-white outline-none font-mono"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-[#8B949E] pointer-events-none uppercase">Sec</span>
                    </div>
                    <button onClick={handleBroadcast} className="px-6 py-2.5 bg-white text-[#0D1117] rounded font-bold text-[10px] uppercase tracking-widest hover:bg-[#E6EDF3] transition-colors shadow-lg">Broadcast</button>
                  </div>
                </div>

                {broadcastHistory.length > 0 && (
                  <div>
                    <button 
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-[9px] font-bold text-[#8B949E] uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <History size={10} /> {showHistory ? 'Hide' : 'Show'} Broadcast History
                    </button>
                    {showHistory && (
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {broadcastHistory.map((h, i) => (
                          <div key={i} className="text-[10px] text-[#8B949E] bg-[#0D1117] p-2 rounded flex justify-between items-center group">
                            <span>{h}</span>
                            <button onClick={() => setAnnouncementInput(h)} className="text-[#4493F8] opacity-0 group-hover:opacity-100 uppercase font-bold text-[8px]">Reuse</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-64 space-y-4">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-bold text-[#8B949E] uppercase tracking-widest">Connected Teams</p>
                 <RefreshCw size={10} className="text-[#30363D] hover:text-[#4493F8] cursor-pointer transition-colors" title="Force Sync Teams" onClick={() => mutateActive()} />
               </div>
               <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 h-[220px] overflow-y-auto space-y-2 custom-scrollbar">
                  {activeEvent.participants?.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 py-1 border-b border-[#30363D]/50 last:border-0">
                      <div className="w-1 h-1 rounded-full bg-[#3FB950]"></div>
                      <span className="text-xs text-white font-medium truncate">{p.teamName}</span>
                    </div>
                  ))}
                  {(!activeEvent.participants || activeEvent.participants.length === 0) && (
                    <p className="text-[10px] text-[#444] italic text-center mt-12">No terminals connected.</p>
                  )}
               </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Blueprints (Drafts) */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xs font-bold tracking-widest uppercase text-white">Engine Blueprints ({drafts.length})</h2>
        </div>

        {drafts.length === 0 ? (
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8 text-center">
            <p className="text-[#8B949E] text-xs">No saved blueprints. Create a flow to save as draft.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {drafts.map((flow: any) => (
              <div key={flow.roomId} className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex flex-col justify-between hover:border-[#8B949E] transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-white truncate pr-4">{flow.name}</h3>
                    <button 
                      onClick={() => openConfirmModal('DELETE', flow.roomId, flow.name)} 
                      title="Delete this Blueprint"
                      className="p-1 text-[#444] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-[9px] text-[#8B949E] font-mono mb-4">{flow.phases.length} Phases • {flow.phases.reduce((acc: number, p: any) => acc + p.durationMinutes, 0)}m Total</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => engineControlExecution(flow.roomId, 'RESUME')}
                    title="Deploy Live Terminal"
                    className="flex-1 py-2 bg-[#4493F8] text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-[#3178C6] transition-colors"
                  >
                    <Play size={10} className="inline mr-1" /> Launch
                  </button>
                  <Link 
                    href={`/flow?edit=${flow.roomId}`}
                    title="Modify Flow Structure"
                    className="flex-1 py-2 bg-[#21262D] border border-[#30363D] text-[#8B949E] hover:text-white rounded text-[10px] font-bold uppercase tracking-wider text-center transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Archive (Completed) */}
      <section>
        <button 
          onClick={() => setIsArchiveOpen(!isArchiveOpen)}
          className="flex items-center gap-2 text-[#8B949E] hover:text-white transition-colors"
        >
          <h2 className="text-xs font-bold tracking-widest uppercase">Archived Sessions ({completed.length})</h2>
          {isArchiveOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isArchiveOpen && (
          <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {completed.length === 0 && <p className="text-[10px] text-[#444] italic p-4">Archive is empty.</p>}
            {completed.map((flow: any) => (
              <div key={flow.roomId} className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                   <CheckCircle2 size={14} className="text-[#3FB950]" title="Session Concluded" />
                   <div>
                     <p className="text-xs font-bold text-white">{flow.name}</p>
                     <p className="text-[9px] text-[#8B949E] font-mono uppercase">{flow.roomId} • Concluded {new Date(flow.updatedAt).toLocaleDateString()}</p>
                   </div>
                </div>
                <button 
                  onClick={() => openConfirmModal('DELETE', flow.roomId, flow.name)} 
                  title="Purge from Archive"
                  className="p-2 text-[#444] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        title="Confirm Operation"
        footer={(
          <>
            <button 
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="px-4 py-2 text-xs font-bold uppercase text-[#8B949E] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmedAction}
              className={`px-6 py-2 rounded font-bold text-xs uppercase tracking-widest transition-colors ${
                confirmModal.type === 'DELETE' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#4493F8] text-white hover:bg-[#3178C6]'
              }`}
            >
              Confirm {confirmModal.type === 'DELETE' ? 'Deletion' : confirmModal.type === 'STOP' ? 'Closure' : 'Next Phase'}
            </button>
          </>
        )}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg shrink-0 ${confirmModal.type === 'DELETE' ? 'bg-red-500/10 text-red-500' : 'bg-[#4493F8]/10 text-[#4493F8]'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-2 uppercase tracking-wide">
              {confirmModal.type === 'DELETE' ? 'Irreversible Deletion' : 'Master Node Override'}
            </p>
            <p className="text-sm text-[#8B949E] leading-relaxed">
              {confirmModal.type === 'DELETE' 
                ? `You are about to purge "${confirmModal.flowName}" from the system. This cannot be undone.` 
                : confirmModal.type === 'STOP'
                ? `The session for "${confirmModal.flowName}" will be concluded and moved to the archive.`
                : `Forcing the next phase for "${confirmModal.flowName}". This may impact active participant timers.`}
            </p>
          </div>
        </div>
      </Modal>

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

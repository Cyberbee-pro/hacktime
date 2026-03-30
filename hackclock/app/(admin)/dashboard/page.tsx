"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import useSWR from 'swr';
import { Network, Play, Pause, FastForward, Megaphone, Terminal, CheckCircle2, Square, Trash2, ChevronDown, History, AlertTriangle, RefreshCw, Clock, Monitor, Edit, XCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import PhaseCard from '@/components/ui/PhaseCard';

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

interface Participant {
  teamName: string;
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

  const handleDisconnectTerminal = async () => {
    if (!userEmail || !activeRoomId) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/active-room`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, roomId: null })
      });
      await update({ activeRoomId: null });
      mutateActive();
    } catch {
      alert("System Error: Could not disconnect terminal.");
    }
  };

  const activeFlows = allFlows?.filter((f) => f.status === 'RUNNING' || f.status === 'PAUSED') || [];
  const drafts = allFlows?.filter((f) => f.status === 'DRAFT') || [];
  const completed = allFlows?.filter((f) => f.status === 'COMPLETED') || [];

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 stagger-in">

      {/* 1. Header & Quick Stats */}
      <header className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="border border-[#30363D] bg-[#1C1C1C] p-8">
          <p className="text-[11px] font-bold uppercase tracking-tight text-[#A0A0A0]">Control Nexus</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight text-white">Overview</h1>
          <p className="mt-4 text-sm font-medium text-[#A0A0A0]">
            Welcome back, <span className="text-[#CFFF04]">{userEmail?.split('@')[0]}</span>. Grid status is live.
          </p>
        </div>
        <div className="border border-[#30363D] bg-[#5D00FF] p-8">
          <p className="text-[11px] font-bold uppercase tracking-tight text-white/70">Deploy</p>
          <Link
            href="/flow"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[#CFFF04] px-6 py-3 text-sm font-bold uppercase tracking-tight text-black rounded-md hover:brightness-95 transition-all"
          >
            <Network size={18} /> New Flow
          </Link>
        </div>
      </header>

      {/* 2. Active Engines */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-[#CFFF04] animate-pulse"></div>
            <h2 className="text-lg font-semibold text-white uppercase tracking-tight">Active Hackathon</h2>
          </div>
        </div>

        {activeFlows.length === 0 ? (
          <div className="border border-dashed border-[#30363D] bg-[#1C1C1C] p-16 text-center">
            <p className="font-medium text-[#A0A0A0]">No active hackathon sessions detected.</p>
            <Link href="/flow" className="mt-3 inline-block text-sm text-[#CFFF04] hover:underline">Deploy a blueprint to begin</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 stagger-in">
            {activeFlows.map((flow) => (
              <div
                key={flow.roomId}
                className="relative overflow-hidden border border-[#30363D] bg-[#5D00FF] p-8 transition-all lg:col-span-6"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">{flow.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="border border-[#30363D] bg-[#1C1C1C] px-2 py-1 text-[10px] font-mono tracking-wider uppercase text-[#A0A0A0]">ID: {flow.roomId}</span>
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase ${flow.status === 'RUNNING' ? 'bg-[#CFFF04] text-black' : 'bg-[#FF2E9A] text-white'}`}>
                        {flow.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openConfirmModal('DELETE', flow.roomId, flow.name)}
                    className="p-2 text-white/60 hover:text-white border border-transparent hover:border-[#30363D] transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-8">
                  {flow.status === 'RUNNING' ? (
                    <button
                      onClick={() => engineControlExecution(flow.roomId, 'PAUSE')}
                      className="col-span-1 py-3 bg-[#1C1C1C] border border-[#30363D] text-white rounded-md font-bold text-xs uppercase tracking-tight flex items-center justify-center gap-2 hover:border-[#CFFF04] transition-all"
                    >
                      <Pause size={14} /> Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => engineControlExecution(flow.roomId, 'RESUME')}
                      className="col-span-1 py-3 bg-[#CFFF04] border border-[#CFFF04] text-black rounded-md font-bold text-xs uppercase tracking-tight flex items-center justify-center gap-2 hover:brightness-95 transition-all"
                    >
                      <Play size={14} /> Resume
                    </button>
                  )}
                  <button
                    onClick={() => openConfirmModal('NEXT_PHASE', flow.roomId, flow.name)}
                    className="col-span-2 py-3 bg-[#FF2E9A] border border-[#FF2E9A] text-white rounded-md font-bold text-xs uppercase tracking-tight flex items-center justify-center gap-2 transition-all"
                  >
                    <FastForward size={14} /> Next
                  </button>
                  <button
                    onClick={() => openConfirmModal('STOP', flow.roomId, flow.name)}
                    className="col-span-1 p-3 bg-[#1C1C1C] border border-[#30363D] text-white hover:border-[#FF2E9A] transition-all"
                  >
                    <Square size={16} />
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Link
                    href={`/flow?edit=${flow.roomId}`}
                    className="inline-flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-tight hover:text-[#CFFF04] transition-colors"
                  >
                    <Edit size={12} /> Edit Flow
                  </Link>
                  <Link href={flow.roomId === activeRoomId ? "#active-control" : `/room/${flow.roomId}/clock`} onClick={async () => { if (flow.roomId !== activeRoomId) await update({ activeRoomId: flow.roomId }); }} className="text-[11px] font-bold text-[#CFFF04] uppercase tracking-tight hover:text-white transition-colors">
                    {flow.roomId === activeRoomId ? "● Currently Linked" : "Connect to Terminal"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Global Control */}
      {activeEvent && activeEvent.status !== 'COMPLETED' && (
        <section id="active-control" className="border border-[#30363D] bg-[#1C1C1C] p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col gap-4 mb-8 xl:flex-row xl:items-center">
              <div className="p-3 bg-[#5D00FF] text-[#CFFF04] border border-[#30363D]">
                <Terminal size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{activeEvent.name}</h2>
                <p className="text-xs text-[#A0A0A0] font-medium uppercase tracking-tight">Live Control Interface</p>
              </div>
              <Link
                href={`/flow?edit=${activeEvent.roomId}`}
                className="xl:ml-auto inline-flex items-center gap-2 px-4 py-3 bg-[#5D00FF] border border-[#30363D] text-white rounded-md text-[10px] font-bold uppercase tracking-tight transition-all"
              >
                <Edit size={14} /> Edit Flow
              </Link>
              <button
                onClick={handleDisconnectTerminal}
                className="inline-flex items-center gap-2 px-4 py-3 bg-transparent border border-[#FF2E9A] text-[#FF2E9A] rounded-md text-[10px] font-bold uppercase tracking-tight transition-all"
              >
                <XCircle size={14} /> Disconnect Terminal
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="space-y-6 xl:col-span-8">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    { label: 'Status', value: activeEvent.status, sub: 'Current State' },
                    { label: 'Phase', value: activeEvent.phases[activeEvent.currentPhaseIndex]?.name || "N/A", sub: 'Phase Execution' },
                    { label: 'Teams', value: activeEvent.participants?.length || 0, sub: 'Total Connected' },
                    { label: 'Node ID', value: activeRoomId, sub: 'Active Room' },
                  ].map((item, i) => (
                    <div key={i} className={`border border-[#30363D] p-5 ${i === 0 || i === 2 ? 'bg-[#5D00FF]' : 'bg-[#1C1C1C]'}`}>
                      <p className="text-[9px] text-[#A0A0A0] uppercase font-bold mb-1 tracking-tight">{item.label}</p>
                      <p className={`truncate text-sm font-semibold ${i === 0 ? 'text-[#CFFF04]' : 'text-white'}`}>{item.value}</p>
                      <p className="mt-1 text-[8px] font-medium text-[#A0A0A0]">{item.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {activeEvent.phases.slice(activeEvent.currentPhaseIndex, activeEvent.currentPhaseIndex + 3).map((phase, index) => (
                    <PhaseCard
                      key={`${phase.name}-${index}`}
                      index={activeEvent.currentPhaseIndex + index}
                      name={phase.name}
                      durationMinutes={phase.durationMinutes}
                      isActive={index === 0}
                    />
                  ))}
                </div>

                <div className="border border-[#30363D] bg-[#1C1C1C] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-tight flex items-center gap-2">
                      <Megaphone size={14} className="text-[#FF2E9A]" /> Terminal Broadcast
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={announcementInput}
                      onChange={(e) => setAnnouncementInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleBroadcast()}
                      placeholder="Broadcast message to all terminals..."
                      className="flex-1 bg-[#232323] border border-[#30363D] rounded-md py-4 px-6 text-sm text-white focus:border-[#5D00FF] outline-none transition-all"
                    />
                    <div className="flex gap-4">
                      <div className="relative">
                        <input
                          type="number"
                          value={announcementDuration}
                          onChange={(e) => setAnnouncementDuration(parseInt(e.target.value) || 5)}
                          className="w-24 bg-[#232323] border border-[#30363D] rounded-md py-4 pr-10 pl-4 text-center text-sm text-white outline-none font-mono focus:border-[#5D00FF]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#A0A0A0] pointer-events-none uppercase">Sec</span>
                      </div>
                      <button onClick={handleBroadcast} className="px-8 py-4 bg-[#CFFF04] text-black rounded-md font-bold text-[11px] uppercase tracking-tight transition-all active:scale-95">Broadcast</button>
                    </div>
                  </div>

                  {broadcastHistory.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-tight flex items-center gap-2 hover:text-[#CFFF04] transition-colors"
                      >
                        <History size={12} /> {showHistory ? 'Hide' : 'Show'} History
                      </button>
                      {showHistory && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {broadcastHistory.map((h, i) => (
                            <div key={i} className="text-[10px] text-[#A0A0A0] bg-[#232323] p-3 border border-[#30363D] flex justify-between items-center group">
                              <span className="truncate pr-4">{h}</span>
                              <button onClick={() => setAnnouncementInput(h)} className="text-[#CFFF04] opacity-0 group-hover:opacity-100 uppercase font-bold text-[9px] shrink-0">Reuse</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 xl:col-span-4">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-tight">Active Terminals</p>
                  <RefreshCw size={12} className="text-[#A0A0A0] hover:text-[#CFFF04] cursor-pointer transition-colors" onClick={() => mutateActive()} />
                </div>
                <div className="border border-[#30363D] bg-[#5D00FF] p-6 h-[280px] overflow-y-auto space-y-3 custom-scrollbar">
                  {activeEvent.participants?.map((p: Participant, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-white/10 last:border-0 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#CFFF04]"></div>
                      <span className="text-sm text-white font-medium truncate">{p.teamName}</span>
                    </div>
                  ))}
                  {(!activeEvent.participants || activeEvent.participants.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                      <Monitor size={32} className="mb-2 text-white/50" />
                      <p className="text-[11px] text-white/70 font-medium uppercase tracking-tight">Listening for nodes...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Blueprints */}
      <section className="pt-4">
        <div className="flex items-center gap-3 mb-8 px-1">
          <h2 className="text-lg font-semibold text-white uppercase tracking-tight">Hackathon Blueprints</h2>
        </div>

        {drafts.length === 0 ? (
          <div className="border border-[#30363D] bg-[#1C1C1C] p-12 text-center">
            <p className="font-medium text-sm text-[#A0A0A0]">No saved blueprints. Create a flow to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {drafts.map((flow) => (
              <div key={flow.roomId} className="border border-[#30363D] bg-[#1C1C1C] p-6 flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                  <Terminal size={64} />
                </div>

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#CFFF04] transition-colors truncate pr-6 uppercase tracking-tight">{flow.name}</h3>
                    <button
                      onClick={() => openConfirmModal('DELETE', flow.roomId, flow.name)}
                      className="p-1.5 text-[#A0A0A0] hover:text-[#FF2E9A] transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1 text-[10px] text-[#A0A0A0] font-bold uppercase tracking-tight">
                      <Clock size={12} /> {flow.phases.reduce((acc: number, p) => acc + p.durationMinutes, 0)}m
                    </div>
                    <div className="w-1 h-1 rounded-full bg-[#30363D]"></div>
                    <div className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-tight">
                      {flow.phases.length} Phases
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => engineControlExecution(flow.roomId, 'RESUME')}
                    className="flex-1 py-2.5 bg-[#CFFF04] text-black rounded-md text-[10px] font-bold uppercase tracking-tight transition-all active:scale-95"
                  >
                    Launch
                  </button>
                  <Link
                    href={`/flow?edit=${flow.roomId}`}
                    className="flex-1 py-2.5 bg-[#5D00FF] border border-[#30363D] text-white rounded-md text-[10px] font-bold uppercase tracking-tight text-center transition-all"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Archive */}
      <section className="pt-6">
        <button
          onClick={() => setIsArchiveOpen(!isArchiveOpen)}
          className="flex items-center gap-3 text-[#A0A0A0] hover:text-white transition-all group"
        >
          <div className="p-2 border border-[#30363D] bg-[#1C1C1C] group-hover:bg-[#232323] transition-all">
            <History size={16} />
          </div>
          <h2 className="text-sm font-bold tracking-tight uppercase">Archived Hackathon ({completed.length})</h2>
          <div className={`transition-transform duration-300 ${isArchiveOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={18} />
          </div>
        </button>

        {isArchiveOpen && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {completed.length === 0 && <p className="text-xs text-[#A0A0A0] italic p-6">Archive is currently empty.</p>}
            {completed.map((flow) => (
              <div key={flow.roomId} className="border border-[#30363D] bg-[#1C1C1C] p-5 flex justify-between items-center group hover:bg-[#232323] transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#5D00FF] text-[#CFFF04]">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-[#CFFF04] transition-colors uppercase tracking-tight">{flow.name}</p>
                    <p className="text-[10px] text-[#A0A0A0] font-mono mt-1 uppercase tracking-tight">{flow.roomId} • Concluded {new Date(flow.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => openConfirmModal('DELETE', flow.roomId, flow.name)}
                  className="p-2 text-[#A0A0A0] hover:text-[#FF2E9A] transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
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
        title="System Confirmation"
        footer={(
          <div className="flex gap-4 w-full">
            <button
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="flex-1 py-3 text-[11px] font-bold uppercase tracking-tight text-[#A0A0A0] hover:text-white hover:bg-[#232323] rounded-md transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmedAction}
              className={`flex-2 py-3 px-8 rounded-md font-bold text-[11px] uppercase tracking-tight transition-all active:scale-95 ${confirmModal.type === 'DELETE' ? 'bg-[#FF2E9A] text-white' : 'bg-[#CFFF04] text-black'
                }`}
            >
              Confirm {confirmModal.type === 'DELETE' ? 'Purge' : 'Execution'}
            </button>
          </div>
        )}
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className={`p-5 mb-6 border border-[#30363D] ${confirmModal.type === 'DELETE' ? 'bg-[#FF2E9A]/10 text-[#FF2E9A]' : 'bg-[#5D00FF] text-[#CFFF04]'}`}>
            <AlertTriangle size={32} />
          </div>
          <h4 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">
            {confirmModal.type === 'DELETE' ? 'Irreversible Purge' : 'Master Override'}
          </h4>
          <p className="text-sm text-[#A0A0A0] leading-relaxed max-w-[280px]">
            {confirmModal.type === 'DELETE'
              ? `Proceeding will permanently erase "${confirmModal.flowName}" from the central database. This action cannot be undone.`
              : confirmModal.type === 'STOP'
                ? `The session for "${confirmModal.flowName}" will be terminated and archived. All terminal links will be severed.`
                : `You are forcing a phase transition for "${confirmModal.flowName}". Active terminal clocks will be synchronized immediately.`}
          </p>
        </div>
      </Modal>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

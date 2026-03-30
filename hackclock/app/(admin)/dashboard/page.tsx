"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import useSWR from 'swr';
import { Network, Play, Pause, FastForward, Megaphone, Terminal, CheckCircle2, Square, Trash2, ChevronDown, History, AlertTriangle, RefreshCw, Clock, Monitor, Edit, XCircle } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto pb-20 space-y-12 stagger-in">

      {/* 1. Header & Quick Stats */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">Overview</h1>
          <p className="text-slate-400 text-sm font-medium">
            Welcome back, <span className="text-blue-400">{userEmail?.split('@')[0]}</span>. System is operational.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/flow"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2 text-sm"
          >
            <Network size={18} /> New Flow
          </Link>
        </div>
      </header>

      {/* 2. Active Engines */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
            <h2 className="text-lg font-semibold text-white">Active Hackathon</h2>
          </div>
        </div>

        {activeFlows.length === 0 ? (
          <div className="glass border-dashed border-white/10 rounded-3xl p-16 text-center group transition-all hover:bg-white/[0.04]">
            <p className="text-slate-400 font-medium">No active hackathon sessions detected.</p>
            <Link href="/flow" className="text-blue-400 text-sm mt-2 inline-block hover:underline">Deploy a blueprint to begin</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-in">
            {activeFlows.map((flow) => (
              <div
                key={flow.roomId}
                className="glass rounded-3xl p-8 relative overflow-hidden group transition-all glass-hover border-white/5 shadow-2xl"
              >
                {/* Visual Accent */}
                <div
                  className="absolute top-0 left-0 w-1.5 h-full opacity-60"
                  style={{ backgroundColor: flow.branding?.accentColor || 'var(--accent-primary)' }}
                ></div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{flow.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase bg-white/5 px-2 py-0.5 rounded">ID: {flow.roomId}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${flow.status === 'RUNNING' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {flow.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openConfirmModal('DELETE', flow.roomId, flow.name)}
                    className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex gap-4 mt-8">
                  {flow.status === 'RUNNING' ? (
                    <button
                      onClick={() => engineControlExecution(flow.roomId, 'PAUSE')}
                      className="flex-1 py-3 bg-white/5 border border-white/5 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                    >
                      <Pause size={14} /> Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => engineControlExecution(flow.roomId, 'RESUME')}
                      className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all"
                    >
                      <Play size={14} /> Resume
                    </button>
                  )}
                  <button
                    onClick={() => openConfirmModal('NEXT_PHASE', flow.roomId, flow.name)}
                    className="flex-1 py-3 bg-white/5 border border-white/5 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                  >
                    <FastForward size={14} /> Next
                  </button>
                  <button
                    onClick={() => openConfirmModal('STOP', flow.roomId, flow.name)}
                    className="p-3 bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-2xl transition-all"
                  >
                    <Square size={16} />
                  </button>
                </div>

                <div className="mt-4">
                  <Link
                    href={`/flow?edit=${flow.roomId}`}
                    className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-white transition-colors"
                  >
                    <Edit size={12} /> Edit Flow
                  </Link>
                </div>

                <Link href={flow.roomId === activeRoomId ? "#active-control" : `/room/${flow.roomId}/clock`} onClick={async () => { if (flow.roomId !== activeRoomId) await update({ activeRoomId: flow.roomId }); }} className="block mt-6 text-center text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em] hover:text-blue-300 transition-colors">
                  {flow.roomId === activeRoomId ? "● Currently Linked" : "Connect to Terminal"}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Global Control */}
      {activeEvent && activeEvent.status !== 'COMPLETED' && (
        <section id="active-control" className="glass rounded-[2.5rem] p-10 border-blue-500/10 shadow-[0_32px_64px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                <Terminal size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{activeEvent.name}</h2>
                <p className="text-xs text-slate-500 font-medium">Live Control Interface</p>
              </div>
              <Link
                href={`/flow?edit=${activeEvent.roomId}`}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all"
              >
                <Edit size={14} /> Edit Flow
              </Link>
              <button
                onClick={handleDisconnectTerminal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-rose-500/15 hover:text-rose-200 transition-all"
              >
                <XCircle size={14} /> Disconnect Terminal
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 space-y-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Status', value: activeEvent.status, sub: 'Current State' },
                    { label: 'Phase', value: activeEvent.phases[activeEvent.currentPhaseIndex]?.name || "N/A", sub: 'Phase Execution' },
                    { label: 'Teams', value: activeEvent.participants?.length || 0, sub: 'Total Connected' },
                    { label: 'Node ID', value: activeRoomId, sub: 'Active Room' },
                  ].map((item, i) => (
                    <div key={i} className="bg-black/20 p-5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">{item.label}</p>
                      <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                      <p className="text-[8px] text-slate-600 font-medium mt-1">{item.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Megaphone size={14} className="text-blue-400" /> Terminal Broadcast
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={announcementInput}
                      onChange={(e) => setAnnouncementInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleBroadcast()}
                      placeholder="Broadcast message to all terminals..."
                      className="flex-1 bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:border-blue-500/50 focus:bg-black/40 outline-none transition-all"
                    />
                    <div className="flex gap-4">
                      <div className="relative">
                        <input
                          type="number"
                          value={announcementDuration}
                          onChange={(e) => setAnnouncementDuration(parseInt(e.target.value) || 5)}
                          className="w-24 bg-black/20 border border-white/5 rounded-2xl py-4 pr-10 pl-4 text-center text-sm text-white outline-none font-mono focus:border-blue-500/50"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-600 pointer-events-none uppercase">Sec</span>
                      </div>
                      <button onClick={handleBroadcast} className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95">Broadcast</button>
                    </div>
                  </div>

                  {broadcastHistory.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 hover:text-blue-400 transition-colors"
                      >
                        <History size={12} /> {showHistory ? 'Hide' : 'Show'} History
                      </button>
                      {showHistory && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {broadcastHistory.map((h, i) => (
                            <div key={i} className="text-[10px] text-slate-400 bg-black/20 p-3 rounded-xl border border-white/5 flex justify-between items-center group">
                              <span className="truncate pr-4">{h}</span>
                              <button onClick={() => setAnnouncementInput(h)} className="text-blue-400 opacity-0 group-hover:opacity-100 uppercase font-bold text-[9px] shrink-0">Reuse</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-72 space-y-6">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Terminals</p>
                  <RefreshCw size={12} className="text-slate-600 hover:text-blue-400 cursor-pointer transition-colors" onClick={() => mutateActive()} />
                </div>
                <div className="bg-black/20 border border-white/5 rounded-3xl p-6 h-[280px] overflow-y-auto space-y-3 custom-scrollbar">
                  {activeEvent.participants?.map((p: Participant, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                      <span className="text-sm text-slate-200 font-medium truncate group-hover:text-white transition-colors">{p.teamName}</span>
                    </div>
                  ))}
                  {(!activeEvent.participants || activeEvent.participants.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <Monitor size={32} className="mb-2 text-slate-600" />
                      <p className="text-[11px] text-slate-500 font-medium">Listening for nodes...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Blueprints */}
      <section className="pt-10">
        <div className="flex items-center gap-3 mb-8 px-1">
          <h2 className="text-lg font-semibold text-white">Hackathon Blueprints</h2>
        </div>

        {drafts.length === 0 ? (
          <div className="glass border-white/5 rounded-3xl p-12 text-center">
            <p className="text-slate-500 font-medium text-sm">No saved blueprints. Create a flow to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {drafts.map((flow) => (
              <div key={flow.roomId} className="glass rounded-2xl p-6 flex flex-col justify-between glass-hover border-white/5 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                  <Terminal size={64} />
                </div>

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate pr-6">{flow.name}</h3>
                    <button
                      onClick={() => openConfirmModal('DELETE', flow.roomId, flow.name)}
                      className="p-1.5 text-slate-600 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <Clock size={12} /> {flow.phases.reduce((acc: number, p) => acc + p.durationMinutes, 0)}m
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {flow.phases.length} Phases
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => engineControlExecution(flow.roomId, 'RESUME')}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95"
                  >
                    Launch
                  </button>
                  <Link
                    href={`/flow?edit=${flow.roomId}`}
                    className="flex-1 py-2.5 bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest text-center transition-all"
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
      <section className="pt-10">
        <button
          onClick={() => setIsArchiveOpen(!isArchiveOpen)}
          className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group"
        >
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all">
            <History size={16} />
          </div>
          <h2 className="text-sm font-bold tracking-widest uppercase">Archived Hackathon ({completed.length})</h2>
          <div className={`transition-transform duration-300 ${isArchiveOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={18} />
          </div>
        </button>

        {isArchiveOpen && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {completed.length === 0 && <p className="text-xs text-slate-600 italic p-6">Archive is currently empty.</p>}
            {completed.map((flow) => (
              <div key={flow.roomId} className="glass border-white/5 rounded-2xl p-5 flex justify-between items-center group hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{flow.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-tight">{flow.roomId} • Concluded {new Date(flow.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => openConfirmModal('DELETE', flow.roomId, flow.name)}
                  className="p-2 text-slate-700 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
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
              className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmedAction}
              className={`flex-2 py-3 px-8 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${confirmModal.type === 'DELETE' ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
            >
              Confirm {confirmModal.type === 'DELETE' ? 'Purge' : 'Execution'}
            </button>
          </div>
        )}
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className={`p-5 rounded-3xl mb-6 shadow-2xl ${confirmModal.type === 'DELETE' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
            <AlertTriangle size={32} />
          </div>
          <h4 className="text-xl font-bold text-white mb-3">
            {confirmModal.type === 'DELETE' ? 'Irreversible Purge' : 'Master Override'}
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed max-w-[280px]">
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

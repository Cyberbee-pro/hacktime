"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import useSWR from 'swr';
import { User, CheckCircle2, Image as ImageIcon, Save, LogOut, History, Clock, Terminal, ChevronRight, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { PRESET_AVATARS } from '@/lib/constants';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Hackathon {
  roomId: string;
  name: string;
  status: string;
  updatedAt: string;
  phases: any[];
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const userEmail = session?.user?.email;
  
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Fetch all hackathons for this user
  const { data: hackathons } = useSWR<Hackathon[]>(
    userEmail ? `${process.env.NEXT_PUBLIC_API_URL}/api/hackathons?organizerSecret=${userEmail}` : null,
    fetcher
  );

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      if (session.user.image) setSelectedAvatar(session.user.image);
    }
  }, [session]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          name,
          profilePic: selectedAvatar
        })
      });

      if (!res.ok) throw new Error("Failed to update profile");
      await update({ name: name, image: selectedAvatar });
      setMessage({ text: "Identity synced successfully.", type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ text: "System error: Could not sync profile.", type: 'error' });
    }
    
    setIsSaving(false);
  };

  const archived = hackathons?.filter(h => h.status === 'COMPLETED') || [];
  const active = hackathons?.filter(h => h.status === 'RUNNING' || h.status === 'PAUSED' || h.status === 'DRAFT') || [];

  return (
    <div className="max-w-6xl mx-auto pb-24 stagger-in">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">Organizer Identity</h1>
          <p className="text-slate-400 font-medium">Manage your terminal session credentials and historical data.</p>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500/20 transition-all active:scale-95"
        >
          <LogOut size={14} /> Terminate Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Settings */}
        <div className="lg:col-span-7 space-y-8">
          <section className="glass rounded-[2.5rem] p-10 border-white/5 shadow-2xl relative overflow-hidden">
            {message && (
              <div className={`mb-8 p-4 rounded-2xl border text-[10px] font-bold tracking-widest uppercase flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                 {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                 {message.text}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                      <User size={18} />
                   </div>
                   <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">Visual Avatar</h2>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {PRESET_AVATARS.map((avatar, index) => (
                    <button 
                      key={index}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`w-20 h-20 rounded-2xl cursor-pointer flex items-center justify-center bg-black/40 overflow-hidden transition-all duration-300 border-2 relative group ${
                        selectedAvatar === avatar 
                          ? 'border-blue-500 shadow-[0_0_30px_rgba(0,112,243,0.3)] scale-105' 
                          : 'border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img src={avatar} alt={`Preset ${index + 1}`} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 bg-blue-500/20 transition-opacity ${selectedAvatar === avatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Organizer Display Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Terminal ID (Email)</label>
                  <div className="relative group">
                    <ShieldCheck size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                    <div className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-slate-500 font-mono text-sm cursor-not-allowed">
                      {userEmail}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {isSaving ? "Synchronizing..." : "Save Identity"}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Hackathon History */}
        <div className="lg:col-span-5 space-y-8">
          <section className="glass rounded-[2.5rem] p-8 border-white/5 shadow-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <History size={18} />
                </div>
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">Event Log</h2>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                {hackathons?.length || 0} Total
              </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {hackathons && hackathons.length > 0 ? (
                <>
                  {/* Active/Upcoming Section */}
                  {active.length > 0 && (
                    <div className="space-y-3 mb-8">
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] ml-2 mb-4">Active Sequences</p>
                      {active.map(h => (
                        <div key={h.roomId} className="bg-white/[0.03] border border-blue-500/20 rounded-2xl p-5 group hover:bg-white/[0.05] transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{h.name}</h3>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(0,112,243,0.5)]"></div>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                            <span>{h.roomId}</span>
                            <span>•</span>
                            <span className="text-blue-400 uppercase font-bold">{h.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Completed Section */}
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 mb-4">Concluded Nodes</p>
                    {archived.length > 0 ? archived.map(h => (
                      <div key={h.roomId} className="bg-black/20 border border-white/5 rounded-2xl p-5 group hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-300 group-hover:text-white transition-colors">{h.name}</h3>
                          <CheckCircle2 size={14} className="text-emerald-500/50" />
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                          <span>{h.roomId}</span>
                          <span>•</span>
                          <span>{new Date(h.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-600 italic ml-2">No concluded sessions found.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 pt-20">
                  <Terminal size={48} className="mb-4 text-slate-600" />
                  <p className="text-sm font-medium text-slate-500">No telemetry data detected.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
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

function Loader2({ size, className }: { size: number, className: string }) {
  return <Activity size={size} className={className} />;
}

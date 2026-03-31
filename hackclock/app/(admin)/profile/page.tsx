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
          <h1 className="text-4xl font-semibold tracking-tight mb-2" style={{ color: '#E6E6E6' }}>Organizer Identity</h1>
          <p className="font-medium" style={{ color: '#A0A0A0' }}>Manage your terminal session credentials and historical data.</p>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 px-6 py-3 rounded-[20px] font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
          style={{ backgroundColor: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', color: '#F43F5E' }}
        >
          <LogOut size={14} /> Terminate Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Settings */}
        <div className="lg:col-span-7 space-y-8">
          <section className="rounded-[20px] p-10 shadow-2xl relative overflow-hidden" style={{ backgroundColor: '#1C1C1C', border: '1px solid rgba(255,255,255,0.06)' }}>
            {message && (
              <div className="mb-8 p-4 rounded-[20px] text-[10px] font-bold tracking-widest uppercase flex items-center gap-3 animate-in slide-in-from-top-4 duration-300" style={{
                backgroundColor: message.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
                border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`,
                color: message.type === 'success' ? '#10B981' : '#F43F5E'
              }}>
                 {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                 {message.text}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(255,46,154,0.08)', color: '#FF2E9A' }}>
                      <User size={18} />
                   </div>
                   <h2 className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: '#E6E6E6' }}>Visual Avatar</h2>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {PRESET_AVATARS.map((avatar, index) => (
                    <button 
                      key={index}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className="w-20 h-20 rounded-[20px] cursor-pointer flex items-center justify-center overflow-hidden transition-all duration-300 border-2 relative group"
                      style={{
                        backgroundColor: 'rgba(15,15,16,0.6)',
                        borderColor: selectedAvatar === avatar ? '#FF2E9A' : 'rgba(255,255,255,0.04)',
                        boxShadow: selectedAvatar === avatar ? '0 0 30px rgba(255,46,154,0.2)' : 'none',
                        transform: selectedAvatar === avatar ? 'scale(1.05)' : 'scale(1)'
                      }}
                    >
                      <img src={avatar} alt={`Preset ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 transition-opacity" style={{ backgroundColor: 'rgba(255,46,154,0.15)', opacity: selectedAvatar === avatar ? 1 : 0 }} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: '#6B7280' }}>Organizer Display Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-[20px] py-4 pl-12 pr-6 outline-none transition-all font-medium"
                      style={{ backgroundColor: 'rgba(15,15,16,0.6)', border: '1px solid rgba(255,255,255,0.04)', color: '#E6E6E6' }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(255,46,154,0.3)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.04)'}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: '#6B7280' }}>Terminal ID (Email)</label>
                  <div className="relative group">
                    <ShieldCheck size={16} className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
                    <div className="w-full rounded-[20px] py-4 pl-12 pr-6 font-mono text-sm cursor-not-allowed" style={{ backgroundColor: 'rgba(15,15,16,0.8)', border: '1px solid rgba(255,255,255,0.04)', color: '#6B7280' }}>
                      {userEmail}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-10 py-4 rounded-[20px] font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
                  style={{ backgroundColor: '#CFFF04', color: '#0F0F10' }}
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
          <section className="rounded-[20px] p-8 shadow-2xl h-full flex flex-col" style={{ backgroundColor: '#1C1C1C', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
                  <History size={18} />
                </div>
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: '#E6E6E6' }}>Event Log</h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ color: '#6B7280', backgroundColor: 'rgba(255,255,255,0.04)' }}>
                {hackathons?.length || 0} Total
              </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {hackathons && hackathons.length > 0 ? (
                <>
                  {/* Active/Upcoming Section */}
                  {active.length > 0 && (
                    <div className="space-y-3 mb-8">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] ml-2 mb-4" style={{ color: '#FF2E9A' }}>Active Sequences</p>
                      {active.map(h => (
                        <div key={h.roomId} className="rounded-[20px] p-5 group transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,46,154,0.12)' }}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold group-hover:text-[#FF2E9A] transition-colors" style={{ color: '#E6E6E6' }}>{h.name}</h3>
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#FF2E9A', boxShadow: '0 0 10px rgba(255,46,154,0.5)' }}></div>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-mono" style={{ color: '#6B7280' }}>
                            <span>{h.roomId}</span>
                            <span>•</span>
                            <span className="uppercase font-bold" style={{ color: '#FF2E9A' }}>{h.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Completed Section */}
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] ml-2 mb-4" style={{ color: '#6B7280' }}>Concluded Nodes</p>
                    {archived.length > 0 ? archived.map(h => (
                      <div key={h.roomId} className="rounded-[20px] p-5 group transition-all" style={{ backgroundColor: 'rgba(15,15,16,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold group-hover:text-white transition-colors" style={{ color: '#A0A0A0' }}>{h.name}</h3>
                          <CheckCircle2 size={14} style={{ color: 'rgba(16,185,129,0.5)' }} />
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-mono" style={{ color: '#6B7280' }}>
                          <span>{h.roomId}</span>
                          <span>•</span>
                          <span>{new Date(h.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs italic ml-2" style={{ color: '#6B7280' }}>No concluded sessions found.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 pt-20">
                  <Terminal size={48} className="mb-4" style={{ color: '#6B7280' }} />
                  <p className="text-sm font-medium" style={{ color: '#6B7280' }}>No telemetry data detected.</p>
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

"use client";

import { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Network, Plus, Trash2, Zap, Save, GripVertical, CheckCircle2, Copy, Image as ImageIcon, Loader2, ArrowLeft, Clock, Calendar, Globe, Palette, Settings2, Sparkles, ChevronRight, Activity, AlertTriangle, Wand2, RefreshCw } from 'lucide-react';

function FlowForm() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('edit');

  const [isDeploying, setIsDeploying] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(!!editId);
  const [generatedRoom, setGeneratedRoom] = useState<{ id: string, secret: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    eventStartTime: '',
    eventEndTime: '',
    timezone: '',
    accentColor: '#0070F3',
    logoUrl: '',
    themeMode: 'noir',
    glassIntensity: 20,
  });

  const [availableTimezones, setAvailableTimezones] = useState<string[]>([]);

  const [phases, setPhases] = useState([
    { id: 1, name: 'Registration & Kickoff', durationMinutes: 60, autoTransition: true },
    { id: 2, name: 'Hacking Session', durationMinutes: 1440, autoTransition: false },
    { id: 3, name: 'Submission & Pitch', durationMinutes: 120, autoTransition: false },
  ]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const formatDateTime = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const tzs = [
      'UTC', 'Africa/Lagos', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
      'America/Sao_Paulo', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
      'Asia/Shanghai', 'Australia/Sydney', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
      'Europe/Moscow', 'Pacific/Auckland'
    ];
    setAvailableTimezones(!tzs.includes(userTimezone) ? [userTimezone, ...tzs].sort() : tzs.sort());

    if (!editId) {
      setFormData(prev => ({
        ...prev,
        eventStartTime: formatDateTime(now),
        eventEndTime: formatDateTime(tomorrow),
        timezone: userTimezone
      }));
    } else {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${editId}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setFormData({
              name: data.name,
              eventStartTime: data.eventStartTime,
              eventEndTime: data.eventEndTime,
              timezone: data.timezone,
              accentColor: data.branding?.accentColor || '#0070F3',
              logoUrl: data.branding?.logoUrl || '',
              themeMode: data.branding?.themeMode || 'noir',
              glassIntensity: data.branding?.glassIntensity || 20,
            });
            if (data.phases) setPhases(data.phases.map((p: any, i: number) => ({ ...p, id: p._id || i })));
          }
          setIsLoadingData(false);
        })
        .catch(() => setIsLoadingData(false));
    }
  }, [editId]);

  const totalPhaseMinutes = useMemo(() => phases.reduce((acc, p) => acc + (p.durationMinutes || 0), 0), [phases]);
  
  const scheduledMinutes = useMemo(() => {
    if (!formData.eventStartTime || !formData.eventEndTime) return 0;
    const start = new Date(formData.eventStartTime).getTime();
    const end = new Date(formData.eventEndTime).getTime();
    return Math.max(0, Math.floor((end - start) / 60000));
  }, [formData.eventStartTime, formData.eventEndTime]);

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const autoPopulatePhases = () => {
    if (scheduledMinutes <= 0) {
      alert("Please set event start and end times first.");
      return;
    }

    const kickoff = Math.min(120, Math.floor(scheduledMinutes * 0.05));
    const pitch = Math.min(240, Math.floor(scheduledMinutes * 0.10));
    const hack = scheduledMinutes - kickoff - pitch;

    setPhases([
      { id: Date.now(), name: 'Kickoff & Team Matching', durationMinutes: kickoff || 60, autoTransition: true },
      { id: Date.now() + 1, name: 'Hacking Period', durationMinutes: hack || 1440, autoTransition: false },
      { id: Date.now() + 2, name: 'Demos & Judging', durationMinutes: pitch || 120, autoTransition: false },
    ]);
  };

  const syncDuration = () => {
    if (phases.length === 0) return;
    const newPhases = [...phases];
    // Find the longest phase (usually hacking) and adjust it
    const hackIdx = newPhases.findIndex(p => p.name.toLowerCase().includes('hack') || p.name.toLowerCase().includes('build')) || 1;
    const currentOthers = totalPhaseMinutes - (newPhases[hackIdx]?.durationMinutes || 0);
    const newHackDuration = Math.max(1, scheduledMinutes - currentOthers);
    newPhases[hackIdx] = { ...newPhases[hackIdx], durationMinutes: newHackDuration };
    setPhases(newPhases);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) {
        alert("Image too large (>1MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, logoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async (isDraft = false) => {
    if (isDraft) setIsSavingDraft(true);
    else setIsDeploying(true);

    try {
      const payload = {
        name: formData.name,
        organizerSecret: session?.user?.email,
        eventStartTime: formData.eventStartTime,
        eventEndTime: formData.eventEndTime,
        timezone: formData.timezone,
        branding: { 
          accentColor: formData.accentColor, 
          logoUrl: formData.logoUrl,
          themeMode: formData.themeMode,
          glassIntensity: formData.glassIntensity
        },
        phases: phases,
        status: editId ? undefined : (isDraft ? 'DRAFT' : 'RUNNING')
      };

      const url = editId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/hackathons`;

      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        if (editId) {
          router.push('/dashboard');
        } else {
          setGeneratedRoom({ id: data.roomId, secret: session?.user?.email || 'N/A' });
          if (!isDraft) await update({ activeRoomId: data.roomId });
          setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error: any) {
      alert(`System Error: ${error.message}`);
    } finally {
      setIsDeploying(false);
      setIsSavingDraft(false);
    }
  };

  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPhases = [...phases];
    const draggedItem = newPhases[draggedIndex];
    newPhases.splice(draggedIndex, 1);
    newPhases.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setPhases(newPhases);
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
  };

  if (isLoadingData) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-500" size={32} />
      <p className="text-slate-500 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Initializing Builder...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 stagger-in">
      {/* Top Navigation */}
      {/* <div className="mb-12 flex items-center justify-between">
        <Link href="/dashboard" className="group flex items-center gap-2 text-slate-500 hover:text-white transition-all">
          <div className="p-2 rounded-full group-hover:bg-white/5 transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Back to Hub</span>
        </Link>
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Builder Mode</span>
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {/* Header Section */}
          <div className="relative">
            <h1 className="text-5xl font-semibold tracking-tight text-white mb-4">
              {editId ? 'Refining Hackathon' : 'Hackathon Builder'}
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
              Design your hackathon's journey. Set your schedule, define phases, and customize your visual style.
            </p>
          </div>

          {/* 1. Configuration Section */}
          <section className="glass rounded-[2rem] p-10 border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                   <Activity size={18} />
                </div>
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">Event Info</h2>
             </div>

             <div className="grid grid-cols-1 gap-8 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Hackathon Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="e.g. Global Hack 2026"
                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-5 px-6 text-xl font-semibold text-white outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all placeholder:text-slate-700" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Calendar size={12} className="text-blue-400" /> Starts
                    </label>
                    <input 
                      type="datetime-local" 
                      value={formData.eventStartTime} 
                      onChange={e => setFormData({ ...formData, eventStartTime: e.target.value })} 
                      className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 text-sm [color-scheme:dark]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Calendar size={12} className="text-rose-400" /> Ends
                    </label>
                    <input 
                      type="datetime-local" 
                      value={formData.eventEndTime} 
                      onChange={e => setFormData({ ...formData, eventEndTime: e.target.value })} 
                      className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 text-sm [color-scheme:dark]" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Globe size={12} className="text-cyan-400" /> Timezone
                  </label>
                  <select 
                    value={formData.timezone} 
                    onChange={e => setFormData({ ...formData, timezone: e.target.value })} 
                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 text-sm appearance-none"
                  >
                    {availableTimezones.map(tz => <option key={tz} value={tz} className="bg-[#111]">{tz}</option>)}
                  </select>
                </div>
             </div>
          </section>

          {/* 2. Timeline Section */}
          <section className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Clock size={18} />
                </div>
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">Experience Timeline</h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={autoPopulatePhases}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all"
                >
                  <Wand2 size={12} /> Auto-Fill Timeline
                </button>
                <button 
                  onClick={() => setPhases([...phases, { id: Date.now(), name: 'New Phase', durationMinutes: 60, autoTransition: false }])} 
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full text-[9px] font-bold uppercase tracking-widest transition-all"
                >
                  <Plus size={12} /> Add Phase
                </button>
              </div>
            </div>

            <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-500/40 before:via-emerald-500/40 before:to-transparent">
              {phases.map((phase, index) => (
                <div 
                  key={phase.id} 
                  draggable
                  onDragStart={() => onDragStart(index)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDragEnd={onDragEnd}
                  className={`group relative glass rounded-3xl p-6 border-white/5 glass-hover shadow-xl transition-all duration-300 ${draggedIndex === index ? 'opacity-40 scale-95 border-blue-500/40' : 'opacity-100'}`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[29px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                    {/* Reorder Handle */}
                    <div className="cursor-grab active:cursor-grabbing p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all">
                       <GripVertical size={20} />
                    </div>

                    <div className="flex-1 w-full space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase ml-1">Phase {String(index + 1).padStart(2, '0')}</p>
                      <input 
                        type="text" 
                        value={phase.name} 
                        onChange={(e) => setPhases(phases.map(p => p.id === phase.id ? { ...p, name: e.target.value } : p))} 
                        className="bg-transparent border-none text-xl font-bold text-white outline-none w-full focus:text-blue-400 transition-colors" 
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-8 w-full md:w-auto">
                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase text-center md:text-left">Duration</p>
                        <div className="flex items-center gap-3 bg-black/40 rounded-xl px-4 py-2 border border-white/5">
                          <input 
                            type="number" 
                            value={phase.durationMinutes} 
                            onChange={(e) => setPhases(phases.map(p => p.id === phase.id ? { ...p, durationMinutes: parseInt(e.target.value) || 0 } : p))} 
                            className="w-12 bg-transparent text-white text-sm font-mono font-bold text-center outline-none" 
                          />
                          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Min</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase text-center md:text-left">Auto-Next</p>
                        <button 
                          onClick={() => setPhases(phases.map(p => p.id === phase.id ? { ...p, autoTransition: !p.autoTransition } : p))} 
                          className={`w-12 h-6 rounded-full relative transition-all duration-300 ${phase.autoTransition ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${phase.autoTransition ? 'right-1' : 'left-1'}`}></div>
                        </button>
                      </div>

                      <button 
                        onClick={() => setPhases(phases.filter(p => p.id !== phase.id))} 
                        className="p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-2xl transition-all md:opacity-0 md:group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => setPhases([...phases, { id: Date.now(), name: 'New Phase', durationMinutes: 60, autoTransition: false }])} 
                className="w-full py-6 border border-dashed border-white/10 rounded-3xl text-sm font-bold text-slate-500 tracking-[0.2em] uppercase hover:border-blue-500/40 hover:text-blue-400 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
              >
                <Plus size={18} /> Add New Phase
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-12 h-fit">
          <section className="glass rounded-[2rem] p-8 border-white/5 shadow-2xl space-y-8 overflow-hidden relative">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 flex items-center gap-2">
               <Activity size={16} className="text-blue-400" /> Hackathon Pulse
            </h2>

            <div className="space-y-6 relative z-10">
               <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Scheduled Total</p>
                  </div>
                  <p className="text-4xl font-bold text-white">{formatDuration(scheduledMinutes)}</p>
                  
                  <div className="mt-6 space-y-2 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Phase Allocation</p>
                      <p className={`text-[10px] font-mono font-bold ${Math.abs(totalPhaseMinutes - scheduledMinutes) < 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {formatDuration(totalPhaseMinutes)}
                      </p>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div 
                          className={`h-full transition-all duration-500 ${Math.abs(totalPhaseMinutes - scheduledMinutes) < 1 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(100, (totalPhaseMinutes / scheduledMinutes) * 100)}%` }}
                       ></div>
                    </div>
                  </div>

                  {Math.abs(totalPhaseMinutes - scheduledMinutes) > 1 && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <p className="text-[9px] text-amber-500/80 font-medium flex items-center gap-1.5 leading-relaxed">
                        <AlertTriangle size={12} className="shrink-0" /> 
                        Timeline Mismatch: Your phases are {formatDuration(Math.abs(totalPhaseMinutes - scheduledMinutes))} {totalPhaseMinutes > scheduledMinutes ? 'over' : 'under'} schedule.
                      </p>
                      <button 
                        onClick={syncDuration}
                        className="mt-2 w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw size={10} /> Smart Sync Phases
                      </button>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Phases</p>
                     <p className="text-xl font-bold text-white">{phases.length}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Auto-Steps</p>
                     <p className="text-xl font-bold text-emerald-400">{phases.filter(p => p.autoTransition).length}</p>
                  </div>
               </div>

               {/* Visual Style Customization */}
               <div className="space-y-6 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Visual Style</p>
                     <button onClick={() => fileInputRef.current?.click()} className="text-[9px] text-blue-400 font-bold uppercase tracking-widest hover:underline transition-all">Logo</button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* <div className="flex gap-4">
                       <button 
                        onClick={() => setFormData({...formData, themeMode: 'noir'})}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.themeMode === 'noir' ? 'bg-white/10 text-white border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                       >
                        Noir
                       </button>
                       <button 
                        onClick={() => setFormData({...formData, themeMode: 'midnight'})}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.themeMode === 'midnight' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                       >
                        Midnight
                       </button>
                    </div>

                    <div className="space-y-3">
                       <div className="flex justify-between items-center">
                          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Glass Intensity</label>
                          <span className="text-[9px] text-white font-mono">{formData.glassIntensity}%</span>
                       </div>
                       <input 
                        type="range" 
                        min="5" 
                        max="60" 
                        value={formData.glassIntensity}
                        onChange={(e) => setFormData({...formData, glassIntensity: parseInt(e.target.value)})}
                        className="w-full accent-blue-500 h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                       />
                    </div> */}

                    <div className="flex items-center gap-6">
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                      <div 
                          className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden transition-all hover:border-white/20"
                          onClick={() => fileInputRef.current?.click()}
                      >
                          {formData.logoUrl ? (
                            <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                          ) : (
                            <ImageIcon size={20} className="text-slate-700" />
                          )}
                      </div>
                      <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-lg border border-white/20 shadow-xl" 
                              style={{ backgroundColor: formData.accentColor }}
                            ></div>
                            <input 
                              type="text" 
                              value={formData.accentColor} 
                              onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })} 
                              className="bg-transparent border-none text-[11px] font-mono text-white w-16 outline-none focus:text-blue-400" 
                            />
                          </div>
                          <div className="flex gap-1.5">
                            {['#0070F3', '#10B981', '#F43F5E', '#8B5CF6', '#F59E0B'].map(c => (
                              <div 
                                key={c} 
                                onClick={() => setFormData({ ...formData, accentColor: c })}
                                className="w-4 h-4 rounded-full cursor-pointer border border-white/5 hover:scale-125 transition-all"
                                style={{ backgroundColor: c }}
                              ></div>
                            ))}
                          </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="pt-8 space-y-4">
              <button 
                onClick={() => handleAction(false)} 
                disabled={isDeploying || isSavingDraft || !formData.name} 
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-xs tracking-[0.2em] uppercase hover:bg-blue-500 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group"
              >
                {isDeploying ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="group-hover:animate-pulse" />}
                {isDeploying ? (editId ? 'SAVING...' : 'LAUNCHING...') : (editId ? 'Update Session' : 'Launch Session')}
              </button>
              
              {!editId && (
                <button 
                  onClick={() => handleAction(true)} 
                  disabled={isDeploying || isSavingDraft || !formData.name} 
                  className="w-full py-5 bg-white/5 border border-white/5 text-slate-300 rounded-2xl font-bold text-xs tracking-[0.2em] uppercase hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                >
                  {isSavingDraft ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Blueprint
                </button>
              )}

              {generatedRoom && (
                <div ref={resultsRef} className="mt-8 pt-8 border-t border-white/5 animate-in slide-in-from-bottom-8 fade-in duration-700">
                  <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex flex-col items-center text-center gap-2">
                     <CheckCircle2 size={24} />
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Ready for Liftoff</p>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase text-center">Room ID</p>
                    <div className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 flex justify-between items-center group">
                       <span className="text-xl font-mono text-blue-400 font-bold tracking-widest">{generatedRoom.id}</span>
                       <button onClick={() => navigator.clipboard.writeText(generatedRoom.id)} className="p-2 text-slate-600 hover:text-white transition-all">
                          <Copy size={16} />
                       </button>
                    </div>
                  </div>
                  
                  <Link href="/dashboard" className="block mt-8 text-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-all">
                    Return to Overview <ChevronRight size={10} className="inline ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function FlowPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="text-slate-500 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Initializing Builder...</p>
      </div>
    }>
      <FlowForm />
    </Suspense>
  );
}

"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Network, Plus, Trash2, Zap, Save, GripVertical, CheckCircle2, Copy, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';

export default function FlowPage() {
  const { data: session, update } = useSession();
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [generatedRoom, setGeneratedRoom] = useState<{ id: string, secret: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    eventStartTime: '',
    eventEndTime: '',
    timezone: '',
    accentColor: '#4493F8',
    logoUrl: '' 
  });

  const [availableTimezones, setAvailableTimezones] = useState<string[]>([
    'UTC',
    'Africa/Lagos',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'America/Sao_Paulo',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'Pacific/Auckland'
  ]);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const formatDateTime = (d: Date) => {
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    setAvailableTimezones(prev => {
      if (!prev.includes(userTimezone)) return [userTimezone, ...prev].sort();
      return prev;
    });

    setFormData(prev => ({
      ...prev,
      eventStartTime: formatDateTime(now),
      eventEndTime: formatDateTime(tomorrow),
      timezone: userTimezone
    }));
  }, []);

  const [phases, setPhases] = useState([
    { id: 1, name: 'Kickoff', durationMinutes: 45, autoTransition: true },
    { id: 2, name: 'Ideation', durationMinutes: 120, autoTransition: false },
    { id: 3, name: 'Build', durationMinutes: 1440, autoTransition: false },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) { 
        alert("Image is too large. Please select an image under 1MB for optimal performance.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeploy = async (isDraft = false) => {
    if (isDraft) setIsSavingDraft(true);
    else setIsDeploying(true);
    
    try {
      const payload = {
        name: formData.name,
        organizerSecret: session?.user?.email,
        eventStartTime: formData.eventStartTime,
        eventEndTime: formData.eventEndTime,
        timezone: formData.timezone,
        branding: { accentColor: formData.accentColor, logoUrl: formData.logoUrl },
        phases: phases,
        status: isDraft ? 'DRAFT' : 'RUNNING'
      };
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hackathons`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (res.ok) {
        setGeneratedRoom({ id: data.roomId, secret: session?.user?.email || 'N/A' });
        if (!isDraft) {
          await update({ activeRoomId: data.roomId });
        }
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        alert(`Action failed: ${data.error}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`System Error: ${error.message}`);
    } finally {
      setIsDeploying(false);
      setIsSavingDraft(false);
    } 
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Flow Architect</h1>
          <p className="text-[#8B949E]">Engineer your hackathon&apos;s temporal sequence and visual identity.</p>
        </div>
        <Link 
          href="/dashboard" 
          title="Return to Management Hub"
          className="text-xs font-bold text-[#8B949E] hover:text-white flex items-center gap-2 uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={14} /> Back to Hub
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Parameters & Sequencing */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 md:p-8">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#4493F8] mb-6 flex items-center gap-2">
              <Network size={16} title="Network Topology" /> Global Parameters
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Hackathon Name</label>
                <input type="text" placeholder="e.g. GitCity Global Hackathon 2026" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 px-4 text-white outline-none focus:border-[#4493F8] transition-colors text-sm" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Start Time</label>
                  <input type="datetime-local" value={formData.eventStartTime} onChange={e => setFormData({...formData, eventStartTime: e.target.value})} className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 px-4 text-white outline-none focus:border-[#4493F8] text-sm [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">End Time</label>
                  <input type="datetime-local" value={formData.eventEndTime} onChange={e => setFormData({...formData, eventEndTime: e.target.value})} className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 px-4 text-white outline-none focus:border-[#4493F8] text-sm [color-scheme:dark]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Timezone</label>
                <select value={formData.timezone} onChange={e => setFormData({...formData, timezone: e.target.value})} className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 px-4 text-white outline-none focus:border-[#4493F8] text-sm">
                  {availableTimezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold tracking-wider uppercase text-[#4493F8] flex items-center gap-2">
                <Network size={16} title="Flow Sequencing" /> Phase Sequencing
              </h2>
              <button 
                onClick={() => setPhases([...phases, { id: Date.now(), name: 'New Phase', durationMinutes: 60, autoTransition: false }])} 
                title="Append New Phase"
                className="text-[#8B949E] hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase"
              >
                <Plus size={14} /> Add Phase
              </button>
            </div>

            <div className="space-y-3">
              {phases.map((phase, index) => (
                <div 
                  key={phase.id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#0D1117] border border-[#30363D] p-4 rounded-lg group animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="hidden sm:block">
                    <GripVertical size={16} className="text-[#30363D] cursor-grab" title="Drag to Reorder" />
                  </div>
                  
                  <div className="flex-1 w-full">
                    <p className="text-[9px] text-[#8B949E] font-bold tracking-widest uppercase mb-1">Phase {String(index + 1).padStart(2, '0')}</p>
                    <input type="text" value={phase.name} onChange={(e) => setPhases(phases.map(p => p.id === phase.id ? { ...p, name: e.target.value } : p))} className="bg-transparent border-none text-white font-bold outline-none w-full" />
                  </div>

                  <div className="w-full sm:w-24">
                    <p className="text-[9px] text-[#8B949E] font-bold tracking-widest uppercase mb-1">Duration</p>
                    <div className="flex items-center gap-2">
                      <input type="number" value={phase.durationMinutes} onChange={(e) => setPhases(phases.map(p => p.id === phase.id ? { ...p, durationMinutes: parseInt(e.target.value)||0 } : p))} className="w-full sm:w-12 bg-[#161B22] border border-[#30363D] rounded px-2 py-1 text-white text-xs font-mono text-center outline-none" />
                      <span className="text-xs text-[#8B949E] font-mono">m</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-32 flex justify-between sm:flex-col sm:items-end sm:border-l sm:border-[#30363D] sm:pl-4">
                    <p className="text-[9px] text-[#8B949E] font-bold tracking-widest uppercase mb-2">Auto-Next</p>
                    <button 
                      onClick={() => setPhases(phases.map(p => p.id === phase.id ? { ...p, autoTransition: !p.autoTransition } : p))} 
                      title={phase.autoTransition ? "Disable Automatic Transition" : "Enable Automatic Transition"}
                      className={`w-8 h-4 rounded-full relative transition-colors ${phase.autoTransition ? 'bg-[#3FB950]' : 'bg-[#30363D]'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${phase.autoTransition ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setPhases(phases.filter(p => p.id !== phase.id))} 
                    title="Remove Phase"
                    className="text-[#8B949E] hover:text-red-500 transition-colors sm:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setPhases([...phases, { id: Date.now(), name: 'New Phase', durationMinutes: 60, autoTransition: false }])} 
              title="Insert Phase at the End"
              className="w-full mt-4 py-3 border border-dashed border-[#30363D] rounded-lg text-xs font-bold text-[#8B949E] tracking-wider uppercase hover:border-[#8B949E] hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Insert Phase
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Branding & Deployment */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#3FB950] mb-6 flex items-center gap-2">
              <ImageIcon size={16} title="Branding Configuration" /> Visual Identity
            </h2>
            
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] text-[#8B949E] font-bold mb-3 uppercase tracking-wider text-center lg:text-left">Logo Mark</label>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Custom Brand Logo"
                  className="w-24 h-24 mx-auto lg:mx-0 bg-[#0D1117] border border-[#30363D] border-dashed rounded-lg flex flex-col items-center justify-center text-[#8B949E] cursor-pointer hover:border-[#8B949E] transition-colors overflow-hidden"
                >
                   {formData.logoUrl ? (
                     <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                   ) : (
                     <>
                      <ImageIcon size={20} className="mb-1" />
                      <p className="text-[9px] font-bold uppercase tracking-wider mt-1 text-center">Upload<br/>SVG/PNG</p>
                     </>
                   )}
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] text-[#8B949E] font-bold mb-3 uppercase tracking-wider">Accent Palette</label>
                <div className="flex gap-2 mb-4">
                  <div className="w-10 h-10 rounded overflow-hidden border border-[#30363D] relative shrink-0">
                    <input 
                      type="color" 
                      value={formData.accentColor} 
                      title="Select Custom Accent Color"
                      onChange={(e) => setFormData({...formData, accentColor: e.target.value})} 
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={formData.accentColor} 
                    title="Manual Hex Input"
                    onChange={(e) => setFormData({...formData, accentColor: e.target.value})} 
                    className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-md px-3 text-white font-mono text-xs outline-none focus:border-[#4493F8]" 
                    placeholder="#4493F8"
                  />
                </div>
                <div className="flex justify-between">
                  {['#4493F8', '#3FB950', '#F85149', '#D2A8FF', '#E3B341', '#30363D'].map(color => (
                    <div 
                      key={color} 
                      onClick={() => setFormData({...formData, accentColor: color})} 
                      title={`Preset: ${color}`}
                      className="w-6 h-6 rounded-full cursor-pointer border border-[#30363D] hover:scale-110 transition-transform" 
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 h-32 relative overflow-hidden hidden md:block">
                 <p className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider mb-2">Live Rendering Preview</p>
                 <div className="flex gap-1 absolute right-4 top-4">
                   <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: formData.accentColor }}></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-[#30363D]"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-[#30363D]"></div>
                 </div>
                 <div className="flex items-center gap-2 mb-4">
                   {formData.logoUrl && <img src={formData.logoUrl} className="h-6 object-contain" alt="Branding" />}
                   <div className="w-24 h-2 rounded-full bg-[#30363D]"></div>
                 </div>
                 <div className="w-full h-8 rounded border border-[#30363D] mb-2 px-2 flex items-center">
                   <div className="w-12 h-1 rounded-full" style={{ backgroundColor: formData.accentColor }}></div>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8">
            <h2 className="text-xs font-bold tracking-wider uppercase text-white mb-4 flex items-center gap-2">
              <Zap size={16} title="Deployment System" className="text-[#4493F8]" /> Terminal Deployment
            </h2>
            <p className="text-xs text-[#8B949E] mb-6 leading-relaxed">Launch the engine immediately or save as a blueprint for later execution.</p>
            
            <button 
              onClick={() => handleDeploy(false)} 
              disabled={isDeploying || isSavingDraft || !formData.name} 
              title="Launch Flow and Start Live Timer"
              className="w-full py-4 bg-[#4493F8] text-white rounded-md font-bold text-xs tracking-wider uppercase hover:bg-[#3178C6] transition-colors mb-3 shadow-[0_0_15px_rgba(68,147,248,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeploying ? <><Loader2 size={16} className="animate-spin" /> DEPLOYING...</> : `Launch Active Session`}
            </button>
            <button 
              onClick={() => handleDeploy(true)} 
              disabled={isDeploying || isSavingDraft || !formData.name} 
              title="Save Structure without Starting"
              className="w-full py-4 bg-transparent border border-[#30363D] text-[#8B949E] rounded-md font-bold text-xs tracking-wider uppercase hover:border-[#8B949E] hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSavingDraft ? <><Loader2 size={16} className="animate-spin" /> SAVING...</> : <><Save size={16} /> Save as Blueprint</>}
            </button>

            {generatedRoom && (
              <div ref={resultsRef} className="mt-8 pt-6 border-t border-[#30363D] animate-in slide-in-from-bottom-5 fade-in duration-500">
                <div className="flex items-center gap-2 mb-4 text-[#3FB950]">
                   <CheckCircle2 size={16} title="Success" />
                   <p className="text-xs font-bold tracking-wider uppercase">Engine Registered</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-[#8B949E] font-bold tracking-widest uppercase mb-1 flex justify-between">
                      Room Access <Copy size={12} title="Copy Room ID" className="cursor-pointer hover:text-white" onClick={() => copyToClipboard(generatedRoom.id)} />
                    </p>
                    <div className="bg-[#0D1117] border border-[#30363D] rounded px-3 py-2 text-xs font-mono text-white flex justify-between items-center">
                      <span className="truncate">/room/<span className="text-[#4493F8]">{generatedRoom.id}</span></span>
                    </div>
                  </div>
                </div>
                
                <Link href="/dashboard" className="block mt-6 text-center text-[10px] font-bold text-[#4493F8] uppercase tracking-widest hover:underline">Return to Command Center</Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

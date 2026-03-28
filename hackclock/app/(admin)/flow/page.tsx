"use client";

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Network, Plus, Trash2, Zap, Save, GripVertical, CheckCircle2, Copy, Image as ImageIcon } from 'lucide-react';

export default function FlowPage() {
  const { data: session, update } = useSession();
  const [isDeploying, setIsDeploying] = useState(false);
  const [generatedRoom, setGeneratedRoom] = useState<{ id: string, secret: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: 'GitCity Global Hackathon 2026',
    eventStartTime: '2026-10-15T09:00',
    eventEndTime: '2026-10-16T17:00',
    timezone: '(UTC+05:30) Indian Standard Time',
    accentColor: '#a2c9ff',
    logoUrl: '' 
  });

  const [phases, setPhases] = useState([
    { id: 1, name: 'Kickoff', durationMinutes: 45, autoTransition: true },
    { id: 2, name: 'Ideation', durationMinutes: 120, autoTransition: false },
    { id: 3, name: 'Build', durationMinutes: 1440, autoTransition: false },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { 
        alert("Image is too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const payload = {
        name: formData.name,
        organizerSecret: session?.user?.email,
        eventStartTime: formData.eventStartTime,
        eventEndTime: formData.eventEndTime,
        timezone: formData.timezone,
        branding: { accentColor: formData.accentColor, logoUrl: formData.logoUrl },
        phases: phases
      };
      
      const res = await fetch('http://localhost:5000/api/hackathons', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server rejected the payload. The image might still be too large, or the backend is offline.");
      }

      const data = await res.json();
      
      if (res.ok) {
        setGeneratedRoom({ id: data.roomId, secret: session?.user?.email || 'N/A' });
        await update({ activeRoomId: data.roomId });
      } else {
        alert(`Deployment failed: ${data.error}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`System Error: ${error.message}`);
    } finally {
      setIsDeploying(false);
    } 
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Flow Creation & Setup</h1>
        <p className="text-[#8B949E]">Engineer your hackathon's temporal architecture and visual identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Parameters & Sequencing */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#4493F8] mb-6 flex items-center gap-2">
              <Network size={16} /> Global Parameters
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Hackathon Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 px-4 text-white outline-none focus:border-[#4493F8] transition-colors text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <option>(UTC+05:30) Indian Standard Time</option>
                  <option>(UTC-08:00) Pacific Time (US & Canada)</option>
                  <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                  <option>(UTC+00:00) Greenwich Mean Time</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold tracking-wider uppercase text-[#4493F8] flex items-center gap-2">
                <Network size={16} /> Phase Sequencing
              </h2>
              <button onClick={() => setPhases([...phases, { id: Date.now(), name: 'New Phase', durationMinutes: 60, autoTransition: false }])} className="text-[#8B949E] hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase">
                <Plus size={14} /> Add Custom Phase
              </button>
            </div>

            <div className="space-y-4">
              {phases.map((phase, index) => (
                <div key={phase.id} className="flex items-center gap-4 bg-[#0D1117] border border-[#30363D] p-4 rounded-lg group">
                  <GripVertical size={16} className="text-[#30363D] cursor-grab" />
                  
                  <div className="flex-1">
                    <p className="text-[9px] text-[#8B949E] font-bold tracking-widest uppercase mb-1">Phase {String(index + 1).padStart(2, '0')}</p>
                    <input type="text" value={phase.name} onChange={(e) => setPhases(phases.map(p => p.id === phase.id ? { ...p, name: e.target.value } : p))} className="bg-transparent border-none text-white font-bold outline-none w-full" />
                  </div>

                  <div className="w-24">
                    <p className="text-[9px] text-[#8B949E] font-bold tracking-widest uppercase mb-1">Duration</p>
                    <div className="flex items-center gap-2">
                      <input type="number" value={phase.durationMinutes} onChange={(e) => setPhases(phases.map(p => p.id === phase.id ? { ...p, durationMinutes: parseInt(e.target.value)||0 } : p))} className="w-12 bg-[#161B22] border border-[#30363D] rounded px-2 py-1 text-white text-xs font-mono text-center outline-none" />
                      <span className="text-xs text-[#8B949E] font-mono">m</span>
                    </div>
                  </div>

                  <div className="w-32 flex flex-col items-end border-l border-[#30363D] pl-4">
                    <p className="text-[9px] text-[#8B949E] font-bold tracking-widest uppercase mb-2">Auto-Transition</p>
                    <button onClick={() => setPhases(phases.map(p => p.id === phase.id ? { ...p, autoTransition: !p.autoTransition } : p))} className={`w-8 h-4 rounded-full relative transition-colors ${phase.autoTransition ? 'bg-[#3FB950]' : 'bg-[#30363D]'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${phase.autoTransition ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                  
                  <button onClick={() => setPhases(phases.filter(p => p.id !== phase.id))} className="text-[#8B949E] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            
            <button onClick={() => setPhases([...phases, { id: Date.now(), name: 'New Phase', durationMinutes: 60, autoTransition: false }])} className="w-full mt-4 py-3 border border-dashed border-[#30363D] rounded-lg text-xs font-bold text-[#8B949E] tracking-wider uppercase hover:border-[#8B949E] hover:text-white transition-colors flex items-center justify-center gap-2">
              <Plus size={14} /> Insert Phase Here
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Branding & Deployment */}
        <div className="space-y-8">
          
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#3FB950] mb-6 flex items-center gap-2">
              <Network size={16} /> Custom Branding
            </h2>
            
            <div className="flex gap-6 mb-8">
              <div>
                <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Event Identity</label>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 bg-[#0D1117] border border-[#30363D] border-dashed rounded-lg flex flex-col items-center justify-center text-[#8B949E] cursor-pointer hover:border-[#8B949E] transition-colors overflow-hidden"
                >
                   {formData.logoUrl ? (
                     <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                   ) : (
                     <>
                      <ImageIcon size={20} className="mb-1" />
                      <p className="text-[9px] font-bold uppercase tracking-wider mt-1">Upload</p>
                     </>
                   )}
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Accent Color</label>
                <div className="flex gap-2 mb-3">
                  {/* NEW: Native Color Picker integrated with Hex Input */}
                  <div className="w-8 h-8 rounded overflow-hidden border border-[#30363D] relative shrink-0">
                    <input 
                      type="color" 
                      value={formData.accentColor} 
                      onChange={(e) => setFormData({...formData, accentColor: e.target.value})} 
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={formData.accentColor} 
                    onChange={(e) => setFormData({...formData, accentColor: e.target.value})} 
                    className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-md px-3 text-white font-mono text-xs outline-none focus:border-[#4493F8]" 
                    placeholder="#a2c9ff"
                  />
                </div>
                <div className="flex gap-2">
                  {['#a2c9ff', '#3FB950', '#ff7b72', '#d2a8ff'].map(color => (
                    <div key={color} onClick={() => setFormData({...formData, accentColor: color})} className="w-6 h-6 rounded cursor-pointer border border-[#30363D] hover:scale-110 transition-transform" style={{ backgroundColor: color }}></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 h-32 relative overflow-hidden">
               <p className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider mb-2">Live Preview</p>
               <div className="flex gap-1 absolute right-4 top-4">
                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: formData.accentColor }}></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-[#30363D]"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-[#30363D]"></div>
               </div>
               <div className="flex items-center gap-2 mb-4">
                 {formData.logoUrl && <img src={formData.logoUrl} className="h-6 object-contain" />}
                 <div className="w-24 h-2 rounded-full bg-[#30363D]"></div>
               </div>
               <div className="w-full h-8 rounded border border-[#30363D] mb-2 px-2 flex items-center">
                 <div className="w-12 h-1 rounded-full" style={{ backgroundColor: formData.accentColor }}></div>
               </div>
            </div>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8">
            <h2 className="text-xs font-bold tracking-wider uppercase text-white mb-4 flex items-center gap-2">
              <Zap size={16} className="text-[#4493F8]" /> Finalize Engine
            </h2>
            <p className="text-xs text-[#8B949E] mb-6 leading-relaxed">By deploying this flow, you are initializing the hackathon timeline. All participants with the room link will see the active phase and transitions in real-time.</p>
            
            <button onClick={handleDeploy} disabled={isDeploying} className="w-full py-4 bg-[#4493F8] text-white rounded-md font-bold text-sm tracking-wider uppercase hover:bg-[#3178C6] transition-colors mb-3 shadow-[0_0_15px_rgba(68,147,248,0.3)] disabled:opacity-50">
              {isDeploying ? "INITIALIZING..." : `DEPLOY FLOW`}
            </button>
            <button className="w-full py-4 bg-transparent border border-[#30363D] text-white rounded-md font-bold text-sm tracking-wider uppercase hover:bg-[#21262D] transition-colors flex items-center justify-center gap-2">
              <Save size={16} /> Save Draft Structure
            </button>

            {generatedRoom && (
              <div className="mt-8 pt-6 border-t border-[#30363D]">
                <div className="flex items-center gap-2 mb-4 text-[#3FB950]">
                   <CheckCircle2 size={16} />
                   <p className="text-xs font-bold tracking-wider uppercase">Engine Deployed Successfully</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-[#8B949E] font-bold tracking-widest uppercase mb-1 flex justify-between">
                      Participant Room <Copy size={12} className="cursor-pointer hover:text-white" onClick={() => copyToClipboard(`.../room/${generatedRoom.id}`)} />
                    </p>
                    <div className="bg-[#0D1117] border border-[#30363D] rounded px-3 py-2 text-xs font-mono text-white flex justify-between items-center">
                      <span>.../room/<span className="text-[#4493F8]">{generatedRoom.id}</span></span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8B949E] font-bold tracking-widest uppercase mb-1 flex justify-between">
                      Organizer Secret <Copy size={12} className="cursor-pointer hover:text-white" onClick={() => copyToClipboard(generatedRoom.secret)} />
                    </p>
                    <div className="bg-[#0D1117] border border-[#30363D] rounded px-3 py-2 text-xs font-mono text-[#3FB950] truncate">
                      {generatedRoom.secret}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
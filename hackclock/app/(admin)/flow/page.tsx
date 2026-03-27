"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Network, Plus, Trash2, TerminalSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function FlowPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [eventName, setEventName] = useState('');
  const [phases, setPhases] = useState([
    { id: 1, name: 'Registration & Setup', durationMinutes: 60, autoTransition: false },
    { id: 2, name: 'Core Hacking Phase', durationMinutes: 720, autoTransition: false },
  ]);
  const [isDeploying, setIsDeploying] = useState(false);

  const addPhase = () => {
    const newId = phases.length > 0 ? Math.max(...phases.map(p => p.id)) + 1 : 1;
    setPhases([...phases, { id: newId, name: 'New Phase', durationMinutes: 60, autoTransition: false }]);
  };

  const removePhase = (id: number) => {
    setPhases(phases.filter(p => p.id !== id));
  };

  const updatePhase = (id: number, field: string, value: string | number | boolean) => {
    setPhases(phases.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDeploy = async () => {
    if (!eventName.trim()) return alert("Event Name is required.");
    setIsDeploying(true);

    try {
      const payload = {
        name: eventName,
        organizerSecret: session?.user?.email || 'local_admin', // Used for socket auth later
        phases: phases
      };
      
      const res = await fetch('http://localhost:5000/api/hackathons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (res.ok && data.roomId) {
        router.push(`/room/${data.roomId}/clock`);
      } else {
        throw new Error(data.error || "Deployment failed");
      }
    } catch (error) {
      console.error("Failed to deploy:", error);
      alert("Deployment failed. Ensure backend is running.");
      setIsDeploying(false);
    } 
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Network className="text-[#4493F8]" /> Deploy Flow
        </h1>
        <p className="text-[#8B949E]">Architect your hackathon timeline and generate a secure Room ID for participants.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
          <h2 className="text-sm font-bold tracking-wider uppercase text-[#8B949E] mb-4 border-b border-[#30363D] pb-2">Global Parameters</h2>
          <div>
            <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Event Name</label>
            <input 
              type="text" 
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Winter Hackathon 2026"
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 px-4 text-white focus:outline-none focus:border-[#4493F8] transition-colors font-mono text-sm"
            />
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
          <div className="flex justify-between items-center border-b border-[#30363D] pb-2 mb-4">
            <h2 className="text-sm font-bold tracking-wider uppercase text-[#8B949E]">Timeline Architecture</h2>
            <button onClick={addPhase} className="text-[#4493F8] hover:text-[#3178C6] flex items-center gap-1 text-xs font-bold uppercase transition-colors">
              <Plus size={14} /> Add Phase
            </button>
          </div>

          <div className="space-y-3">
            {phases.map((phase, index) => (
              <div key={phase.id} className="flex items-center gap-4 bg-[#0D1117] border border-[#30363D] p-3 rounded-md group">
                <div className="text-[10px] font-mono text-[#8B949E] font-bold w-6 text-center">
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                <input 
                  type="text"
                  value={phase.name}
                  onChange={(e) => updatePhase(phase.id, 'name', e.target.value)}
                  className="flex-1 bg-transparent border-none text-white focus:outline-none font-mono text-sm"
                  placeholder="Phase Name"
                />

                <div className="flex items-center gap-2 border-l border-[#30363D] pl-4">
                  <input 
                    type="number"
                    value={phase.durationMinutes}
                    onChange={(e) => updatePhase(phase.id, 'durationMinutes', parseInt(e.target.value) || 0)}
                    className="w-20 bg-[#161B22] border border-[#30363D] rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-[#4493F8] font-mono text-center"
                  />
                  <span className="text-xs text-[#8B949E] font-bold uppercase tracking-wider">MIN</span>
                </div>

                <button 
                  onClick={() => removePhase(phase.id)}
                  className="text-[#8B949E] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all pl-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className="px-8 py-3 bg-[#3FB950] text-[#0D1117] rounded-md font-bold hover:bg-[#2EA043] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(63,185,80,0.2)]"
          >
            {isDeploying ? "INITIALIZING..." : (
              <>
                <TerminalSquare size={18} /> DEPLOY FLOW
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from 'react';
import { Plus, Trash2, Rocket, Copy, CheckCircle2 } from 'lucide-react';

export default function FlowPage() {
  const [name, setName] = useState("GitCity Global Hackathon 2026");
  const [accentColor, setAccentColor] = useState("#4493F8");
  const [phases, setPhases] = useState([
    { name: "Kickoff", durationMinutes: 45, autoTransition: true },
    { name: "Ideation", durationMinutes: 120, autoTransition: false }
  ]);
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedData, setDeployedData] = useState<any>(null);
  const [copied, setCopied] = useState("");

  const handleAddPhase = () => {
    setPhases([...phases, { name: "New Phase", durationMinutes: 60, autoTransition: false }]);
  };

  const handleRemovePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index));
  };

  const handlePhaseChange = (index: number, field: string, value: any) => {
    const newPhases = [...phases];
    newPhases[index] = { ...newPhases[index], [field]: value };
    setPhases(newPhases);
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const response = await fetch("http://localhost:5000/api/hackathons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phases,
          branding: { accentColor }
        })
      });
      
      const data = await response.json();
      setDeployedData(data);
    } catch (error) {
      console.error("Failed to deploy:", error);
      alert("Failed to connect to backend. Is your Node server running?");
    }
    setIsDeploying(false);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Flow Creation & Setup</h1>
        <p className="text-[#8B949E]">Engineer your hackathon's temporal architecture and visual identity for your club events.</p>
      </div>

      <div className="flex gap-6">
        {/* LEFT COLUMN: Form Inputs */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Global Parameters */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
            <h3 className="text-[#4493F8] text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-4 h-4 border-t-2 border-l-2 border-[#4493F8]"></span> Global Parameters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#8B949E] font-medium mb-1 uppercase tracking-wider">Hackathon Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded p-3 text-white focus:outline-none focus:border-[#4493F8] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Phase Sequencing */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[#4493F8] text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                <span className="w-4 h-4 border-t-2 border-l-2 border-[#4493F8]"></span> Phase Sequencing
              </h3>
              <button onClick={handleAddPhase} className="text-xs text-[#8B949E] hover:text-white flex items-center gap-1 transition-colors">
                <Plus size={14} /> ADD CUSTOM PHASE
              </button>
            </div>
            
            <div className="space-y-3">
              {phases.map((phase, index) => (
                <div key={index} className="flex items-center gap-4 bg-[#0D1117] border border-[#30363D] rounded p-4 group">
                  <div className="flex flex-col items-center justify-center gap-1 text-[#30363D]">
                     <div className="w-1 h-1 rounded-full bg-current"></div>
                     <div className="w-1 h-1 rounded-full bg-current"></div>
                     <div className="w-1 h-1 rounded-full bg-current"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-[#8B949E] font-bold tracking-wider uppercase mb-1">PHASE 0{index + 1}</p>
                    <input 
                      type="text" 
                      value={phase.name}
                      onChange={(e) => handlePhaseChange(index, "name", e.target.value)}
                      className="bg-transparent text-white font-bold focus:outline-none focus:border-b border-[#4493F8] w-full"
                    />
                  </div>
                  <div className="w-32">
                    <p className="text-[10px] text-[#8B949E] font-bold tracking-wider uppercase mb-1">DURATION (MIN)</p>
                    <input 
                      type="number" 
                      value={phase.durationMinutes}
                      onChange={(e) => handlePhaseChange(index, "durationMinutes", Number(e.target.value))}
                      className="w-full bg-[#161B22] border border-[#30363D] rounded p-1.5 text-white text-sm text-center focus:outline-none focus:border-[#4493F8]"
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-[10px] text-[#8B949E] font-bold tracking-wider uppercase mb-2">AUTO</p>
                    <input 
                      type="checkbox" 
                      checked={phase.autoTransition}
                      onChange={(e) => handlePhaseChange(index, "autoTransition", e.target.checked)}
                      className="accent-[#3FB950] w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <button onClick={() => handleRemovePhase(index)} className="text-[#30363D] hover:text-red-500 transition-colors ml-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <button onClick={handleAddPhase} className="w-full py-3 border border-dashed border-[#30363D] rounded text-[#8B949E] text-sm hover:text-white hover:border-[#8B949E] transition-all flex justify-center items-center gap-2 mt-4">
                <Plus size={16} /> INSERT PHASE HERE
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Actions */}
        <div className="w-80 flex flex-col gap-6">
          
          {/* Custom Branding */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
            <h3 className="text-[#3FB950] text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-4 h-4 border-t-2 border-l-2 border-[#3FB950]"></span> Custom Branding
            </h3>
            <div>
              <label className="block text-xs text-[#8B949E] font-medium mb-2 uppercase tracking-wider">Accent Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-white text-sm font-mono bg-[#0D1117] border border-[#30363D] px-3 py-1.5 rounded">{accentColor}</span>
              </div>
            </div>
          </div>

          {/* Finalize Engine */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
            <h3 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
              🚀 Finalize Engine
            </h3>
            <p className="text-xs text-[#8B949E] leading-relaxed mb-6">
              By deploying this flow, you are initializing the hackathon timeline. All participants with the room link will see the active phase.
            </p>
            
            {!deployedData ? (
              <button 
                onClick={handleDeploy} 
                disabled={isDeploying}
                className="w-full py-3 bg-[#4493F8] text-white rounded font-bold text-sm hover:bg-[#3178C6] transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isDeploying ? "DEPLOYING..." : "DEPLOY HACKATHON ⚡"}
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-3 bg-[#1B2E24] border border-[#2EA043] rounded text-center mb-4">
                  <span className="text-[#3FB950] text-sm font-bold flex justify-center items-center gap-2">
                    <CheckCircle2 size={16} /> DEPLOYMENT SUCCESS
                  </span>
                </div>
                
                <div>
                  <p className="text-[10px] text-[#8B949E] font-bold tracking-wider uppercase mb-1">Participant Room ID</p>
                  <div className="flex justify-between items-center bg-[#0D1117] border border-[#30363D] rounded p-2">
                    <span className="text-[#4493F8] font-mono font-bold">{deployedData.roomId}</span>
                    <button onClick={() => copyToClipboard(deployedData.roomId, "room")} className="text-[#8B949E] hover:text-white">
                      {copied === "room" ? <CheckCircle2 size={14} className="text-[#3FB950]"/> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-[#8B949E] font-bold tracking-wider uppercase mb-1">Organizer Secret (Keep Safe!)</p>
                  <div className="flex justify-between items-center bg-[#0D1117] border border-[#30363D] rounded p-2">
                    <span className="text-[#E6EDF3] font-mono text-xs truncate w-48 opacity-50 blur-[2px] hover:blur-none transition-all">{deployedData.organizerSecret}</span>
                    <button onClick={() => copyToClipboard(deployedData.organizerSecret, "secret")} className="text-[#8B949E] hover:text-white">
                      {copied === "secret" ? <CheckCircle2 size={14} className="text-[#3FB950]"/> : <Copy size={14} />}
                    </button>
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
"use client";

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useHackathon } from '@/hooks/useHackathon';

export default function DashboardPage() {
  // We are hardcoding the ID from your Postman test to see it work!
  const ROOM_ID = "AA3892"; 
  
  // 1. Our Socket.io hook for live timer updates
  const { isConnected, timerData, sendCommand } = useHackathon(ROOM_ID);
  
  // 2. State to hold the database data
  const [hackathon, setHackathon] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Fetch the data from your Node/Mongo backend when the page loads
  useEffect(() => {
    fetch(`http://localhost:5000/api/hackathons/${ROOM_ID}`)
      .then(async (res) => {
        // If the server didn't respond with a 200 OK, grab the real error text
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Backend Error ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then(data => {
        setHackathon(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to connect to backend:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // Show a loading screen
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="p-8 text-[#4493F8] font-mono animate-pulse text-xl">
          Establishing connection to database...
        </div>
      </div>
    );
  }

  // Show an error screen if the backend is unreachable
  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="p-8 bg-[#161B22] border border-red-500 rounded-lg text-red-500 font-mono text-center">
          <h2 className="text-xl font-bold mb-2">Database Connection Failed</h2>
          <p>{error}</p>
          <p className="text-[#8B949E] text-sm mt-4">Make sure your Node server is running on port 5000!</p>
        </div>
      </div>
    );
  }

  // Fallback if data is empty
  if (!hackathon) return null;

  return (
    <div className="max-w-6xl mx-auto flex gap-6 pb-12">
      
      {/* LEFT COLUMN */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Master Timer Panel */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-[#3FB950] text-sm font-bold tracking-widest uppercase">
              {hackathon.name} Timer
            </h3>
            <div className="flex items-center gap-4">
              {/* Live Socket Status Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#3FB950]' : 'bg-red-500'}`}></div>
                <span className="text-xs text-[#8B949E] uppercase">{isConnected ? 'Socket Live' : 'Disconnected'}</span>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-[#4493F8] text-white rounded font-medium text-sm hover:bg-[#3178C6] transition-colors">
                  ⏸ PAUSE
                </button>
                <button className="px-4 py-2 bg-[#21262D] border border-[#30363D] rounded text-white text-sm font-medium hover:bg-[#30363D] transition-colors">
                  ⏭ SKIP
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-4 mt-8">
            {/* If Socket is sending data, show it. Otherwise show static DB time */}
            <h1 className="text-8xl font-black text-white tracking-tighter">
              {timerData ? timerData.timeRemaining : "00:00:00"}
            </h1>
            <span className="text-[#8B949E] text-xl font-medium">
              {hackathon.status === 'PAUSED' ? 'Paused' : 'Remaining'}
            </span>
          </div>
        </div>

        {/* Broadcast Panel */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              📢 Broadcast Announcement
            </h3>
          </div>
          <textarea 
            className="w-full bg-[#0D1117] border border-[#30363D] rounded p-4 text-[#E6EDF3] h-24 mb-4 focus:outline-none focus:border-[#4493F8] resize-none"
            placeholder="Type a message to push to all participants screens..."
            defaultValue={hackathon.announcement}
          ></textarea>
          <div className="flex justify-end">
             <button className="px-6 py-2 bg-[#4493F8] text-white rounded font-medium text-sm hover:bg-[#3178C6] transition-colors">
                TRANSMIT NOW
              </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Dynamic Schedule */}
      <div className="w-80 bg-[#161B22] border border-[#30363D] rounded-lg p-6 h-fit">
        <h3 className="text-lg font-bold mb-6 text-white">Hack Flow Schedule</h3>
        
        {/* Map through the actual phases you created in Postman! */}
        {hackathon.phases.map((phase: any, index: number) => {
          const isCurrent = index === hackathon.currentPhaseIndex;
          
          return (
            <div key={phase._id} className="relative border-l-2 border-[#30363D] ml-3 pl-6 pb-8">
              <div className={`absolute w-4 h-4 bg-[#161B22] border-2 ${isCurrent ? 'border-[#4493F8]' : 'border-[#8B949E]'} rounded-full -left-[9px] top-0 flex items-center justify-center`}>
                 {isCurrent && <div className="w-1.5 h-1.5 bg-[#4493F8] rounded-full"></div>}
              </div>
              <p className={`text-[10px] font-bold tracking-wider mb-1 uppercase ${isCurrent ? 'text-[#4493F8]' : 'text-[#8B949E]'}`}>
                {phase.durationMinutes} MIN PHASE
              </p>
              <p className={`${isCurrent ? 'text-white' : 'text-[#8B949E]'} font-bold text-sm mb-1`}>
                {phase.name}
              </p>
            </div>
          )
        })}
      </div>

    </div>
  );
}
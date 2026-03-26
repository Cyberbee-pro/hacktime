"use client";

import { Download } from 'lucide-react';

export default function DashboardPage() {
  // 🔜 Next step: We will bring in our useHackathon hook here!
  // const { timerData, sendCommand } = useHackathon('AB12CD');

  return (
    <div className="max-w-6xl mx-auto flex gap-6 pb-12">
      
      {/* LEFT COLUMN: Timer, Broadcast, and Logs */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* 1. Master Timer Panel */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-[#3FB950] text-sm font-bold tracking-widest uppercase">Global Master Timer</h3>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-[#4493F8] text-white rounded font-medium text-sm hover:bg-[#3178C6] transition-colors">
                ⏸ PAUSE CLOCK
              </button>
              <button className="px-4 py-2 bg-[#21262D] border border-[#30363D] rounded text-white text-sm font-medium hover:bg-[#30363D] transition-colors">
                ⏭ SKIP PHASE
              </button>
              <button className="px-4 py-2 bg-[#21262D] border border-[#30363D] rounded text-white text-sm font-medium hover:bg-[#30363D] transition-colors">
                + +5 MIN
              </button>
            </div>
          </div>
          <div className="flex items-baseline gap-4 mt-8">
            {/* 🔜 We will replace this static text with our live database state */}
            <h1 className="text-8xl font-black text-white tracking-tighter">14:28:44</h1>
            <span className="text-[#8B949E] text-xl font-medium">Remaining</span>
          </div>
        </div>

        {/* 2. Broadcast Panel */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              📢 Broadcast Announcement
            </h3>
            <span className="text-[10px] font-bold tracking-wider bg-[#1F2937] text-[#8B949E] px-2 py-1 rounded border border-[#30363D]">LIVE SYNC ENABLED</span>
          </div>
          <textarea 
            className="w-full bg-[#0D1117] border border-[#30363D] rounded p-4 text-[#E6EDF3] h-24 mb-4 focus:outline-none focus:border-[#4493F8] resize-none"
            placeholder="Type a message to push to all participants screens..."
          ></textarea>
          <div className="flex justify-between items-center">
             <div className="flex gap-2">
                <span className="text-xs bg-[#21262D] text-[#8B949E] px-3 py-1.5 rounded cursor-pointer hover:text-white border border-[#30363D]">"Lunch is now served in the lobby"</span>
                <span className="text-xs bg-[#21262D] text-[#8B949E] px-3 py-1.5 rounded cursor-pointer hover:text-white border border-[#30363D]">"10 minutes until mentor check-in"</span>
             </div>
             <button className="px-6 py-2 bg-[#4493F8] text-white rounded font-medium text-sm hover:bg-[#3178C6] transition-colors">
                TRANSMIT NOW
              </button>
          </div>
        </div>

        {/* 3. Event Logs & Laps (Added this back in!) */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-[#30363D]">
            <h3 className="text-lg font-bold text-white">Event Logs & Laps</h3>
            <Download size={18} className="text-[#8B949E] cursor-pointer hover:text-white" />
          </div>
          <div className="flex flex-col">
            {[
              { time: "10:42:01", tag: "LAP 12", tagColor: "bg-[#1B2E24] text-[#3FB950]", text: "Hacking Phase Progress: 60% Milestone Reached", user: "Automated System" },
              { time: "10:35:12", tag: "MANUAL", tagColor: "bg-[#1F2937] text-[#4493F8]", text: "Pause action by Organizer @alex_dev", user: "Admin alex_dev" },
              { time: "10:00:00", tag: "LAP 11", tagColor: "bg-[#1B2E24] text-[#3FB950]", text: "Hacking Phase: Official Start", user: "System Scheduler" },
              { time: "09:45:00", tag: "PHASE", tagColor: "bg-[#21262D] text-[#8B949E]", text: "Opening Ceremony Concluded", user: "Manual Override" }
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-[#30363D] hover:bg-[#1F2937] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#8B949E] font-mono">{log.time}</span>
                  <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${log.tagColor}`}>{log.tag}</span>
                  <span className="text-sm text-[#E6EDF3]">{log.text}</span>
                </div>
                <span className="text-xs text-[#8B949E]">{log.user}</span>
              </div>
            ))}
          </div>
          <div className="p-3 text-center bg-[#0D1117] text-xs text-[#8B949E] hover:text-white cursor-pointer transition-colors">
            View All 142 System Events
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Full Schedule */}
      <div className="w-80 bg-[#161B22] border border-[#30363D] rounded-lg p-6 h-fit">
        <h3 className="text-lg font-bold mb-6 text-white">Hack Flow Schedule</h3>
        
        <div className="relative border-l-2 border-[#30363D] ml-3 pl-6 pb-8">
          <div className="absolute w-4 h-4 bg-[#161B22] border-2 border-[#8B949E] rounded-full -left-[9px] top-0 flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-[#8B949E] rounded-full"></div>
          </div>
          <p className="text-[10px] text-[#8B949E] font-bold tracking-wider mb-1 uppercase">09:00 AM — DONE</p>
          <p className="text-[#8B949E] font-bold text-sm mb-1">Check-in & Breakfast</p>
        </div>

        <div className="relative border-l-2 border-[#30363D] ml-3 pl-6 pb-8">
          <div className="absolute w-4 h-4 bg-[#161B22] border-2 border-[#4493F8] rounded-full -left-[9px] top-0 flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-[#4493F8] rounded-full"></div>
          </div>
          <p className="text-[10px] text-[#4493F8] font-bold tracking-wider mb-1 uppercase">10:00 AM — ONGOING</p>
          <p className="text-white font-bold text-sm mb-1">Hacking Phase Begins</p>
          <p className="text-xs text-[#8B949E] leading-relaxed">Teams start coding. Mentors available on Discord #help.</p>
        </div>

        <div className="relative border-l-2 border-[#30363D] ml-3 pl-6 pb-8">
          <div className="absolute w-4 h-4 bg-[#161B22] border-2 border-[#30363D] rounded-full -left-[9px] top-0"></div>
          <p className="text-[10px] text-[#8B949E] font-bold tracking-wider mb-1 uppercase">13:00 PM — 1 HR</p>
          <p className="text-white font-bold text-sm mb-2">Lunch Break</p>
          <span className="text-[10px] font-bold tracking-wider bg-[#1B2E24] text-[#3FB950] px-2 py-0.5 rounded border border-[#2EA043]">🍴 CATERED</span>
        </div>
        
        <div className="relative border-l-2 border-transparent ml-3 pl-6">
          <div className="absolute w-4 h-4 bg-[#161B22] border-2 border-[#30363D] rounded-full -left-[9px] top-0"></div>
          <p className="text-[10px] text-[#8B949E] font-bold tracking-wider mb-1 uppercase">18:00 PM</p>
          <p className="text-white font-bold text-sm mb-1">Lightning Talks</p>
          <p className="text-xs text-[#8B949E] leading-relaxed">Sponsor workshops & technical demos.</p>
        </div>
      </div>

    </div>
  );
}
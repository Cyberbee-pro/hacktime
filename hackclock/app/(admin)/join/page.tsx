"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hash, ArrowRight } from 'lucide-react';

export default function AdminJoinPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId.toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Join Active Session</h1>
        <p className="text-[#8B949E]">Enter a target Room ID to spectate or manage a live hackathon.</p>
      </div>

      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8 shadow-2xl">
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Target // Room ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hash size={20} className="text-[#8B949E]" />
              </div>
              <input 
                type="text" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="e.g. AA3892"
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg py-4 pl-12 pr-4 text-white placeholder-[#484F58] focus:outline-none focus:border-[#4493F8] transition-colors font-mono text-lg uppercase tracking-widest"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-[#4493F8] text-white rounded-lg font-bold hover:bg-[#3178C6] transition-colors flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(68,147,248,0.3)]"
          >
            Connect to Terminal <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
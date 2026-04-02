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
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#E6E6E6' }}>Join Active Session</h1>
        <p style={{ color: '#A0A0A0' }}>Enter a target Room ID to spectate or manage a live hackathon.</p>
      </div>

      <div className="rounded-[20px] p-8 shadow-2xl" style={{ backgroundColor: '#1C1C1C', border: '1px solid rgba(255,255,255,0.06)' }}>
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: '#A0A0A0' }}>Target // Room ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hash size={20} style={{ color: '#A0A0A0' }} />
              </div>
              <input 
                type="text" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="e.g. AA3892"
                className="w-full rounded-lg py-4 pl-12 pr-4 placeholder-[#6B7280] focus:outline-none transition-colors font-mono text-lg uppercase tracking-widest"
                style={{ backgroundColor: '#0F0F10', border: '1px solid rgba(255,255,255,0.06)', color: '#E6E6E6' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,46,154,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 rounded-lg font-bold transition-colors flex justify-center items-center gap-2"
            style={{ backgroundColor: '#CFFF04', color: '#0F0F10', boxShadow: '0 0 20px rgba(207,255,4,0.25)' }}
          >
            Connect to Terminal <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
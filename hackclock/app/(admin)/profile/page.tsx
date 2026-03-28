"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, CheckCircle2, Image as ImageIcon, Save, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { PRESET_AVATARS } from '@/lib/constants'; // NEW IMPORT HERE

export default function ProfilePage() {
  const { data: session, update } = useSession();
  
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

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
          email: session?.user?.email,
          name,
          profilePic: selectedAvatar
        })
      });

      if (!res.ok) throw new Error("Failed to update profile");

      await update({ name: name, image: selectedAvatar });

      setMessage({ text: "IDENTITY SYNCED. Session updated dynamically.", type: 'success' });
    } catch (err) {
      setMessage({ text: "SYSTEM ERROR: Could not sync with database.", type: 'error' });
    }
    
    setIsSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Organizer Identity</h1>
          <p className="text-[#8B949E]">Update your terminal session credentials and visual avatar.</p>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wider bg-[#2D1A1E] border border-red-900 px-4 py-2 rounded transition-colors"
        >
          <LogOut size={14} /> Terminate Session
        </button>
      </div>

      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-8">
        {message && (
          <div className={`mb-6 p-4 border rounded text-xs font-bold tracking-wider uppercase flex items-center gap-2 ${message.type === 'success' ? 'bg-[#1B2E24] border-[#2EA043] text-[#3FB950]' : 'bg-[#2D1A1E] border-red-900 text-red-500 animate-pulse'}`}>
             {message.type === 'success' && <CheckCircle2 size={16} />}
             {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-8">
          
          <div>
            <label className="block text-[10px] text-[#8B949E] font-bold mb-4 uppercase tracking-wider">Visual Avatar</label>
            <div className="flex gap-4">
              {PRESET_AVATARS.map((avatar, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-16 h-16 rounded-xl cursor-pointer flex items-center justify-center bg-[#21262D] overflow-hidden transition-all duration-200 border-2 ${
                    selectedAvatar === avatar 
                      ? 'border-[#4493F8] shadow-[0_0_15px_rgba(68,147,248,0.4)]' 
                      : 'border-[#30363D] hover:border-[#8B949E]'
                  }`}
                >
                  <img 
                    src={avatar} 
                    alt={`Preset ${index + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement?.classList.add('fallback-icon');
                    }}
                  />
                  <ImageIcon size={24} className="text-[#8B949E] absolute -z-10" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Organizer Name</label>
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} className="text-[#8B949E]" />
              </div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#4493F8] transition-colors font-mono text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Registered Email (Immutable)</label>
            <div className="max-w-md bg-[#0D1117] border border-[#30363D] rounded-md py-3 px-4 text-[#8B949E] font-mono text-sm opacity-50 cursor-not-allowed">
              {session?.user?.email}
            </div>
            <p className="mt-2 text-[10px] text-[#8B949E]">System primary keys cannot be altered post-initialization.</p>
          </div>

          <div className="pt-4 border-t border-[#30363D]">
            <button 
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-[#3FB950] text-[#0D1117] rounded-md font-bold text-sm hover:bg-[#2EA043] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} /> {isSaving ? "SYNCING..." : "SAVE CHANGES"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
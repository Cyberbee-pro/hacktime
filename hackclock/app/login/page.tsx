"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Clock, AtSign, Lock, LogIn, Users, Hash, UserPlus, ArrowRight, ShieldCheck, User, Image as ImageIcon } from 'lucide-react';
import { PRESET_AVATARS } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'LOG IN' | 'CREATE' | 'GUEST'>('LOG IN');

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  
  // Loading & Error States
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // --- GUEST FLOW ---
    if (activeTab === 'GUEST') {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hackathons/${roomId.toUpperCase()}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamName }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(`CONNECTION FAULT: ${data.error || 'Could not join room'}`);
          setIsLoading(false);
          return;
        }

        // Save local session to keep them connected
        localStorage.setItem('hackclock_guest', JSON.stringify({ 
          teamName, 
          roomId: roomId.toUpperCase(),
          joinedAt: new Date().toISOString()
        }));
        
        // Route directly to the clock UI
        router.push(`/room/${roomId.toUpperCase()}/clock`);
      } catch {
        setError('CONNECTION FAULT: Unable to reach server.');
      }
      setIsLoading(false);
      return;
    } 
    
    // --- CREATE ACCOUNT FLOW ---
    if (activeTab === 'CREATE') {
      if (password !== confirmPassword) {
        setError('SECURITY FAULT: Passkeys do not match.');
        setIsLoading(false);
        return;
      }
      if (password.length < 8) {
        setError('SECURITY FAULT: Passkey must be at least 8 characters.');
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, profilePic: selectedAvatar }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(`SECURITY FAULT: ${data.error || 'Registration failed'}`);
          setIsLoading(false);
          return;
        }

        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          setError('SECURITY FAULT: Login failed after registration.');
        } else {
          router.push('/dashboard');
        }
      } catch {
        setError('SECURITY FAULT: Unable to reach server.');
      }
      setIsLoading(false);
      return;
    }

    // --- LOG IN FLOW ---
    if (activeTab === 'LOG IN') {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('SECURITY FAULT: Invalid credentials.');
        setIsLoading(false);
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] text-white flex flex-col relative overflow-hidden">
      
      <div className="absolute left-4 top-32 text-[10px] text-[#A0A0A0]/50 tracking-[0.3em] uppercase rotate-180" style={{ writingMode: 'vertical-rl' }}>
        SYS_SECURE_AUTH_LAYER // ACTIVE
      </div>
      <div className="absolute right-4 bottom-32 text-[10px] text-[#A0A0A0]/50 tracking-[0.3em] uppercase" style={{ writingMode: 'vertical-rl' }}>
        ENCRYPTION_MODE // AES_256_GCM
      </div>

      <header className="h-16 flex justify-between items-center px-8 border-b border-[#30363D] bg-[#1C1C1C]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#5D00FF] flex items-center justify-center text-[#CFFF04] border border-[#30363D]">
             <Clock size={14} strokeWidth={3} />
          </div>
          <h2 className="text-lg font-bold tracking-tight uppercase">After-Dark Access</h2>
        </div>
        <div className="flex items-center gap-6 text-sm text-[#A0A0A0] font-medium">
          <span className="cursor-pointer hover:text-white transition">Docs</span>
          <span className="cursor-pointer hover:text-white transition">Support</span>
          <button className="bg-[#CFFF04] text-black px-4 py-1.5 rounded-md hover:brightness-95 transition font-semibold uppercase tracking-tight">
            Join Platform
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#5D00FF] flex items-center justify-center mb-4 border border-[#30363D]">
            <Clock size={24} className="text-[#CFFF04]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">HackClock</h1>
          <p className="text-[10px] text-[#A0A0A0] font-bold tracking-[0.2em] uppercase">Console Authentication Gateway</p>
        </div>

        <div className="w-full max-w-md bg-[#1C1C1C] border border-[#30363D] rounded-md overflow-hidden transition-all duration-300">
          
          {error && (
            <div className="bg-[#2D1021] border-b border-[#30363D] p-3 text-center">
               <p className="text-xs text-[#FF2E9A] font-bold tracking-wider uppercase animate-pulse">{error}</p>
            </div>
          )}

          <div className="flex border-b border-[#30363D] bg-[#232323]">
            {['LOG IN', 'CREATE', 'GUEST'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab as 'LOG IN' | 'CREATE' | 'GUEST');
                  setPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                className={`flex-1 py-4 text-xs font-bold tracking-wider uppercase transition-colors ${
                  activeTab === tab 
                    ? 'text-[#CFFF04] bg-[#1C1C1C] border-t-2 border-[#CFFF04]' 
                    : 'text-[#A0A0A0] border-t-2 border-transparent hover:bg-[#1C1C1C] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {activeTab === 'GUEST' && (
              <>
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <label className="block text-[10px] text-[#A0A0A0] font-bold mb-2 uppercase tracking-wider">Identity // Team Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users size={16} className="text-[#A0A0A0]" />
                    </div>
                    <input 
                      type="text" 
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. The Syntax Sorcerers"
                      className="w-full bg-[#232323] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white placeholder-[#A0A0A0]/50 focus:outline-none focus:border-[#5D00FF] transition-colors font-mono text-sm"
                      required={activeTab === 'GUEST'}
                    />
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <label className="block text-[10px] text-[#A0A0A0] font-bold mb-2 uppercase tracking-wider">Target // Room ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash size={16} className="text-[#A0A0A0]" />
                    </div>
                    <input 
                      type="text" 
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      maxLength={6}
                      placeholder="AA3892"
                      className="w-full bg-[#232323] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white placeholder-[#A0A0A0]/50 focus:outline-none focus:border-[#5D00FF] transition-colors font-mono text-sm uppercase tracking-widest"
                      required={activeTab === 'GUEST'}
                    />
                  </div>
                </div>
              </>
            )}

            {(activeTab === 'LOG IN' || activeTab === 'CREATE') && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                
                {activeTab === 'CREATE' && (
                  <>
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-[10px] text-[#A0A0A0] font-bold mb-3 uppercase tracking-wider">Identity // Avatar Selection</label>
                      <div className="flex gap-3 justify-between">
                        {PRESET_AVATARS.map((avatar, index) => (
                          <div 
                            key={index}
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`w-12 h-12 cursor-pointer flex items-center justify-center bg-[#232323] overflow-hidden transition-all duration-200 border ${
                              selectedAvatar === avatar 
                                ? 'border-[#CFFF04]' 
                                : 'border-[#30363D] hover:border-[#5D00FF]'
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
                            <ImageIcon size={20} className="text-[#A0A0A0] absolute -z-10" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-[10px] text-[#A0A0A0] font-bold mb-2 uppercase tracking-wider">Identity // Organizer Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-[#A0A0A0]" />
                        </div>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alex Chen"
                          className="w-full bg-[#232323] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white placeholder-[#A0A0A0]/50 focus:outline-none focus:border-[#5D00FF] transition-colors font-mono text-sm"
                          required={activeTab === 'CREATE'}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] text-[#A0A0A0] font-bold mb-2 uppercase tracking-wider">Identity // Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AtSign size={16} className="text-[#A0A0A0]" />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="architect@gitcity.noir"
                      className="w-full bg-[#232323] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white placeholder-[#A0A0A0]/50 focus:outline-none focus:border-[#5D00FF] transition-colors font-mono text-sm"
                      required={(activeTab as string) !== 'GUEST'}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider">Security // Passkey</label>
                    {activeTab === 'LOG IN' && (
                      <span className="text-[10px] text-[#CFFF04] font-bold uppercase tracking-wider cursor-pointer hover:underline">Forgot Password?</span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={16} className="text-[#A0A0A0]" />
                    </div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#232323] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white placeholder-[#A0A0A0]/50 focus:outline-none focus:border-[#5D00FF] transition-colors font-mono text-sm tracking-widest"
                      required={(activeTab as string) !== 'GUEST'}
                    />
                  </div>
                </div>

                {activeTab === 'CREATE' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] text-[#A0A0A0] font-bold mb-2 uppercase tracking-wider">Security // Confirm Passkey</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={16} className="text-[#A0A0A0]" />
                      </div>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#232323] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white placeholder-[#A0A0A0]/50 focus:outline-none focus:border-[#5D00FF] transition-colors font-mono text-sm tracking-widest"
                        required={activeTab === 'CREATE'}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 bg-[#CFFF04] text-black rounded-md font-bold text-sm hover:brightness-95 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 uppercase tracking-tight"
            >
              {isLoading ? "AUTHENTICATING..." : (
                <>
                  {activeTab === 'LOG IN' && <>Sign In <LogIn size={16} /></>}
                  {activeTab === 'CREATE' && <>Initialize Account <UserPlus size={16} /></>}
                  {activeTab === 'GUEST' && <>Join Session <ArrowRight size={16} /></>}
                </>
              )}
            </button>

            {activeTab !== 'GUEST' && (
              <>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-[#30363D]"></div>
                  <span className="flex-shrink-0 mx-4 text-[10px] text-[#A0A0A0] font-bold tracking-wider uppercase">Or Authenticate Via</span>
                  <div className="flex-grow border-t border-[#30363D]"></div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                    className="flex w-full items-center justify-center gap-2 py-3 bg-[#CFFF04] text-black rounded-md font-bold uppercase tracking-tight"
                  >
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                    className="flex w-full items-center justify-center gap-2 py-3 bg-transparent border border-[#5D00FF] text-white rounded-md font-bold uppercase tracking-tight hover:bg-[#5D00FF]/15 transition-colors"
                  >
                    Continue with GitHub
                  </button>
                </div>
              </>
            )}
          </form>

          {activeTab !== 'GUEST' && (
            <div className="bg-[#232323] border-t border-[#30363D] p-4 flex items-center justify-center gap-2 text-[10px] text-[#CFFF04] font-bold tracking-wider uppercase">
               <ShieldCheck size={14} /> End-to-end encrypted session keys active.
            </div>
          )}
        </div>

        <p className="mt-8 text-[10px] text-[#A0A0A0] font-mono tracking-widest uppercase">
          Running After-Dark Stable Build
        </p>
      </main>

    </div>
  );
}

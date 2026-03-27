"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Clock, AtSign, Lock, LogIn, Users, Hash, UserPlus, ArrowRight, ShieldCheck, User, Image as ImageIcon } from 'lucide-react';
import { PRESET_AVATARS } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('LOG IN');

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
      // Save local session to keep them connected
      localStorage.setItem('hackclock_guest', JSON.stringify({ 
        teamName, 
        roomId: roomId.toUpperCase(),
        joinedAt: new Date().toISOString()
      }));
      
      // Route directly to the clock UI
      router.push(`/room/${roomId.toUpperCase()}/clock`);
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
        const res = await fetch('http://localhost:5000/api/auth/register', {
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
      } catch (err) {
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
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] flex flex-col relative overflow-hidden">
      
      <div className="absolute left-4 top-32 text-[10px] text-[#30363D] tracking-[0.3em] uppercase rotate-180" style={{ writingMode: 'vertical-rl' }}>
        SYS_SECURE_AUTH_LAYER // ACTIVE
      </div>
      <div className="absolute right-4 bottom-32 text-[10px] text-[#30363D] tracking-[0.3em] uppercase" style={{ writingMode: 'vertical-rl' }}>
        ENCRYPTION_MODE // AES_256_GCM
      </div>

      <header className="h-16 flex justify-between items-center px-8 border-b border-[#30363D] bg-[#161B22]/50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#4493F8] rounded flex items-center justify-center text-[#0D1117]">
             <Clock size={14} strokeWidth={3} />
          </div>
          <h2 className="text-lg font-bold tracking-tight">GitCity Noir</h2>
        </div>
        <div className="flex items-center gap-6 text-sm text-[#8B949E] font-medium">
          <span className="cursor-pointer hover:text-white transition">Docs</span>
          <span className="cursor-pointer hover:text-white transition">Support</span>
          <button className="bg-[#4493F8] text-white px-4 py-1.5 rounded hover:bg-[#3178C6] transition font-semibold">
            Join Platform
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#21262D] rounded-xl flex items-center justify-center mb-4 border border-[#30363D] shadow-lg">
            <Clock size={24} className="text-[#4493F8]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">HackClock</h1>
          <p className="text-[10px] text-[#8B949E] font-bold tracking-[0.2em] uppercase">Terminal Session Authentication</p>
        </div>

        <div className="w-full max-w-md bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl overflow-hidden transition-all duration-300">
          
          {error && (
            <div className="bg-[#2D1A1E] border-b border-red-900 p-3 text-center">
               <p className="text-xs text-red-500 font-bold tracking-wider uppercase animate-pulse">{error}</p>
            </div>
          )}

          <div className="flex border-b border-[#30363D] bg-[#0D1117]">
            {['LOG IN', 'CREATE', 'GUEST'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                className={`flex-1 py-4 text-xs font-bold tracking-wider uppercase transition-colors ${
                  activeTab === tab 
                    ? 'text-[#4493F8] bg-[#161B22] border-t-2 border-[#4493F8]' 
                    : 'text-[#8B949E] border-t-2 border-transparent hover:bg-[#161B22]/50 hover:text-white'
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
                  <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Identity // Team Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users size={16} className="text-[#8B949E]" />
                    </div>
                    <input 
                      type="text" 
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. The Syntax Sorcerers"
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white placeholder-[#484F58] focus:outline-none focus:border-[#4493F8] transition-colors font-mono text-sm"
                      required={activeTab === 'GUEST'}
                    />
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Target // Room ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash size={16} className="text-[#8B949E]" />
                    </div>
                    <input 
                      type="text" 
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      maxLength={6}
                      placeholder="AA3892"
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white placeholder-[#484F58] focus:outline-none focus:border-[#4493F8] transition-colors font-mono text-sm uppercase tracking-widest"
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
                      <label className="block text-[10px] text-[#8B949E] font-bold mb-3 uppercase tracking-wider">Identity // Avatar Selection</label>
                      <div className="flex gap-3 justify-between">
                        {PRESET_AVATARS.map((avatar, index) => (
                          <div 
                            key={index}
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`w-12 h-12 rounded-lg cursor-pointer flex items-center justify-center bg-[#21262D] overflow-hidden transition-all duration-200 border-2 ${
                              selectedAvatar === avatar 
                                ? 'border-[#4493F8] shadow-[0_0_10px_rgba(68,147,248,0.3)]' 
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
                            <ImageIcon size={20} className="text-[#8B949E] absolute -z-10" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Identity // Organizer Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-[#8B949E]" />
                        </div>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alex Chen"
                          className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white placeholder-[#484F58] focus:outline-none focus:border-[#4493F8] transition-colors font-mono text-sm"
                          required={activeTab === 'CREATE'}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Identity // Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AtSign size={16} className="text-[#8B949E]" />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="architect@gitcity.noir"
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white placeholder-[#484F58] focus:outline-none focus:border-[#4493F8] transition-colors font-mono text-sm"
                      required={activeTab !== 'GUEST'}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] text-[#8B949E] font-bold uppercase tracking-wider">Security // Passkey</label>
                    {activeTab === 'LOG IN' && (
                      <span className="text-[10px] text-[#4493F8] font-bold uppercase tracking-wider cursor-pointer hover:underline">Forgot Password?</span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={16} className="text-[#8B949E]" />
                    </div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white placeholder-[#484F58] focus:outline-none focus:border-[#4493F8] transition-colors font-mono text-sm tracking-widest"
                      required={activeTab !== 'GUEST'}
                    />
                  </div>
                </div>

                {activeTab === 'CREATE' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] text-[#8B949E] font-bold mb-2 uppercase tracking-wider">Security // Confirm Passkey</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={16} className="text-[#8B949E]" />
                      </div>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0D1117] border border-[#30363D] rounded-md py-3 pl-10 pr-4 text-white placeholder-[#484F58] focus:outline-none focus:border-[#4493F8] transition-colors font-mono text-sm tracking-widest"
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
              className="w-full py-3 mt-4 bg-[#4493F8] text-white rounded-md font-bold text-sm hover:bg-[#3178C6] transition-colors flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(68,147,248,0.3)] disabled:opacity-50"
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
                  <span className="flex-shrink-0 mx-4 text-[10px] text-[#8B949E] font-bold tracking-wider uppercase">Or Authenticate Via</span>
                  <div className="flex-grow border-t border-[#30363D]"></div>
                </div>

                <div className="flex gap-4">
                  <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0D1117] border border-[#30363D] rounded-md hover:bg-[#21262D] transition-colors text-xs font-bold text-[#8B949E] hover:text-white uppercase tracking-wider">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path><path d="M12 18v4"></path></svg>
                    GitHub
                  </button>
                  <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0D1117] border border-[#30363D] rounded-md hover:bg-[#21262D] transition-colors text-xs font-bold text-[#8B949E] hover:text-white uppercase tracking-wider">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FC6D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 13.29-3.33-10a.42.42 0 0 0-.14-.18.38.38 0 0 0-.22-.11.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18L2 13.29a.74.74 0 0 0 .27.83L12 21l9.69-6.88a.71.71 0 0 0 .31-.83Z"></path></svg>
                    GitLab
                  </button>
                </div>
              </>
            )}
          </form>

          {activeTab !== 'GUEST' && (
            <div className="bg-[#0D1117] border-t border-[#30363D] p-4 flex items-center justify-center gap-2 text-[10px] text-[#3FB950] font-bold tracking-wider uppercase">
               <ShieldCheck size={14} /> End-to-end encrypted session keys active.
            </div>
          )}
        </div>

        <p className="mt-8 text-[10px] text-[#8B949E] font-mono tracking-widest uppercase">
          Running V2.4.0-NOIR Stable Build
        </p>
      </main>

    </div>
  );
}
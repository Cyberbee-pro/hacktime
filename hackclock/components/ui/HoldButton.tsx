"use client";

import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface HoldButtonProps {
  onComplete: () => void;
  icon: LucideIcon;
  label: string;
  holdTime?: number; // ms
  variant?: 'danger' | 'warning' | 'default';
  className?: string;
  iconSize?: number;
}

export default function HoldButton({ 
  onComplete, 
  icon: Icon, 
  label, 
  holdTime = 2000, 
  variant = 'default',
  className = "",
  iconSize = 16
}: HoldButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startHolding = () => {
    setIsHolding(true);
    startTimeRef.current = Date.now();
    setProgress(0);
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / holdTime) * 100, 100);
      setProgress(newProgress);
      
      if (elapsed >= holdTime) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsHolding(false);
        setProgress(0);
        onComplete();
      }
    }, 10);
  };

  const stopHolding = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const variantStyles = {
    danger: 'text-[#FF2E9A] border-[#30363D] bg-[#1C1C1C] hover:bg-[#2A1131]',
    warning: 'text-[#CFFF04] border-[#30363D] bg-[#1C1C1C] hover:bg-[#2C310D]',
    default: 'text-white border-[#30363D] bg-[#1C1C1C] hover:bg-[#2A1A56]'
  };

  const progressColors = {
    danger: 'bg-[#FF2E9A]',
    warning: 'bg-[#CFFF04]',
    default: 'bg-[#FF2E9A]'
  };

  return (
    <button
      onMouseDown={startHolding}
      onMouseUp={stopHolding}
      onMouseLeave={stopHolding}
      onTouchStart={startHolding}
      onTouchEnd={stopHolding}
      className={`relative overflow-hidden border rounded-sm p-2.5 transition-all active:scale-[0.97] group select-none uppercase tracking-tight ${variantStyles[variant]} ${className}`}
      title={`Hold to ${label}`}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Icon size={iconSize} className={isHolding ? 'animate-pulse' : ''} />
        {isHolding && <span className="text-[10px] font-bold uppercase tracking-widest animate-in fade-in duration-200">Release to Cancel</span>}
      </div>
      
      {/* Progress Overlay */}
      <div 
        className={`absolute bottom-0 left-0 h-full opacity-35 transition-all ease-linear ${progressColors[variant]}`}
        style={{ width: `${progress}%` }}
      />
      
      {/* Background fill for progress indicator */}
      {isHolding && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(90deg,transparent_0%,rgba(255,46,154,0.35)_50%,transparent_100%)] animate-pulse" />
      )}
    </button>
  );
}

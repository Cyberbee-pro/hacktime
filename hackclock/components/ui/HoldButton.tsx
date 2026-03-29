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
    danger: 'text-red-500 border-red-900/50 hover:bg-red-950/30',
    warning: 'text-yellow-500 border-yellow-900/50 hover:bg-yellow-950/30',
    default: 'text-[#8B949E] border-[#30363D] hover:bg-[#30363D]/30'
  };

  const progressColors = {
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    default: 'bg-[#4493F8]'
  };

  return (
    <button
      onMouseDown={startHolding}
      onMouseUp={stopHolding}
      onMouseLeave={stopHolding}
      onTouchStart={startHolding}
      onTouchEnd={stopHolding}
      className={`relative overflow-hidden border rounded-md p-2 transition-all active:scale-[0.97] group select-none ${variantStyles[variant]} ${className}`}
      title={`Hold to ${label}`}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Icon size={iconSize} className={isHolding ? 'animate-pulse' : ''} />
        {isHolding && <span className="text-[10px] font-bold uppercase tracking-widest animate-in fade-in duration-200">Release to Cancel</span>}
      </div>
      
      {/* Progress Overlay */}
      <div 
        className={`absolute bottom-0 left-0 h-full opacity-20 transition-all ease-linear ${progressColors[variant]}`}
        style={{ width: `${progress}%` }}
      />
      
      {/* Background fill for progress indicator */}
      {isHolding && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      )}
    </button>
  );
}

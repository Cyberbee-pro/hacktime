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

  const variantStyles: Record<string, React.CSSProperties> = {
    danger: { color: '#F43F5E', borderColor: 'rgba(244,63,94,0.2)' },
    warning: { color: '#F59E0B', borderColor: 'rgba(245,158,11,0.2)' },
    default: { color: '#A0A0A0', borderColor: 'rgba(255,255,255,0.06)' },
  };

  const progressColors: Record<string, string> = {
    danger: '#F43F5E',
    warning: '#F59E0B',
    default: '#FF2E9A',
  };

  return (
    <button
      onMouseDown={startHolding}
      onMouseUp={stopHolding}
      onMouseLeave={stopHolding}
      onTouchStart={startHolding}
      onTouchEnd={stopHolding}
      className={`relative overflow-hidden border rounded-[20px] p-2 transition-all active:scale-[0.97] group select-none ${className}`}
      style={variantStyles[variant]}
      title={`Hold to ${label}`}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Icon size={iconSize} className={isHolding ? 'animate-pulse' : ''} />
        {isHolding && <span className="text-[10px] font-bold uppercase tracking-widest animate-in fade-in duration-200">Release to Cancel</span>}
      </div>
      
      {/* Progress Overlay */}
      <div 
        className="absolute bottom-0 left-0 h-full opacity-20 transition-all ease-linear"
        style={{ width: `${progress}%`, backgroundColor: progressColors[variant] }}
      />
      
      {isHolding && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      )}
    </button>
  );
}

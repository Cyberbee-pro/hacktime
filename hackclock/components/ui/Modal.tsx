"use client";

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-[#111112]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-10 py-8">
          <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>
        
        <div className="px-10 pb-10">
          {children}
        </div>

        {footer && (
          <div className="px-10 py-8 bg-black/20 border-t border-white/5 flex justify-end gap-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

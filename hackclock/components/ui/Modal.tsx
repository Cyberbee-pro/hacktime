"use client";

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        ref={modalRef}
        className="w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out"
        style={{ 
          backgroundColor: 'rgba(28,28,28,0.95)', 
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '20px',
          boxShadow: '0 32px 128px rgba(0,0,0,0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-10 py-8">
          <h3 className="text-xl font-bold tracking-tight" style={{ color: '#E6E6E6' }}>{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full transition-all hover:text-white" style={{ color: '#6B7280' }}>
            <X size={20} />
          </button>
        </div>
        
        <div className="px-10 pb-10">
          {children}
        </div>

        {footer && (
          <div className="px-10 py-8 flex justify-end gap-4" style={{ backgroundColor: 'rgba(15,15,16,0.5)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

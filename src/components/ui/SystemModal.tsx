'use client';
import { type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
}

export function SystemModal({ open, onClose, title, children }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm bg-black/75 flex items-center justify-center animate-scan-in"
      onClick={onClose}
    >
      <div
        className="bracketed-4 bg-[#0c0c10]/95 border border-accent/60 shadow-glow-lg max-w-md w-[90%] font-body animate-scan-in"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <header className="border-b border-accent/25 px-6 py-3">
            <div className="text-[9px] tracking-system text-text-muted uppercase font-mono">[ SYSTEM PROMPT ]</div>
            <h2 className="text-accent text-glow font-display tracking-system uppercase text-base mt-1">
              {title}
            </h2>
          </header>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

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
      className="fixed inset-0 z-50 backdrop-blur-sm bg-black/70 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-bg border-glow p-6 max-w-md w-[90%] font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-accent text-glow uppercase tracking-widest mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

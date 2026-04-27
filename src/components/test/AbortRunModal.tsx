'use client';
import { useEffect } from 'react';
import { NeonButton } from '@/components/ui/NeonButton';

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  stats: {
    correct: number;
    wrong: number;
    bonus: number;
    answered: number;
    total: number;
  };
}

export function AbortRunModal({ open, onCancel, onConfirm, stats }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
      else if (e.key === 'Enter') onConfirm();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel, onConfirm]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const pct = stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="abort-title"
      className="fixed inset-0 z-[60] flex items-center justify-center px-4
                 bg-black/85 backdrop-blur-md
                 [background-image:radial-gradient(circle_at_center,rgba(255,0,92,0.18)_0%,transparent_60%)]
                 animate-scan-in"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md font-body bg-[#0c0808]/95
                   border border-danger/70
                   shadow-[0_0_0_1px_rgba(255,0,92,0.25),0_0_40px_-8px_rgba(255,0,92,0.55),0_24px_60px_-20px_rgba(255,0,92,0.5)]
                   animate-scan-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Caution-tape diagonal stripe — pure CSS */}
        <div
          aria-hidden
          className="absolute -top-[6px] left-0 right-0 h-[6px]
                     [background:repeating-linear-gradient(135deg,#FF005C_0_10px,#0c0808_10px_20px)]"
        />
        <div
          aria-hidden
          className="absolute -bottom-[6px] left-0 right-0 h-[6px]
                     [background:repeating-linear-gradient(135deg,#FF005C_0_10px,#0c0808_10px_20px)]
                     opacity-60"
        />

        {/* Corner brackets — danger-tinted */}
        <span aria-hidden className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-danger/90" />
        <span aria-hidden className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-danger/90" />
        <span aria-hidden className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-danger/90" />
        <span aria-hidden className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-danger/90" />

        {/* Header */}
        <header className="px-6 pt-5 pb-3 border-b border-danger/25 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full bg-danger shadow-[0_0_10px_#FF005C] animate-[caret-blink_0.9s_steps(2)_infinite]"
            />
            <span className="font-mono text-[9px] tracking-system text-danger/90 uppercase">
              [ ⚠ SYSTEM WARNING · 0xAB0RT ]
            </span>
          </div>
          <button
            onClick={onCancel}
            aria-label="Cancel"
            className="h-7 w-7 flex items-center justify-center text-text-muted hover:text-danger
                       border border-white/10 hover:border-danger/60 transition-colors
                       font-display text-sm"
          >
            ✕
          </button>
        </header>

        {/* Body */}
        <div className="px-6 py-6">
          <h2
            id="abort-title"
            className="font-display tracking-system uppercase text-danger text-[28px] leading-[1.05]
                       [text-shadow:0_0_14px_rgba(255,0,92,0.55),0_0_2px_rgba(255,0,92,0.9)]
                       animate-flicker"
          >
            Abort
            <br />
            Dungeon&nbsp;Run?
          </h2>

          <p className="mt-4 font-mono text-[11px] leading-relaxed text-text/90 tracking-wide">
            Прогрес сесії буде <span className="text-danger">стерто</span>. Дані забігу
            не зарахуються до історії та не дадуть XP.
          </p>

          {/* Loss readout */}
          <div className="mt-5 border-l-2 border-danger/60 pl-3">
            <div className="font-mono text-[9px] tracking-system text-danger/80 uppercase mb-2">
              ◢ DATA TO BE PURGED
            </div>
            <div className="grid grid-cols-3 gap-3">
              <LossStat label="CORRECT" value={stats.correct} />
              <LossStat label="WRONG" value={stats.wrong} />
              <LossStat label="BONUS" value={stats.bonus} />
            </div>
            <div className="mt-3 font-mono text-[10px] tracking-system text-text-muted uppercase tabular-nums flex items-baseline justify-between">
              <span>SESSION PROGRESS</span>
              <span className="text-danger">
                {stats.answered}<span className="text-text-subtle"> / {stats.total}</span>
                <span className="text-text-subtle"> · </span>
                {pct}%
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
            <NeonButton variant="dashed-danger" onClick={onConfirm} className="w-full">
              ✕&nbsp;&nbsp;CONFIRM ABORT
            </NeonButton>
            <NeonButton variant="ghost" onClick={onCancel}>
              ⎋&nbsp;CANCEL
            </NeonButton>
          </div>

          {/* Keyboard hints */}
          <div className="mt-4 font-mono text-[9px] tracking-system text-text-subtle uppercase flex items-center justify-center gap-3">
            <kbd className="px-1.5 py-0.5 border border-white/10 text-text-muted">ESC</kbd>
            <span>CANCEL</span>
            <span className="text-text-subtle/60">·</span>
            <kbd className="px-1.5 py-0.5 border border-danger/40 text-danger/90">ENTER</kbd>
            <span>CONFIRM</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LossStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-danger/20 px-2 py-1.5 bg-danger/[0.04]">
      <div className="font-mono text-[8px] tracking-system text-text-subtle uppercase">{label}</div>
      <div className="font-display tabular-nums text-danger text-[18px] leading-none mt-0.5">
        {value}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { sound } from '@/utils/sound';

interface StatsBarProps {
  masteredCount: number;
  inProgressCount: number;
  totalVerbs: number;
  onReset: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  masteredCount,
  inProgressCount,
  totalVerbs,
  onReset,
}) => {
  const [confirming, setConfirming] = useState(false);
  const percentage = totalVerbs > 0 ? Math.round((masteredCount / totalVerbs) * 100) : 0;
  const untouched = Math.max(0, totalVerbs - masteredCount - inProgressCount);

  return (
    <section className="shrink-0 short:hidden bg-dark-card/80 backdrop-blur-md border border-dark-border rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2 sm:gap-2.5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="hidden xs:flex w-8 h-8 rounded-lg bg-brand-emerald/15 border border-brand-emerald/30 items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="min-w-0">
            <span className="hidden sm:block text-[10px] font-semibold text-dark-muted uppercase tracking-wider">
              Umumiy natija
            </span>
            <span className="text-[13px] sm:text-sm font-bold text-white">
              <span className="tabular-nums">{masteredCount}</span> / {totalVerbs} fe&apos;l
              o&apos;zlashtirildi
              {/* The phone drops the legend row, so the in-progress count rides along here. */}
              {inProgressCount > 0 && (
                <span className="sm:hidden font-semibold text-brand-amber">
                  {' '}· {inProgressCount} jarayonda
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-xs font-bold text-brand-accent tabular-nums">
            {percentage}%
          </span>
          <button
            onClick={() => {
              sound.playClick();
              setConfirming(true);
            }}
            className="w-10 h-10 rounded-lg bg-white/5 border border-dark-border flex items-center justify-center text-dark-muted hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Natijani nolga qaytarish"
            title="Natijani nolga qaytarish"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="O'zlashtirilgan fe'llar ulushi"
      >
        <div
          className="h-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-emerald rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Splitting "in progress" from "not started" answers the question the
          single bar could not: what is left to do, and what is half-done. */}
      <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-dark-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-emerald" />
          O&apos;zlashtirildi <span className="text-white tabular-nums">{masteredCount}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-amber" />
          Jarayonda <span className="text-white tabular-nums">{inProgressCount}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/25" />
          Boshlanmagan <span className="text-white tabular-nums">{untouched}</span>
        </span>
      </div>

      {confirming && (
        <div className="flex items-center justify-between gap-2 bg-brand-rose/10 border border-brand-rose/30 rounded-xl p-2.5 animate-fadeIn">
          <p className="text-[11px] font-semibold text-white leading-snug">
            Barcha natija o&apos;chiriladi. Davom etasizmi?
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setConfirming(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={() => {
                setConfirming(false);
                onReset();
              }}
              className="px-3 py-1.5 rounded-lg bg-brand-rose text-white text-[11px] font-bold hover:bg-brand-rose/80 transition-colors"
            >
              O&apos;chirish
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

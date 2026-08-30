'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import { FORMS, FormKey, MASTERY_TARGET } from '@/constants/learning';
import { sound } from '@/utils/sound';

/** One V1/V2/V3 row: colour-coded label on the left, the form on the right. */
export const FormRow: React.FC<{ form: FormKey; value: string }> = ({ form, value }) => {
  const meta = FORMS[form];
  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border ${meta.bg} ${meta.border}`}>
      <span className="flex items-baseline gap-1.5 min-w-0">
        <span className={`text-xs font-bold ${meta.text}`}>{meta.short}</span>
        <span className="text-[10px] font-medium text-dark-muted truncate">{meta.grammar}</span>
      </span>
      <span className="font-heading font-bold text-lg sm:text-2xl text-white truncate">{value}</span>
    </div>
  );
};

/** Stacked column used when the card is too short for full-width rows. */
export const FormColumn: React.FC<{ form: FormKey; value: string }> = ({ form, value }) => {
  const meta = FORMS[form];
  return (
    <span
      className={`flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-xl border ${meta.bg} ${meta.border}`}
    >
      <span className={`text-[10px] font-bold ${meta.text}`}>{meta.short}</span>
      <span className="font-heading font-bold text-sm text-white text-center leading-tight break-words">
        {value}
      </span>
    </span>
  );
};

/** Progress towards mastery for a single verb: 0 to 5. */
export const MasteryDots: React.FC<{ count: number; showLabel?: boolean }> = ({
  count,
  showLabel = true,
}) => (
  <span
    className="inline-flex items-center gap-1.5"
    role="img"
    aria-label={`Mashq qilingan: ${count} / ${MASTERY_TARGET}`}
  >
    <span className="flex items-center gap-1">
      {Array.from({ length: MASTERY_TARGET }, (_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            i < count ? 'bg-brand-emerald' : 'bg-white/20'
          }`}
        />
      ))}
    </span>
    {showLabel && (
      <span className="text-[11px] font-semibold text-dark-muted tabular-nums">
        {count}/{MASTERY_TARGET}
      </span>
    )}
  </span>
);

/**
 * Every mode opens with the same two lines: what this screen is, and what it
 * asks you to do. Previously each mode had a different, unexplained header.
 */
export const ModeIntro: React.FC<{
  step: number | null;
  title: string;
  hint: string;
  children?: React.ReactNode;
}> = ({ step, title, hint, children }) => (
  <div className="flex items-start justify-between gap-3 px-0.5">
    <div className="min-w-0">
      <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
        {step !== null && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-brand-primary/20 border border-brand-primary/40 text-[11px] font-bold text-brand-accent shrink-0">
            {step}
          </span>
        )}
        {title}
      </h2>
      <p className="text-xs text-dark-muted font-medium mt-1 leading-relaxed short:hidden">{hint}</p>
    </div>
    {children}
  </div>
);

/** 44px touch target — the old 32px speak buttons were below the minimum. */
export const SpeakButton: React.FC<{ text: string; label?: string; tone?: 'primary' | 'muted' }> = ({
  text,
  label,
  tone = 'primary',
}) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      sound.speak(text);
    }}
    aria-label={label ?? `"${text}" talaffuzini tinglash`}
    title="Talaffuzni tinglash"
    className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors active:scale-95 ${
      tone === 'primary'
        ? 'bg-brand-primary/15 border-brand-primary/30 text-brand-accent hover:bg-brand-primary/25'
        : 'bg-white/5 border-dark-border text-dark-muted hover:text-white hover:bg-white/10'
    }`}
  >
    <Volume2 className="w-4 h-4" />
  </button>
);

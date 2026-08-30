'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Verb } from '@/types/verb';
import { CheckCircle2, XCircle, RotateCcw, Repeat } from 'lucide-react';
import { sound } from '@/utils/sound';
import { sample } from '@/utils/shuffle';
import { MODE_BY_ID, MASTERY_TARGET } from '@/constants/learning';
import { FormColumn, FormRow, MasteryDots, ModeIntro, SpeakButton } from './shared';

interface FlashcardModeProps {
  verbs: Verb[];
  masteryProgress: Record<number, number>;
  onAnswer: (verbId: number, correct: boolean) => void;
}

/** A round is a fixed batch, so the deck has an end and progress means something. */
const BATCH_SIZE = 20;
/** How far back a "hard" card is pushed before it comes round again. */
const REPEAT_GAP = 3;

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  verbs,
  masteryProgress,
  onAnswer,
}) => {
  const [queue, setQueue] = useState<Verb[]>([]);
  const [completed, setCompleted] = useState(0);
  const [repeats, setRepeats] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [drag, setDrag] = useState(0);

  // A swipe is usually followed by a synthetic click. Recording *when* the
  // swipe ended (rather than setting a flag that something else has to clear)
  // means a missing click can never leave taps permanently swallowed.
  const lastSwipeAt = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const startRound = useCallback(() => {
    setQueue(sample(verbs, BATCH_SIZE));
    setCompleted(0);
    setRepeats(0);
    setIsFlipped(false);
  }, [verbs]);

  useEffect(() => {
    startRound();
  }, [startRound]);

  const total = useMemo(() => Math.min(BATCH_SIZE, verbs.length), [verbs.length]);
  const currentVerb = queue[0];

  const handleFlip = useCallback(() => {
    sound.playFlip();
    setIsFlipped((prev) => !prev);
  }, []);

  const handleAnswer = useCallback(
    (known: boolean) => {
      const verb = queue[0];
      if (!verb) return;

      onAnswer(verb.id, known);
      setIsFlipped(false);

      if (known) {
        sound.playSuccess();
        // Answered correctly: it leaves the round.
        setQueue((prev) => prev.slice(1));
        setCompleted((prev) => prev + 1);
      } else {
        sound.playError();
        setRepeats((prev) => prev + 1);
        // Answered wrong: it comes back a few cards later instead of being
        // duplicated, so the deck can never grow without bound.
        setQueue((prev) => {
          const rest = prev.slice(1);
          const at = Math.min(REPEAT_GAP, rest.length);
          return [...rest.slice(0, at), prev[0], ...rest.slice(at)];
        });
      }
    },
    [queue, onAnswer]
  );

  const SWIPE_THRESHOLD = 64;

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    // Ignore mostly-vertical movement so the page can still be scrolled.
    if (Math.abs(dx) > Math.abs(dy)) setDrag(dx);
  };

  const onTouchEnd = () => {
    const dx = drag;
    touchStart.current = null;
    setDrag(0);
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    lastSwipeAt.current = Date.now();
    handleAnswer(dx > 0);
  };

  const handleCardClick = () => {
    // Swallow only the click that belongs to the swipe just finished.
    if (Date.now() - lastSwipeAt.current < 400) return;
    handleFlip();
  };

  // The card is the primary control here, so it has to work without a pointer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (!currentVerb) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer(true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleFlip, handleAnswer, currentVerb]);

  if (!currentVerb) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="bg-dark-card border border-brand-emerald/30 rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-card animate-popIn">
          <div className="w-14 h-14 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-brand-emerald" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-white">Bosqich tugadi</h2>
            <p className="text-xs text-dark-muted mt-1.5 leading-relaxed">
              {total} ta kartochkani ko&apos;rib chiqdingiz
              {repeats > 0 && `, shundan ${repeats} tasini qayta takrorladingiz`}.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              startRound();
            }}
            className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Yangi 20 ta fe&apos;l
          </button>
        </div>
      </div>
    );
  }

  const progressCount = masteryProgress[currentVerb.id] || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3 w-full h-full roomy:h-auto overflow-hidden roomy:overflow-visible">
      <ModeIntro step={1} title="Kartochka" hint={MODE_BY_ID.flashcards.hint} />

      {/* Round progress: how many of the batch are finished, and how many are
          waiting to come round again. */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-dark-muted tabular-nums">
            {completed} / {total} bajarildi
          </span>
          <span className="text-dark-muted tabular-nums">Navbatda: {queue.length}</span>
        </div>
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary rounded-full transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div
        className="perspective-1000 w-full flex-1 min-h-0 roomy:flex-none roomy:h-[380px] touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        style={
          drag
            ? {
                transform: `translateX(${drag}px) rotate(${drag / 30}deg)`,
                transition: 'none',
                opacity: Math.max(0.45, 1 - Math.abs(drag) / 420),
              }
            : { transition: 'transform 200ms ease-out, opacity 200ms ease-out' }
        }
      >
        <button
          type="button"
          onClick={handleCardClick}
          aria-label={
            isFlipped
              ? `${currentVerb.v1} shakllari ko'rsatilmoqda. Kartani teskari o'girish`
              : `${currentVerb.v1}. Shakllarini ko'rish uchun kartani o'giring`
          }
          className={`w-full h-full relative duration-500 transition-transform transform-style-3d text-left cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front: the prompt only — the verb and what it means. */}
          <span className="absolute inset-0 backface-hidden rounded-3xl bg-dark-card border border-brand-primary/30 p-3 sm:p-5 flex flex-col items-center justify-between text-center shadow-card overflow-hidden">
            <span className="w-full flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-dark-muted bg-white/5 px-2.5 py-1 rounded-full">
                Asosiy shakl
              </span>
              <MasteryDots count={progressCount} />
            </span>

            <span className="my-auto flex flex-col items-center gap-2">
              <span className="font-heading font-bold text-4xl compact:text-3xl xs:text-6xl sm:text-7xl text-white tracking-tight">
                {currentVerb.v1}
              </span>
              <span className="text-base compact:text-sm xs:text-xl font-semibold text-slate-300 text-center px-2">
                {currentVerb.uz}
              </span>
              {progressCount >= MASTERY_TARGET && (
                <span className="text-[11px] font-bold text-brand-emerald bg-brand-emerald/15 border border-brand-emerald/30 px-2.5 py-1 rounded-full">
                  O&apos;zlashtirildi
                </span>
              )}
            </span>

            <span className="text-[11px] text-dark-muted font-medium flex items-center gap-1.5 text-center">
              <Repeat className="w-3.5 h-3.5 shrink-0" />
              <span className="roomy:hidden">Bosing · chapga/o&apos;ngga suring</span>
              <span className="hidden roomy:inline">Kartani bosing</span>
            </span>
          </span>

          {/* Back: the answer — three forms, colour-coded, plus a real sentence. */}
          <span className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-b from-dark-card to-dark-bg border border-brand-accent/40 p-3 sm:p-5 flex flex-col justify-between shadow-card overflow-hidden">
            <span className="w-full flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-brand-accent bg-brand-accent/10 px-2.5 py-1 rounded-full">
                Uch shakli
              </span>
              <MasteryDots count={progressCount} />
            </span>

            {/* Short viewports get the three forms side by side instead of
                stacked, so nothing has to be clipped or scrolled. */}
            <span className="w-full flex flex-col gap-1.5 my-auto min-h-0 overflow-y-auto no-scrollbar">
              <span className="hidden compact:grid grid-cols-3 gap-1.5">
                <FormColumn form="v1" value={currentVerb.v1} />
                <FormColumn form="v2" value={currentVerb.v2} />
                <FormColumn form="v3" value={currentVerb.v3} />
              </span>
              <span className="compact:hidden flex flex-col gap-1.5">
                <FormRow form="v1" value={currentVerb.v1} />
                <FormRow form="v2" value={currentVerb.v2} />
                <FormRow form="v3" value={currentVerb.v3} />
              </span>
              <span className="text-sm sm:text-base font-semibold text-slate-300 mt-0.5 text-center">
                {currentVerb.uz}
              </span>
              {/* Kept whole: the sentence was truncated mid-word before. */}
              <span className="hidden xs:block compact:hidden text-[11px] text-dark-muted italic bg-black/30 px-3 py-2 rounded-lg leading-relaxed text-center">
                &ldquo;{currentVerb.example}&rdquo;
              </span>
            </span>
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <SpeakButton
          text={isFlipped ? `${currentVerb.v1}, ${currentVerb.v2}, ${currentVerb.v3}` : currentVerb.v1}
          label={`${currentVerb.v1} talaffuzini tinglash`}
        />
        <button
          onClick={() => handleAnswer(false)}
          className="flex-1 py-3 px-3 rounded-xl border border-brand-rose/40 bg-brand-rose/15 hover:bg-brand-rose/25 text-brand-rose font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-95 min-h-[44px]"
        >
          <XCircle className="w-4 h-4" />
          Qiyin
        </button>
        <button
          onClick={() => handleAnswer(true)}
          className="flex-1 py-3 px-3 rounded-xl border border-brand-emerald/40 bg-brand-emerald/15 hover:bg-brand-emerald/25 text-brand-emerald font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-95 min-h-[44px]"
        >
          <CheckCircle2 className="w-4 h-4" />
          Bilaman
        </button>
      </div>

      <p className="hidden roomy:block text-[11px] text-dark-muted text-center">
        Klaviatura: <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">Space</kbd> o&apos;girish ·{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">←</kbd> qiyin ·{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">→</kbd> bilaman
      </p>
    </div>
  );
};

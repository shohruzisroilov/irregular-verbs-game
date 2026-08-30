'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Verb } from '@/types/verb';
import { sound } from '@/utils/sound';
import { Sparkles, Eye, SkipForward, RotateCcw, CheckCircle2 } from 'lucide-react';
import { sample } from '@/utils/shuffle';
import { FORMS, MODE_BY_ID } from '@/constants/learning';
import { ModeIntro, SpeakButton } from './shared';

interface TypingModeProps {
  verbs: Verb[];
  onAnswer: (verbId: number, correct: boolean) => void;
}

const ROUND_SIZE = 10;
type FieldState = 'idle' | 'correct' | 'wrong';

/** "was/were" counts as answered if the learner types either variant. */
function isFormCorrect(expected: string, typed: string) {
  const answer = typed.trim().toLowerCase();
  if (!answer) return false;
  return expected
    .toLowerCase()
    .split('/')
    .map((part) => part.trim())
    .includes(answer);
}

export const TypingMode: React.FC<TypingModeProps> = ({ verbs, onAnswer }) => {
  const [round, setRound] = useState<Verb[]>([]);
  const [index, setIndex] = useState(0);
  const [v2Input, setV2Input] = useState('');
  const [v3Input, setV3Input] = useState('');
  const [v2State, setV2State] = useState<FieldState>('idle');
  const [v3State, setV3State] = useState<FieldState>('idle');
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const handleFieldFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    window.setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  };

  const v2Ref = useRef<HTMLInputElement>(null);
  const v3Ref = useRef<HTMLInputElement>(null);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRound = useCallback(() => {
    setRound(sample(verbs, ROUND_SIZE));
    setIndex(0);
    setCorrectCount(0);
    setIsDone(false);
  }, [verbs]);

  useEffect(() => {
    startRound();
  }, [startRound]);

  useEffect(() => () => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
  }, []);

  const currentVerb = round[index];

  const resetFields = useCallback(() => {
    setV2Input('');
    setV3Input('');
    setV2State('idle');
    setV3State('idle');
    setRevealed(false);
  }, []);

  useEffect(() => {
    resetFields();
  }, [index, resetFields]);

  const goNext = useCallback(() => {
    if (index + 1 >= round.length) {
      setIsDone(true);
    } else {
      setIndex((prev) => prev + 1);
    }
  }, [index, round.length]);

  const handleCheck = () => {
    if (!currentVerb || revealed) return;

    const v2Ok = isFormCorrect(currentVerb.v2, v2Input);
    const v3Ok = isFormCorrect(currentVerb.v3, v3Input);

    // Each field reports its own result, so a half-right answer is visible.
    setV2State(v2Ok ? 'correct' : 'wrong');
    setV3State(v3Ok ? 'correct' : 'wrong');

    if (v2Ok && v3Ok) {
      sound.playSuccess();
      onAnswer(currentVerb.id, true);
      setCorrectCount((prev) => prev + 1);
      advanceRef.current = setTimeout(goNext, 800);
    } else {
      sound.playError();
      if (!v2Ok) v2Ref.current?.focus();
      else v3Ref.current?.focus();
    }
  };

  const handleReveal = () => {
    if (!currentVerb) return;
    sound.playClick();
    onAnswer(currentVerb.id, false);
    setRevealed(true);
    setV2State('idle');
    setV3State('idle');
  };

  const handleSkip = () => {
    sound.playClick();
    goNext();
  };

  const fieldClass = (state: FieldState) =>
    `w-full bg-black/40 border rounded-xl px-3.5 py-2.5 sm:py-3 text-white font-heading text-lg font-semibold outline-none transition-colors ${
      state === 'correct'
        ? 'border-brand-emerald bg-brand-emerald/10'
        : state === 'wrong'
        ? 'border-brand-rose bg-brand-rose/10'
        : 'border-dark-border focus:border-brand-primary'
    }`;

  if (isDone) {
    const percent = round.length ? Math.round((correctCount / round.length) * 100) : 0;
    return (
      <div className="flex flex-col gap-3 w-full">
        <ModeIntro step={3} title="Yozish" hint={MODE_BY_ID.typing.hint} />
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-card animate-popIn">
          <div className="w-14 h-14 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-brand-emerald" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-white">Bosqich tugadi</h3>
            <p className="text-xs text-dark-muted mt-1.5">
              {round.length} tadan{' '}
              <span className="text-brand-emerald font-bold">{correctCount}</span> tasini birinchi
              urinishda to&apos;g&apos;ri yozdingiz ({percent}%).
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
            Yangi 10 ta fe&apos;l
          </button>
        </div>
      </div>
    );
  }

  if (!currentVerb) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      <ModeIntro step={3} title="Yozish" hint={MODE_BY_ID.typing.hint} />

      <div className="bg-dark-card border border-dark-border rounded-3xl p-3.5 sm:p-6 flex flex-col gap-3 sm:gap-4 shadow-card w-full">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-dark-muted">
            <span className="tabular-nums">
              {index + 1} / {round.length}
            </span>
            <span className="tabular-nums">
              To&apos;g&apos;ri: <span className="text-brand-emerald">{correctCount}</span>
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary rounded-full transition-[width] duration-300"
              style={{ width: `${((index + 1) / round.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="text-center">
            <h3 className="font-heading font-bold text-3xl sm:text-5xl text-white tracking-tight">
              {currentVerb.v1}
            </h3>
            <p className="text-sm sm:text-base text-slate-300 font-semibold mt-0.5">{currentVerb.uz}</p>
          </div>
          <SpeakButton text={currentVerb.v1} />
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-3">
          <div>
            <label
              htmlFor="typing-v2"
              className="text-xs font-semibold uppercase tracking-wider block mb-1"
            >
              <span className={FORMS.v2.text}>{FORMS.v2.short}</span>{' '}
              <span className="text-dark-muted normal-case tracking-normal">
                {FORMS.v2.grammar}
              </span>
            </label>
            <input
              id="typing-v2"
              ref={v2Ref}
              type="text"
              value={revealed ? currentVerb.v2 : v2Input}
              onChange={(e) => {
                setV2Input(e.target.value);
                if (v2State !== 'idle') setV2State('idle');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  v3Ref.current?.focus();
                }
              }}
              onFocus={handleFieldFocus}
              readOnly={revealed}
              autoCapitalize="none"
              enterKeyHint="next"
              placeholder="masalan: spoke"
              autoComplete="off"
              spellCheck="false"
              aria-invalid={v2State === 'wrong'}
              aria-describedby={v2State === 'wrong' ? 'typing-v2-error' : undefined}
              className={fieldClass(revealed ? 'idle' : v2State)}
            />
            {v2State === 'wrong' && !revealed && (
              <p id="typing-v2-error" className="text-[11px] font-semibold text-brand-rose mt-1.5">
                Bu V2 shakli emas. Qaytadan urinib ko&apos;ring.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="typing-v3"
              className="text-xs font-semibold uppercase tracking-wider block mb-1"
            >
              <span className={FORMS.v3.text}>{FORMS.v3.short}</span>{' '}
              <span className="text-dark-muted normal-case tracking-normal">
                {FORMS.v3.grammar}
              </span>
            </label>
            <input
              id="typing-v3"
              ref={v3Ref}
              type="text"
              value={revealed ? currentVerb.v3 : v3Input}
              onChange={(e) => {
                setV3Input(e.target.value);
                if (v3State !== 'idle') setV3State('idle');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCheck();
                }
              }}
              onFocus={handleFieldFocus}
              readOnly={revealed}
              autoCapitalize="none"
              enterKeyHint="done"
              placeholder="masalan: spoken"
              autoComplete="off"
              spellCheck="false"
              aria-invalid={v3State === 'wrong'}
              aria-describedby={v3State === 'wrong' ? 'typing-v3-error' : undefined}
              className={fieldClass(revealed ? 'idle' : v3State)}
            />
            {v3State === 'wrong' && !revealed && (
              <p id="typing-v3-error" className="text-[11px] font-semibold text-brand-rose mt-1.5">
                Bu V3 shakli emas. Qaytadan urinib ko&apos;ring.
              </p>
            )}
          </div>
        </div>

        {revealed && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center animate-fadeIn">
            <p className="text-[11px] text-dark-muted italic leading-relaxed">
              &ldquo;{currentVerb.example}&rdquo;
            </p>
          </div>
        )}

        {revealed ? (
          <button
            onClick={goNext}
            className="w-full py-3 sm:py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-98 min-h-[44px]"
          >
            Keyingisi
          </button>
        ) : (
          <button
            onClick={handleCheck}
            className="w-full py-3 sm:py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-98 min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            Javobni tekshirish
          </button>
        )}

        {/* A dead end is the fastest way to lose someone: there is always a way
            to see the answer or move on. */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReveal}
            disabled={revealed}
            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-dark-border text-dark-muted hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 min-h-[44px]"
          >
            <Eye className="w-3.5 h-3.5" />
            Javobni ko&apos;rish
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-dark-border text-dark-muted hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
          >
            <SkipForward className="w-3.5 h-3.5" />
            O&apos;tkazib yuborish
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Verb } from '@/types/verb';
import { sound, triggerConfetti } from '@/utils/sound';
import { Timer, Zap, Play, RotateCcw, Trophy } from 'lucide-react';
import { shuffle, pickOne } from '@/utils/shuffle';
import { readJSON, writeJSON } from '@/utils/storage';
import { FORMS, MODE_BY_ID } from '@/constants/learning';
import { ModeIntro } from './shared';

interface SpeedModeProps {
  verbs: Verb[];
  onAnswer: (verbId: number, correct: boolean) => void;
  /** Lets the page clear away everything but the game while the clock runs. */
  onFocusChange?: (focused: boolean) => void;
}

interface SpeedQuestion {
  verbId: number;
  targetWord: string;
  asks: 'v2' | 'v3';
  correctAnswer: string;
  options: string[];
}

const ROUND_SECONDS = 60;
const FEEDBACK_MS = 320;
const BEST_SCORE_KEY = 'verb_speed_best';

export const SpeedMode: React.FC<SpeedModeProps> = ({ verbs, onAnswer, onFocusChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [answered, setAnswered] = useState({ correct: 0, wrong: 0 });
  const [bestScore, setBestScore] = useState(0);
  const [question, setQuestion] = useState<SpeedQuestion | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const lockedRef = useRef(false);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);

  useEffect(() => {
    const stored = readJSON<number>(BEST_SCORE_KEY, 0);
    bestRef.current = stored;
    setBestScore(stored);
  }, []);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    onFocusChange?.(isPlaying);
  }, [isPlaying, onFocusChange]);

  useEffect(() => () => onFocusChange?.(false), [onFocusChange]);

  useEffect(() => () => {
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
  }, []);

  const generateQuestion = useCallback(() => {
    const verb = pickOne(verbs);
    const asks: 'v2' | 'v3' = Math.random() > 0.5 ? 'v2' : 'v3';
    const correctAnswer = asks === 'v2' ? verb.v2 : verb.v3;

    const optionsSet = new Set<string>([correctAnswer]);
    // Bounded: an unlucky run of duplicates used to be able to spin forever.
    for (let guard = 0; optionsSet.size < 4 && guard < 60; guard++) {
      const other = pickOne(verbs);
      const candidate = asks === 'v2' ? other.v2 : other.v3;
      if (candidate && candidate !== correctAnswer) optionsSet.add(candidate);
    }

    setQuestion({
      verbId: verb.id,
      targetWord: verb.v1,
      asks,
      correctAnswer,
      options: shuffle([...optionsSet]),
    });
    setPicked(null);
  }, [verbs]);

  const startGame = () => {
    sound.playClick();
    setScore(0);
    setCombo(1);
    setAnswered({ correct: 0, wrong: 0 });
    setTimeLeft(ROUND_SECONDS);
    setHasPlayed(true);
    lockedRef.current = false;
    generateQuestion();
    setIsPlaying(true);
  };

  // The interval depends on `isPlaying` alone. It used to also depend on
  // `score`, so every correct answer tore down and recreated the timer and the
  // countdown lost most of a second each time.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Ending the round is a separate effect: firing it from inside a state
  // updater ran it twice under React strict mode.
  useEffect(() => {
    if (!isPlaying || timeLeft > 0) return;
    setIsPlaying(false);
    sound.playFanfare();

    const finalScore = scoreRef.current;
    if (finalScore > bestRef.current) {
      bestRef.current = finalScore;
      setBestScore(finalScore);
      writeJSON(BEST_SCORE_KEY, finalScore);
      triggerConfetti();
    }
  }, [timeLeft, isPlaying]);

  const handleSelectOption = (opt: string) => {
    if (!isPlaying || !question || lockedRef.current) return;

    lockedRef.current = true;
    setPicked(opt);

    const isCorrect = opt === question.correctAnswer;
    if (isCorrect) {
      sound.playSuccess();
      setScore((prev) => prev + 10 * combo);
      setCombo((prev) => Math.min(5, prev + 1));
      setAnswered((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      sound.playError();
      setCombo(1);
      setAnswered((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    }
    onAnswer(question.verbId, isCorrect);

    // A brief flash so the learner sees which answer was right.
    feedbackRef.current = setTimeout(() => {
      lockedRef.current = false;
      generateQuestion();
    }, FEEDBACK_MS);
  };

  const totalAnswered = answered.correct + answered.wrong;
  const accuracy = totalAnswered ? Math.round((answered.correct / totalAnswered) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 w-full">
      {!isPlaying && <ModeIntro step={4} title="Tezlik" hint={MODE_BY_ID.speed.hint} />}

      <div className="bg-dark-card border border-dark-border rounded-2xl p-3 flex items-center justify-between shadow-card shrink-0">
        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 ${timeLeft <= 10 && isPlaying ? 'text-brand-rose' : 'text-brand-amber'}`} />
          <span
            className={`font-heading font-bold text-xl tabular-nums ${
              timeLeft <= 10 && isPlaying ? 'text-brand-rose' : 'text-brand-amber'
            }`}
          >
            {timeLeft}s
          </span>
        </div>

        <div
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
            combo > 1
              ? 'bg-brand-rose/20 border-brand-rose/50 text-white'
              : 'bg-white/5 border-white/10 text-dark-muted'
          }`}
        >
          {combo > 1 ? `${combo}× ketma-ket` : 'Ketma-ket javob bering'}
        </div>

        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-emerald" />
          <span className="font-heading font-bold text-xl text-brand-emerald tabular-nums">
            {score}
          </span>
        </div>
      </div>

      {!isPlaying ? (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-5 shadow-card animate-popIn">
          <div className="w-14 h-14 rounded-2xl bg-brand-amber/15 border border-brand-amber/30 flex items-center justify-center text-brand-amber">
            {hasPlayed ? <Trophy className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
          </div>

          {hasPlayed ? (
            <>
              <div>
                <h3 className="font-heading font-bold text-xl text-white">Vaqt tugadi</h3>
                <p className="text-xs text-dark-muted mt-1.5">
                  {score === bestScore && score > 0
                    ? 'Yangi rekord!'
                    : `Eng yaxshi natijangiz: ${bestScore}`}
                </p>
              </div>
              <div className="w-full grid grid-cols-3 gap-2">
                {[
                  { label: 'Ochko', value: score, tone: 'text-brand-emerald' },
                  { label: 'Javob', value: totalAnswered, tone: 'text-white' },
                  { label: 'Aniqlik', value: `${accuracy}%`, tone: 'text-brand-accent' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/5 border border-white/10 rounded-xl py-3 flex flex-col items-center gap-0.5"
                  >
                    <span className={`font-heading font-bold text-lg tabular-nums ${stat.tone}`}>
                      {stat.value}
                    </span>
                    <span className="text-[10px] font-semibold text-dark-muted uppercase tracking-wide">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div>
              <h3 className="font-heading font-bold text-xl text-white">Tezlik sinovi</h3>
              <p className="text-xs text-dark-muted mt-1.5 max-w-xs leading-relaxed">
                60 soniya. Har bir to&apos;g&apos;ri javob 10 ochko; ketma-ket javoblar
                ko&apos;paytirgichni 5 barobargacha oshiradi.
              </p>
            </div>
          )}

          <button
            onClick={startGame}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-amber to-brand-rose text-white font-bold text-base flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-glow min-h-[44px]"
          >
            {hasPlayed ? <RotateCcw className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            {hasPlayed ? "Qayta o'ynash" : "Boshlash"}
          </button>
        </div>
      ) : (
        question && (
          <div className="bg-dark-card border border-dark-border rounded-3xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 shadow-card">
            <div className="text-center py-1 sm:py-2">
              <h3 className="font-heading font-bold text-4xl sm:text-5xl text-white tracking-tight">
                {question.targetWord}
              </h3>
              <p className="text-sm font-semibold mt-2">
                <span className={FORMS[question.asks].text}>{FORMS[question.asks].short}</span>
                <span className="text-dark-muted"> — {FORMS[question.asks].grammar} shakli qaysi?</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {question.options.map((opt) => {
                const isCorrect = opt === question.correctAnswer;
                const isPicked = picked === opt;

                let style = 'bg-white/5 border-dark-border text-white hover:bg-white/10';
                if (picked !== null) {
                  if (isCorrect) style = 'bg-brand-emerald/20 border-brand-emerald text-brand-emerald';
                  else if (isPicked) style = 'bg-brand-rose/20 border-brand-rose text-brand-rose';
                  else style = 'bg-white/5 border-dark-border text-dark-muted opacity-50';
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 rounded-2xl border font-heading text-lg sm:text-xl font-bold transition-colors active:scale-95 text-center min-h-[56px] ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
};

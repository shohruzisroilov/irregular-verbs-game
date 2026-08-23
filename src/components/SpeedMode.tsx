'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Verb } from '@/types/verb';
import { sound, triggerConfetti } from '@/utils/sound';
import { Timer, Zap, Play } from 'lucide-react';

interface SpeedModeProps {
  verbs: Verb[];
  onComplete: (score: number) => void;
}

interface SpeedQuizQuestion {
  targetWord: string;
  subtext: string;
  correctAnswer: string;
  options: string[];
}

export const SpeedMode: React.FC<SpeedModeProps> = ({ verbs, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [question, setQuestion] = useState<SpeedQuizQuestion | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateQuestion = useCallback(() => {
    const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
    const isV2 = Math.random() > 0.5;
    const targetWord = randomVerb.v1;
    const correctAnswer = isV2 ? randomVerb.v2 : randomVerb.v3;
    const subtext = isV2 ? "Which form is V2 (Past Simple)?" : "Which form is V3 (Past Participle)?";

    const optionsSet = new Set<string>([correctAnswer]);
    while (optionsSet.size < 4) {
      const randOther = verbs[Math.floor(Math.random() * verbs.length)];
      const candidate = isV2 ? randOther.v2 : randOther.v3;
      if (candidate && candidate !== correctAnswer) {
        optionsSet.add(candidate);
      }
    }

    const options = Array.from(optionsSet).sort(() => 0.5 - Math.random());

    setQuestion({
      targetWord,
      subtext,
      correctAnswer,
      options
    });
  }, [verbs]);

  const startGame = () => {
    sound.playClick();
    setIsPlaying(true);
    setTimeLeft(60);
    setScore(0);
    setCombo(1);
    generateQuestion();
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            sound.playFanfare();
            triggerConfetti();
            onComplete(score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, score, onComplete]);

  const handleSelectOption = (opt: string) => {
    if (!isPlaying || !question) return;

    if (opt === question.correctAnswer) {
      sound.playSuccess();
      const points = 10 * combo;
      setScore((prev) => prev + points);
      setCombo((prev) => Math.min(5, prev + 1));
    } else {
      sound.playError();
      setCombo(1);
    }

    generateQuestion();
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-brand-amber/20 via-brand-purple/20 to-brand-rose/20 border border-brand-amber/30 rounded-2xl p-4 flex items-center justify-between shadow-card">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-brand-amber animate-pulse" />
          <span className="font-heading font-extrabold text-2xl text-brand-amber">
            {timeLeft}s
          </span>
        </div>

        <div className="bg-brand-rose/30 border border-brand-rose/50 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-glow">
          {combo}x Combo
        </div>

        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-emerald" />
          <span className="font-heading font-extrabold text-2xl text-brand-emerald">
            {score}
          </span>
        </div>
      </div>

      {!isPlaying ? (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-5 shadow-card">
          <div className="w-16 h-16 rounded-full bg-brand-amber/15 border border-brand-amber/30 flex items-center justify-center text-brand-amber">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-2xl text-white">
              Speed Sprint Review
            </h2>
            <p className="text-xs text-dark-muted mt-1.5 max-w-xs leading-relaxed">
              Answer as many verb forms as possible in 60 seconds. Continuous correct answers boost your combo multiplier!
            </p>
          </div>
          <button
            onClick={startGame}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-amber to-brand-rose text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-glow"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Game</span>
          </button>
        </div>
      ) : (
        question && (
          <div className="bg-dark-card border border-dark-border rounded-3xl p-6 flex flex-col gap-6 shadow-card">
            <div className="text-center py-4">
              <h2 className="font-heading font-extrabold text-4xl text-white tracking-tight">
                {question.targetWord}
              </h2>
              <p className="text-xs text-dark-muted font-medium mt-1">
                {question.subtext}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  className="p-4 rounded-2xl bg-white/5 border border-dark-border hover:bg-white/10 hover:border-white/20 text-white font-sans text-base font-bold transition-all active:scale-95 text-center"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

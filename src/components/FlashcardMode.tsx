'use client';

import React, { useState } from 'react';
import { Verb } from '@/types/verb';
import { Volume2, CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';
import { sound } from '@/utils/sound';

interface FlashcardModeProps {
  verbs: Verb[];
  masteryProgress: Record<number, number>;
  onKnow: (verbId: number) => void;
  onDontKnow: (verbId: number) => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  verbs,
  masteryProgress,
  onKnow,
  onDontKnow,
}) => {
  const [deck, setDeck] = useState<Verb[]>(verbs);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentVerb = deck[currentIndex] || deck[0] || verbs[0];
  const progressCount = masteryProgress[currentVerb.id] || 0; // 0 to 5

  const handleFlip = () => {
    sound.playFlip();
    setIsFlipped(!isFlipped);
  };

  const handleNext = (known: boolean) => {
    if (known) {
      sound.playSuccess();
      onKnow(currentVerb.id);

      setIsFlipped(false);
      setCurrentIndex((prev) => (prev + 1) % deck.length);
    } else {
      sound.playError();
      onDontKnow(currentVerb.id);

      // Leitner Queue Re-insertion: Insert the hard verb 3 cards ahead
      const nextDeck = [...deck];
      const insertIndex = Math.min(currentIndex + 3, nextDeck.length);
      nextDeck.splice(insertIndex, 0, currentVerb);
      setDeck(nextDeck);

      setIsFlipped(false);
      setCurrentIndex((prev) => (prev + 1) % nextDeck.length);
    }
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    sound.speak(text);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 3D Flip Card Container */}
      <div className="perspective-1000 w-full h-[370px] cursor-pointer" onClick={handleFlip}>
        <div
          className={`w-full h-full relative duration-500 transition-all transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front */}
          <div className="absolute inset-0 backface-hidden rounded-3xl bg-dark-card border border-brand-primary/30 backdrop-blur-xl p-5 flex flex-col items-center justify-between text-center shadow-card hover:border-brand-primary/60 transition-all">
            {/* Header inside Card */}
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-dark-muted bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {currentIndex + 1} / {deck.length}
              </span>

              {/* Minimal 5-Dot & Score Badge */}
              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2.5 py-1 rounded-full">
                <Award className={`w-3.5 h-3.5 ${progressCount === 5 ? 'text-brand-emerald animate-bounce' : 'text-brand-amber'}`} />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-all ${
                        step <= progressCount
                          ? 'bg-brand-emerald shadow-glow'
                          : 'bg-white/15'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-extrabold text-white ml-0.5">
                  {progressCount}/5
                </span>
              </div>

              <button
                onClick={(e) => handleSpeak(e, currentVerb.v1)}
                className="w-9 h-9 rounded-full bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-all active:scale-90"
                title="Listen pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto flex flex-col items-center gap-2">
              <h2 className="font-heading font-extrabold text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-brand-primary tracking-tight">
                {currentVerb.v1}
              </h2>
              {progressCount === 5 && (
                <span className="text-[11px] font-extrabold text-brand-emerald bg-brand-emerald/15 border border-brand-emerald/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
                  ✓ Fully Mastered
                </span>
              )}
            </div>

            <p className="text-xs text-dark-muted font-medium flex items-center gap-1.5 animate-pulse">
              <RotateCcw className="w-3.5 h-3.5" />
              Tap card to flip
            </p>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-b from-dark-card to-dark-bg border border-brand-accent/40 backdrop-blur-xl p-5 flex flex-col items-center justify-between text-center shadow-card">
            {/* Header inside Card Back */}
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-brand-accent bg-brand-accent/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                All Forms
              </span>

              {/* Minimal 5-Dot & Score Badge */}
              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2.5 py-1 rounded-full">
                <Award className={`w-3.5 h-3.5 ${progressCount === 5 ? 'text-brand-emerald' : 'text-brand-amber'}`} />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-all ${
                        step <= progressCount
                          ? 'bg-brand-emerald shadow-glow'
                          : 'bg-white/15'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-extrabold text-white ml-0.5">
                  {progressCount}/5
                </span>
              </div>

              <button
                onClick={(e) => handleSpeak(e, `${currentVerb.v1}, ${currentVerb.v2}, ${currentVerb.v3}`)}
                className="w-9 h-9 rounded-full bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent hover:bg-brand-accent hover:text-white transition-all active:scale-90"
                title="Listen all forms"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full flex flex-col gap-2 my-auto">
              <div className="flex items-center justify-between bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-brand-accent">V1 (Infinitive):</span>
                <span className="font-heading font-bold text-base text-white">{currentVerb.v1}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-brand-accent">V2 (Past Simple):</span>
                <span className="font-heading font-bold text-base text-white">{currentVerb.v2}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-brand-accent">V3 (Past Participle):</span>
                <span className="font-heading font-bold text-base text-white">{currentVerb.v3}</span>
              </div>

              <div className="text-base font-extrabold text-brand-amber mt-0.5">
                {currentVerb.uz}
              </div>
              <p className="text-xs text-dark-muted italic bg-black/30 px-3 py-1.5 rounded-lg">
                "{currentVerb.example}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <button
          onClick={() => handleNext(false)}
          className="py-3.5 px-4 rounded-xl border border-brand-rose/40 bg-brand-rose/15 hover:bg-brand-rose/25 text-brand-rose font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <XCircle className="w-5 h-5" />
          <span>Hard (Repeat)</span>
        </button>

        <button
          onClick={() => handleNext(true)}
          className="py-3.5 px-4 rounded-xl border border-brand-emerald/40 bg-brand-emerald/15 hover:bg-brand-emerald/25 text-brand-emerald font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Got It (Mastered)</span>
        </button>
      </div>
    </div>
  );
};

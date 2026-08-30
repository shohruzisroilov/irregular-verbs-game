'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Zap, BookOpen, ArrowLeft, Target } from 'lucide-react';
import { sound } from '@/utils/sound';

interface HeaderProps {
  isDictionaryOpen: boolean;
  onToggleDictionary: () => void;
  latestTestScore: number | null;
  onOpenTestResult: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDictionaryOpen,
  onToggleDictionary,
  latestTestScore,
  onOpenTestResult,
}) => {
  const [soundOn, setSoundOn] = useState(true);

  // Read the stored preference after mount so the server and client markup match.
  React.useEffect(() => {
    setSoundOn(sound.isEnabled());
  }, []);

  const handleSoundToggle = () => {
    const newState = sound.toggleSound();
    setSoundOn(newState);
    if (newState) sound.playClick();
  };

  return (
    <header className="shrink-0 flex items-center justify-between bg-dark-card/90 backdrop-blur-md border border-dark-border px-3 py-2.5 short:py-1.5 rounded-2xl shadow-card gap-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shadow-glow shrink-0">
          <Zap className="w-[18px] h-[18px] text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="font-heading font-bold text-sm text-white tracking-tight leading-tight truncate">
            Noto&apos;g&apos;ri fe&apos;llar
          </h1>
          <p className="text-[11px] text-dark-muted font-medium leading-tight short:hidden">
            5 bosqichli mashq
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {latestTestScore !== null && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenTestResult();
            }}
            className="flex items-center gap-1.5 bg-brand-emerald/15 border border-brand-emerald/40 hover:bg-brand-emerald/25 px-2.5 h-11 rounded-xl transition-colors active:scale-95"
            aria-label={`So'nggi test natijasi ${latestTestScore} foiz. Batafsil ko'rish`}
          >
            <Target className="w-4 h-4 text-brand-emerald" />
            <span className="text-xs font-bold text-brand-emerald tabular-nums">
              {latestTestScore}%
            </span>
          </button>
        )}

        {/* Doubles as the way back: the dictionary is not a step, so there is no
            other predictable exit from it. */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleDictionary();
          }}
          aria-pressed={isDictionaryOpen}
          className={`flex items-center gap-1.5 px-3 h-11 rounded-xl border transition-colors active:scale-95 ${
            isDictionaryOpen
              ? 'bg-brand-primary text-white border-brand-primary'
              : 'bg-white/5 hover:bg-white/10 border-dark-border text-white'
          }`}
        >
          {isDictionaryOpen ? (
            <ArrowLeft className="w-4 h-4" />
          ) : (
            <BookOpen className="w-4 h-4 text-brand-accent" />
          )}
          <span className="text-xs font-bold">{isDictionaryOpen ? 'Ortga' : 'Jadval'}</span>
        </button>

        <button
          onClick={handleSoundToggle}
          className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-dark-border flex items-center justify-center transition-colors active:scale-95 shrink-0"
          aria-pressed={soundOn}
          aria-label={soundOn ? "Ovozni o'chirish" : 'Ovozni yoqish'}
        >
          {soundOn ? (
            <Volume2 className="w-4 h-4 text-brand-accent" />
          ) : (
            <VolumeX className="w-4 h-4 text-dark-muted" />
          )}
        </button>
      </div>
    </header>
  );
};

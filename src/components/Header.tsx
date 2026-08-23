'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Zap, BookOpen, Target } from 'lucide-react';
import { sound } from '@/utils/sound';

interface HeaderProps {
  onOpenDictionary?: () => void;
  latestTestScore?: number | null;
  onOpenTestResult?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDictionary,
  latestTestScore,
  onOpenTestResult,
}) => {
  const [soundOn, setSoundOn] = useState(sound.isEnabled());

  const handleSoundToggle = () => {
    const newState = sound.toggleSound();
    setSoundOn(newState);
    if (newState) sound.playClick();
  };

  return (
    <header className="flex items-center justify-between bg-dark-card/90 backdrop-blur-md border border-dark-border px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-card gap-2">
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shadow-glow shrink-0">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-sm sm:text-base text-white tracking-tight leading-none">
            Irregular Verbs
          </h1>
          <p className="text-[10px] sm:text-[11px] text-dark-muted font-medium mt-0.5 flex items-center gap-1">
            <span>5-Step App</span>
            <span className="text-dark-muted/60">•</span>
            <span>by</span>
            <a
              href="https://www.shohruzisroilov.uz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent hover:underline font-bold transition-all"
            >
              Shohruz Isroilov
            </a>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Latest Test Result Badge */}
        {latestTestScore !== undefined && latestTestScore !== null && (
          <button
            onClick={() => {
              sound.playClick();
              if (onOpenTestResult) onOpenTestResult();
            }}
            className="flex items-center gap-1.5 bg-brand-emerald/15 border border-brand-emerald/40 hover:bg-brand-emerald/25 px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
            title="Latest test score"
          >
            <Target className="w-4 h-4 text-brand-emerald" />
            <span className="text-xs font-extrabold text-brand-emerald">
              {latestTestScore}%
            </span>
          </button>
        )}

        {/* Dictionary Table Page Button */}
        {onOpenDictionary && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenDictionary();
            }}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-dark-border px-3 py-2 rounded-xl text-white transition-all active:scale-95"
            title="Full verbs table"
          >
            <BookOpen className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-bold hidden sm:inline">Table</span>
          </button>
        )}

        {/* Audio Mute/Unmute Button */}
        <button
          onClick={handleSoundToggle}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-dark-border flex items-center justify-center text-dark-text transition-all active:scale-95 shrink-0"
          title="Toggle sound"
          aria-label="Sound toggle"
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

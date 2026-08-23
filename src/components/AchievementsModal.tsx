'use client';

import React from 'react';
import { Trophy, Flame, Gem, BookCheck, X } from 'lucide-react';
import { sound } from '@/utils/sound';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
  level: number;
  streak: number;
  masteredCount: number;
  totalVerbs: number;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  xp,
  level,
  streak,
  masteredCount,
  totalVerbs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-dark-bg border border-brand-primary/40 rounded-3xl p-6 max-w-sm w-full flex flex-col items-center text-center gap-5 shadow-glow relative">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-dark-border flex items-center justify-center text-dark-muted hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-amber to-brand-purple flex items-center justify-center text-white shadow-glow mt-2">
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">
            Achievements & Stats
          </h2>
          <p className="text-xs text-dark-muted mt-1">
            Your irregular verbs mastery progress
          </p>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <div className="flex items-center justify-between bg-dark-card border border-dark-border px-4 py-3 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Gem className="w-5 h-5 text-brand-accent" />
              <span className="text-xs font-bold text-dark-muted">Total Experience (XP)</span>
            </div>
            <span className="font-heading font-extrabold text-base text-white">{xp} XP</span>
          </div>

          <div className="flex items-center justify-between bg-dark-card border border-dark-border px-4 py-3 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-brand-primary" />
              <span className="text-xs font-bold text-dark-muted">Level</span>
            </div>
            <span className="font-heading font-extrabold text-base text-brand-primary">Level {level}</span>
          </div>

          <div className="flex items-center justify-between bg-dark-card border border-dark-border px-4 py-3 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-brand-amber" />
              <span className="text-xs font-bold text-dark-muted">Streak</span>
            </div>
            <span className="font-heading font-extrabold text-base text-brand-amber">{streak} days</span>
          </div>

          <div className="flex items-center justify-between bg-dark-card border border-dark-border px-4 py-3 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <BookCheck className="w-5 h-5 text-brand-emerald" />
              <span className="text-xs font-bold text-dark-muted">Mastered Verbs</span>
            </div>
            <span className="font-heading font-extrabold text-base text-brand-emerald">
              {masteredCount} / {totalVerbs}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primaryDark text-white font-bold text-sm shadow-glow"
        >
          Got It
        </button>
      </div>
    </div>
  );
};

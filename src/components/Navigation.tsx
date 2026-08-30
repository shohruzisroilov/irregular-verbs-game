'use client';

import React from 'react';
import { TabType } from '@/types/verb';
import { Layers, Target, Edit3, Grid, Zap } from 'lucide-react';
import { MODES } from '@/constants/learning';
import { sound } from '@/utils/sound';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const ICONS: Partial<Record<TabType, React.ReactNode>> = {
  flashcards: <Layers className="w-4 h-4 shrink-0" />,
  matching: <Grid className="w-4 h-4 shrink-0" />,
  typing: <Edit3 className="w-4 h-4 shrink-0" />,
  speed: <Zap className="w-4 h-4 shrink-0" />,
  quiz: <Target className="w-4 h-4 shrink-0" />,
};

// The dictionary is reference material, not a practice step, so it lives in the
// header instead — this keeps the bar at five items with wide targets.
const STEPS = MODES.filter((mode) => mode.step !== null);

/** Desktop and tablet: a labelled step rail inside the page flow. */
export const StepRail: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => (
  <nav
    aria-label="Mashq bosqichlari"
    className="hidden sm:flex bg-dark-card/90 backdrop-blur-md border border-dark-border p-1.5 short:p-1 rounded-2xl gap-1 w-full shrink-0"
  >
    {STEPS.map((mode) => {
      const isActive = activeTab === mode.id;
      return (
        <button
          key={mode.id}
          onClick={() => {
            sound.playClick();
            onTabChange(mode.id);
          }}
          aria-current={isActive ? 'page' : undefined}
          className={`flex-1 py-2.5 short:py-1.5 px-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap min-w-0 ${
            isActive
              ? 'bg-brand-primary text-white shadow-glow'
              : 'text-dark-muted hover:text-white hover:bg-white/5'
          }`}
        >
          <span
            className={`text-[10px] w-4 h-4 flex items-center justify-center rounded font-bold shrink-0 ${
              isActive ? 'bg-white/25 text-white' : 'bg-white/5 text-dark-muted'
            }`}
          >
            {mode.step}
          </span>
          {ICONS[mode.id]}
          <span className={`truncate ${isActive ? 'font-bold' : 'font-semibold'}`}>
            {mode.label}
          </span>
        </button>
      );
    })}
  </nav>
);

/**
 * Phones: the last row of the app shell rather than a fixed overlay. As a real
 * flex child it can never cover content, so no bottom padding has to be
 * guessed and the safe-area inset is applied exactly once.
 */
export const BottomNav: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => (
  <nav
    aria-label="Mashq bosqichlari"
    className="sm:hidden shrink-0 bg-dark-card/95 backdrop-blur-2xl border-t border-dark-border/80 px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] flex items-stretch"
  >
    {STEPS.map((mode) => {
      const isActive = activeTab === mode.id;
      return (
        <button
          key={mode.id}
          onClick={() => {
            sound.playClick();
            onTabChange(mode.id);
          }}
          aria-current={isActive ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-2xl transition-colors flex-1 min-w-0 min-h-[52px] active:scale-95 ${
            isActive ? 'text-white' : 'text-dark-muted'
          }`}
        >
          <span
            className={`flex items-center justify-center w-9 h-7 rounded-lg transition-colors ${
              isActive ? 'bg-brand-primary text-white' : 'bg-transparent'
            }`}
          >
            {ICONS[mode.id]}
          </span>
          <span
            className={`text-[10px] leading-none truncate max-w-full ${
              isActive ? 'font-bold text-white' : 'font-semibold'
            }`}
          >
            {mode.label}
          </span>
        </button>
      );
    })}
  </nav>
);

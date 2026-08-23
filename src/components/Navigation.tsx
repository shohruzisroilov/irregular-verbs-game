'use client';

import React from 'react';
import { TabType } from '@/types/verb';
import { Layers, Target, Edit3, Grid, Zap, BookOpen } from 'lucide-react';
import { sound } from '@/utils/sound';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; step?: string; label: string; icon: React.ReactNode }[] = [
    { id: 'flashcards', step: '1', label: 'Flashcards', icon: <Layers className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'matching', step: '2', label: 'Matching', icon: <Grid className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'typing', step: '3', label: 'Typing', icon: <Edit3 className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'speed', step: '4', label: 'Speed', icon: <Zap className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'quiz', step: '5', label: 'Final Test', icon: <Target className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'dictionary', step: '📖', label: 'Table', icon: <BookOpen className="w-3.5 h-3.5 shrink-0" /> },
  ];

  const handleSelect = (tabId: TabType) => {
    sound.playClick();
    onTabChange(tabId);
  };

  return (
    <>
      {/* Top Navigation Step Tabs (Desktop & Tablet only) */}
      <nav className="hidden sm:flex bg-dark-card/90 backdrop-blur-md border border-dark-border p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`flex-1 py-2 px-1.5 sm:px-2.5 rounded-xl font-sans text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap min-w-0 ${
                isActive
                  ? 'bg-gradient-to-r from-brand-primary to-brand-primaryDark text-white shadow-glow ring-1 ring-white/20'
                  : 'text-dark-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold shrink-0 ${
                isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-dark-muted'
              }`}>
                {tab.step}
              </span>
              <span className="hidden xs:inline">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation Bar (Optimized larger touch targets) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-dark-card/95 backdrop-blur-2xl border-t border-dark-border/80 px-1 py-1.5 z-50 flex items-center justify-around shadow-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl transition-all duration-200 flex-1 min-w-0 min-h-[56px] active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-b from-brand-primary/30 to-brand-primaryDark/30 text-white border border-brand-primary/50 shadow-glow'
                  : 'text-dark-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className={isActive ? 'text-brand-accent scale-110' : 'text-dark-muted opacity-80'}>
                {React.cloneElement(tab.icon as React.ReactElement, { className: 'w-5 h-5 shrink-0' })}
              </div>
              <span className={`text-[10px] leading-none tracking-tight truncate max-w-full ${
                isActive ? 'font-extrabold text-white' : 'font-semibold text-dark-muted'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

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
      {/* Top Navigation Step Tabs */}
      <nav className="flex bg-dark-card/90 backdrop-blur-md border border-dark-border p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar w-full">
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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-dark-bg/95 backdrop-blur-xl border-t border-dark-border px-1 py-2 z-50 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all flex-1 min-w-0 ${
                isActive ? 'text-brand-accent scale-105 font-extrabold' : 'text-dark-muted hover:text-white font-medium'
              }`}
            >
              <div className={isActive ? 'text-brand-accent' : 'text-dark-muted'}>
                {tab.icon}
              </div>
              <span className="text-[9px] sm:text-[10px] truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

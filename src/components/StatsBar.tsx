'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StatsBarProps {
  masteredCount: number;
  totalVerbs: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ masteredCount, totalVerbs }) => {
  const percentage = Math.round((masteredCount / totalVerbs) * 100);

  return (
    <section className="bg-dark-card/80 backdrop-blur-md border border-dark-border rounded-2xl p-4 flex flex-col gap-2.5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-brand-emerald" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-dark-muted uppercase tracking-wider block">Overall Progress</span>
            <span className="text-sm font-extrabold text-white">
              {masteredCount} / {totalVerbs} verbs mastered
            </span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <span className="text-xs font-extrabold text-brand-accent">{percentage}%</span>
        </div>
      </div>

      {/* Main Overall Progress Bar */}
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-emerald rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </section>
  );
};

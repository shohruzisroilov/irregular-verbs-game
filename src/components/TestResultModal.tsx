'use client';

import React from 'react';
import { X, Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface TestResultData {
  percent: number;
  correct: number;
  total: number;
  date?: string;
}

interface TestResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TestResultData | null;
}

export const TestResultModal: React.FC<TestResultModalProps> = ({ isOpen, onClose, result }) => {
  if (!isOpen || !result) return null;

  let gradeText = "Excellent Result! 🚀";
  let gradeColor = "text-brand-emerald border-brand-emerald/30 bg-brand-emerald/10";
  if (result.percent < 50) {
    gradeText = "Keep Practicing! 💡";
    gradeColor = "text-brand-rose border-brand-rose/30 bg-brand-rose/10";
  } else if (result.percent < 80) {
    gradeText = "Good Effort! 👍";
    gradeColor = "text-brand-amber border-brand-amber/30 bg-brand-amber/10";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-dark-card border border-dark-border rounded-3xl w-full max-w-md p-6 flex flex-col items-center justify-center gap-5 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-dark-muted hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shadow-glow mt-2">
          <Award className="w-8 h-8 text-white" />
        </div>

        <div>
          <span className="text-xs font-bold text-dark-muted uppercase tracking-wider block mb-1">
            Latest Final Test Performance
          </span>
          <h2 className="font-heading font-extrabold text-5xl text-white tracking-tight">
            {result.percent}%
          </h2>
        </div>

        <div className={`px-4 py-1.5 rounded-full border text-xs font-extrabold ${gradeColor}`}>
          {gradeText}
        </div>

        <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-xs text-dark-muted font-bold">Correct</span>
            <span className="text-lg font-extrabold text-brand-emerald flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4" /> {result.correct}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <div className="flex flex-col items-center">
            <span className="text-xs text-dark-muted font-bold">Incorrect</span>
            <span className="text-lg font-extrabold text-brand-rose flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-4 h-4" /> {result.total - result.correct}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all mt-1"
        >
          Close
        </button>
      </div>
    </div>
  );
};

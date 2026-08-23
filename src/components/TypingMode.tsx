'use client';

import React, { useState, useEffect } from 'react';
import { Verb } from '@/types/verb';
import { sound } from '@/utils/sound';
import { Volume2, Sparkles } from 'lucide-react';

interface TypingModeProps {
  verbs: Verb[];
  onCorrect: (xpGain: number) => void;
}

export const TypingMode: React.FC<TypingModeProps> = ({ verbs, onCorrect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [v2Input, setV2Input] = useState('');
  const [v3Input, setV3Input] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const currentVerb = verbs[currentIndex] || verbs[0];

  useEffect(() => {
    setV2Input('');
    setV3Input('');
    setStatus('idle');
  }, [currentIndex]);

  const handleCheck = () => {
    const v2User = v2Input.toLowerCase().trim();
    const v3User = v3Input.toLowerCase().trim();

    const v2Valid = currentVerb.v2.toLowerCase().split('/').map((s) => s.trim()).includes(v2User);
    const v3Valid = currentVerb.v3.toLowerCase().split('/').map((s) => s.trim()).includes(v3User);

    if (v2Valid && v3Valid) {
      sound.playSuccess();
      setStatus('success');
      onCorrect(20);

      setTimeout(() => {
        setCurrentIndex(Math.floor(Math.random() * verbs.length));
      }, 1000);
    } else {
      sound.playError();
      setStatus('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-3xl p-6 flex flex-col gap-5 shadow-card w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
          Type Verb Forms
        </span>
        <button
          onClick={() => sound.speak(currentVerb.v1)}
          className="w-9 h-9 rounded-xl bg-white/5 border border-dark-border flex items-center justify-center text-dark-text hover:bg-white/10"
          title="Listen pronunciation"
        >
          <Volume2 className="w-4 h-4 text-brand-primary" />
        </button>
      </div>

      <div className="text-center py-2">
        <h2 className="font-heading font-extrabold text-4xl text-white tracking-tight">
          {currentVerb.v1}
        </h2>
        <p className="text-sm text-brand-amber font-semibold mt-1">
          {currentVerb.uz}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-dark-muted uppercase tracking-wider block mb-1.5">
            V2 (Past Simple):
          </label>
          <input
            type="text"
            value={v2Input}
            onChange={(e) => setV2Input(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. spoke"
            autoComplete="off"
            spellCheck="false"
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white font-heading text-lg font-bold outline-none transition-all ${
              status === 'success'
                ? 'border-brand-emerald bg-brand-emerald/10'
                : status === 'error'
                ? 'border-brand-rose bg-brand-rose/10'
                : 'border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
            }`}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-dark-muted uppercase tracking-wider block mb-1.5">
            V3 (Past Participle):
          </label>
          <input
            type="text"
            value={v3Input}
            onChange={(e) => setV3Input(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. spoken"
            autoComplete="off"
            spellCheck="false"
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white font-heading text-lg font-bold outline-none transition-all ${
              status === 'success'
                ? 'border-brand-emerald bg-brand-emerald/10'
                : status === 'error'
                ? 'border-brand-rose bg-brand-rose/10'
                : 'border-dark-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
            }`}
          />
        </div>
      </div>

      {status === 'error' && (
        <div className="text-xs font-bold text-brand-rose bg-brand-rose/10 border border-brand-rose/30 p-3 rounded-xl text-center">
          Correct answer: V2 - <span className="underline">{currentVerb.v2}</span> | V3 - <span className="underline">{currentVerb.v3}</span>
        </div>
      )}

      <button
        onClick={handleCheck}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primaryDark text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-glow"
      >
        <Sparkles className="w-5 h-5 text-brand-accent" />
        <span>Check Answer</span>
      </button>
    </div>
  );
};

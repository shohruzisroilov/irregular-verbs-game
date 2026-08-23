'use client';

import React, { useState } from 'react';
import { Verb } from '@/types/verb';
import { sound } from '@/utils/sound';
import { Search, Star, Volume2 } from 'lucide-react';

interface DictionaryModeProps {
  verbs: Verb[];
  starred: number[];
  onToggleStar: (verbId: number) => void;
}

export const DictionaryMode: React.FC<DictionaryModeProps> = ({ verbs, starred, onToggleStar }) => {
  const [search, setSearch] = useState('');
  const [onlyStarred, setOnlyStarred] = useState(false);

  const starredSet = new Set(starred);

  const filteredVerbs = verbs.filter((v) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      v.v1.toLowerCase().includes(query) ||
      v.v2.toLowerCase().includes(query) ||
      v.v3.toLowerCase().includes(query) ||
      v.uz.toLowerCase().includes(query);
    const matchesStar = !onlyStarred || starredSet.has(v.id);
    return matchesSearch && matchesStar;
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search & Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-dark-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search verbs (V1, V2, V3, Uzbek)..."
            className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-dark-muted outline-none focus:border-brand-primary"
          />
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setOnlyStarred(!onlyStarred);
          }}
          className={`px-3 py-2.5 rounded-xl border flex items-center gap-1.5 font-bold text-xs transition-all active:scale-95 ${
            onlyStarred
              ? 'bg-brand-amber/20 border-brand-amber text-brand-amber'
              : 'bg-dark-card border-dark-border text-dark-muted hover:text-white'
          }`}
          title="Starred Verbs"
        >
          <Star className={`w-4 h-4 ${onlyStarred ? 'fill-current' : ''}`} />
          <span>Starred</span>
        </button>
      </div>

      {/* Verbs List */}
      <div className="flex flex-col gap-2.5 pb-4">
        {filteredVerbs.length === 0 ? (
          <div className="text-center text-dark-muted py-10 text-xs font-medium">
            No verbs found 🔍
          </div>
        ) : (
          filteredVerbs.map((verb) => {
            const isStarred = starredSet.has(verb.id);
            return (
              <div
                key={verb.id}
                className="bg-dark-card border border-dark-border hover:border-brand-primary/40 rounded-2xl p-4 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-lg text-white">
                      {verb.v1}
                    </span>
                    <button
                      onClick={() => sound.speak(`${verb.v1}, ${verb.v2}, ${verb.v3}`)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-brand-primary hover:text-white border border-white/5 flex items-center justify-center text-dark-muted transition-all"
                      title="Listen pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs font-bold text-brand-accent">
                    V2: <span className="text-white">{verb.v2}</span> | V3: <span className="text-white">{verb.v3}</span>
                  </div>
                  <div className="text-xs font-medium text-dark-muted">
                    {verb.uz}
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    onToggleStar(verb.id);
                  }}
                  className={`p-2 rounded-xl border transition-all active:scale-90 ${
                    isStarred
                      ? 'bg-brand-amber/20 border-brand-amber text-brand-amber'
                      : 'bg-white/5 border-dark-border text-dark-muted hover:text-white'
                  }`}
                  title="Toggle Star"
                >
                  <Star className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

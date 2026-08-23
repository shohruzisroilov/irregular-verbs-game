'use client';

import React, { useState } from 'react';
import { Verb } from '@/types/verb';
import { Search, X, Volume2, Star } from 'lucide-react';
import { sound } from '@/utils/sound';

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  verbs: Verb[];
  starred: number[];
  onToggleStar: (verbId: number) => void;
}

export const DictionaryModal: React.FC<DictionaryModalProps> = ({
  isOpen,
  onClose,
  verbs,
  starred,
  onToggleStar,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredVerbs = verbs.filter((verb) => {
    const q = search.toLowerCase().trim();
    return (
      verb.v1.toLowerCase().includes(q) ||
      verb.v2.toLowerCase().includes(q) ||
      verb.v3.toLowerCase().includes(q) ||
      verb.uz.toLowerCase().includes(q)
    );
  });

  const handleSpeak = (text: string) => {
    sound.speak(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-dark-card border border-dark-border rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-dark-border/80 flex items-center justify-between bg-dark-bg/50">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-white">
              Full Verbs Table ({verbs.length})
            </h3>
            <p className="text-xs text-dark-muted">
              All 116 irregular verb forms and meanings
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-dark-muted hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-dark-border/50 bg-white/5">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-dark-muted absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search verb (V1, V2, V3 or meaning)..."
              className="w-full bg-black/40 border border-dark-border rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-white placeholder-dark-muted focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto no-scrollbar flex-1 p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-bold text-brand-accent uppercase tracking-wider">
                <th className="py-2.5 px-3">⭐</th>
                <th className="py-2.5 px-3">V1</th>
                <th className="py-2.5 px-3">V2</th>
                <th className="py-2.5 px-3">V3</th>
                <th className="py-2.5 px-3">Meaning</th>
                <th className="py-2.5 px-3 text-right">🔊</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredVerbs.map((verb) => {
                const isStarred = starred.includes(verb.id);
                return (
                  <tr key={verb.id} className="hover:bg-white/5 transition-all">
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onToggleStar(verb.id)}
                        className="text-dark-muted hover:text-brand-amber transition-all"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isStarred ? 'text-brand-amber fill-brand-amber' : ''
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-white">{verb.v1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-300">{verb.v2}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-300">{verb.v3}</td>
                    <td className="py-2.5 px-3 font-bold text-brand-amber">{verb.uz}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleSpeak(`${verb.v1}, ${verb.v2}, ${verb.v3}`)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-brand-primary/20 text-brand-primary flex items-center justify-center ml-auto transition-all"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

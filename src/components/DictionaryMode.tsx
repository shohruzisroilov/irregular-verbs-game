'use client';

import React, { useMemo, useState } from 'react';
import { Verb } from '@/types/verb';
import { sound } from '@/utils/sound';
import { Search, Star, X, SearchX } from 'lucide-react';
import { FORMS, MODE_BY_ID } from '@/constants/learning';
import { MasteryDots, ModeIntro, SpeakButton } from './shared';

interface DictionaryModeProps {
  verbs: Verb[];
  starred: number[];
  masteryProgress: Record<number, number>;
  onToggleStar: (verbId: number) => void;
}

export const DictionaryMode: React.FC<DictionaryModeProps> = ({
  verbs,
  starred,
  masteryProgress,
  onToggleStar,
}) => {
  const [search, setSearch] = useState('');
  const [onlyStarred, setOnlyStarred] = useState(false);

  const starredSet = useMemo(() => new Set(starred), [starred]);

  const filteredVerbs = useMemo(() => {
    const query = search.toLowerCase().trim();
    return verbs.filter((v) => {
      const matchesSearch =
        !query ||
        v.v1.toLowerCase().includes(query) ||
        v.v2.toLowerCase().includes(query) ||
        v.v3.toLowerCase().includes(query) ||
        v.uz.toLowerCase().includes(query) ||
        v.example.toLowerCase().includes(query);
      return matchesSearch && (!onlyStarred || starredSet.has(v.id));
    });
  }, [verbs, search, onlyStarred, starredSet]);

  const StarButton: React.FC<{ verb: Verb; size?: 'sm' | 'md' }> = ({ verb, size = 'md' }) => {
    const isStarred = starredSet.has(verb.id);
    return (
      <button
        onClick={() => {
          sound.playClick();
          onToggleStar(verb.id);
        }}
        aria-pressed={isStarred}
        aria-label={
          isStarred
            ? `${verb.v1} belgisini olib tashlash`
            : `${verb.v1} fe'lini belgilab qo'yish`
        }
        className={`${
          size === 'md' ? 'w-11 h-11' : 'w-9 h-9'
        } rounded-xl border flex items-center justify-center transition-colors active:scale-90 shrink-0 ${
          isStarred
            ? 'bg-brand-amber/20 border-brand-amber text-brand-amber'
            : 'bg-white/5 border-dark-border text-dark-muted hover:text-white'
        }`}
      >
        <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <ModeIntro step={null} title="Fe'llar jadvali" hint={MODE_BY_ID.dictionary.hint} />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-dark-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish: fe'l yoki tarjimasi"
            aria-label="Fe'llar orasidan qidirish"
            autoComplete="off"
            className="w-full h-11 bg-dark-card border border-dark-border rounded-xl pl-10 pr-10 text-base text-white placeholder-dark-muted outline-none focus:border-brand-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Qidiruvni tozalash"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-dark-muted hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setOnlyStarred((prev) => !prev);
          }}
          aria-pressed={onlyStarred}
          className={`px-3 h-11 rounded-xl border flex items-center gap-1.5 font-bold text-xs transition-colors active:scale-95 shrink-0 ${
            onlyStarred
              ? 'bg-brand-amber/20 border-brand-amber text-brand-amber'
              : 'bg-dark-card border-dark-border text-dark-muted hover:text-white'
          }`}
        >
          <Star className={`w-4 h-4 ${onlyStarred ? 'fill-current' : ''}`} />
          <span className="tabular-nums">{starred.length}</span>
        </button>
      </div>

      <p className="text-[11px] font-semibold text-dark-muted px-0.5 tabular-nums" aria-live="polite">
        {filteredVerbs.length} ta fe&apos;l ko&apos;rsatilmoqda
        {filteredVerbs.length !== verbs.length && ` (jami ${verbs.length})`}
      </p>

      {filteredVerbs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-center py-12 px-4 bg-dark-card border border-dark-border rounded-2xl">
          <SearchX className="w-8 h-8 text-dark-muted" />
          <div>
            <p className="text-sm font-bold text-white">Hech narsa topilmadi</p>
            <p className="text-xs text-dark-muted mt-1">
              {onlyStarred
                ? "Belgilangan fe'llar orasida bunday so'z yo'q. Filtrni o'chirib ko'ring."
                : 'Boshqa so‘z bilan qidirib ko‘ring.'}
            </p>
          </div>
          {onlyStarred && (
            <button
              onClick={() => setOnlyStarred(false)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-dark-border text-xs font-bold text-white hover:bg-white/10 transition-colors"
            >
              Barchasini ko&apos;rsatish
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop: an actual table — this screen is called "Jadval". */}
          <div className="hidden sm:block bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider bg-white/5">
                  <th scope="col" className="py-2.5 px-3 w-12">
                    <span className="sr-only">Belgilash</span>
                  </th>
                  <th scope="col" className={`py-2.5 px-3 ${FORMS.v1.text}`}>
                    V1 <span className="text-dark-muted font-medium normal-case">Infinitive</span>
                  </th>
                  <th scope="col" className={`py-2.5 px-3 ${FORMS.v2.text}`}>
                    V2 <span className="text-dark-muted font-medium normal-case">Past Simple</span>
                  </th>
                  <th scope="col" className={`py-2.5 px-3 ${FORMS.v3.text}`}>
                    V3 <span className="text-dark-muted font-medium normal-case">Participle</span>
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-dark-muted">
                    Ma&apos;nosi
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-dark-muted">
                    Mashq
                  </th>
                  <th scope="col" className="py-2.5 px-3 w-14 text-right">
                    <span className="sr-only">Tinglash</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredVerbs.map((verb) => (
                  <tr key={verb.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-3">
                      <StarButton verb={verb} size="sm" />
                    </td>
                    <td className="py-2 px-3 font-heading font-bold text-white">{verb.v1}</td>
                    <td className={`py-2 px-3 font-heading font-semibold ${FORMS.v2.text}`}>
                      {verb.v2}
                    </td>
                    <td className={`py-2 px-3 font-heading font-semibold ${FORMS.v3.text}`}>
                      {verb.v3}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-300">{verb.uz}</td>
                    <td className="py-2 px-3">
                      <MasteryDots count={masteryProgress[verb.id] || 0} showLabel={false} />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex justify-end">
                        <SpeakButton
                          text={`${verb.v1}, ${verb.v2}, ${verb.v3}`}
                          tone="muted"
                          label={`${verb.v1} shakllarini tinglash`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: the same data as cards, because a 7-column table cannot fit. */}
          <ul className="sm:hidden flex flex-col gap-2.5 pb-2">
            {filteredVerbs.map((verb) => (
              <li
                key={verb.id}
                className="bg-dark-card border border-dark-border rounded-2xl p-3.5 flex items-start justify-between gap-3"
              >
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-heading font-bold text-2xl text-white tracking-tight">
                      {verb.v1}
                    </span>
                    <MasteryDots count={masteryProgress[verb.id] || 0} showLabel={false} />
                  </div>
                  <div className="flex items-baseline gap-3 flex-wrap font-heading font-bold text-base">
                    <span>
                      <span className={`text-[10px] font-bold ${FORMS.v2.text}`}>V2</span>{' '}
                      <span className="text-white">{verb.v2}</span>
                    </span>
                    <span>
                      <span className={`text-[10px] font-bold ${FORMS.v3.text}`}>V3</span>{' '}
                      <span className="text-white">{verb.v3}</span>
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-300">{verb.uz}</span>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <SpeakButton
                    text={`${verb.v1}, ${verb.v2}, ${verb.v3}`}
                    label={`${verb.v1} shakllarini tinglash`}
                  />
                  <StarButton verb={verb} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

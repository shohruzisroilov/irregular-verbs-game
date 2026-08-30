'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Verb } from '@/types/verb';
import { sound, triggerConfetti } from '@/utils/sound';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { shuffle, sample } from '@/utils/shuffle';
import { MODE_BY_ID } from '@/constants/learning';
import { ModeIntro } from './shared';

interface MatchingModeProps {
  verbs: Verb[];
  onAnswer: (verbId: number, correct: boolean) => void;
}

interface MatchCardItem {
  id: number;
  verbId: number;
  type: 'v1' | 'forms';
  v1: string;
  v2: string;
  v3: string;
  uz: string;
}

const PAIRS_PER_ROUND = 4;
const MISMATCH_MS = 700;

export const MatchingMode: React.FC<MatchingModeProps> = ({ verbs, onAnswer }) => {
  const [cards, setCards] = useState<MatchCardItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrongPair, setWrongPair] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [round, setRound] = useState(1);

  // While a wrong pair is on screen the board is frozen. Without this, a third
  // click pushed `selected` to length 3 and the comparison never ran again.
  const lockedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initGame = useCallback(() => {
    const chosen = sample(verbs, PAIRS_PER_ROUND);
    const gameCards: MatchCardItem[] = [];

    chosen.forEach((verb, idx) => {
      const base = { verbId: verb.id, v1: verb.v1, v2: verb.v2, v3: verb.v3, uz: verb.uz };
      gameCards.push({ id: idx * 2, type: 'v1', ...base });
      gameCards.push({ id: idx * 2 + 1, type: 'forms', ...base });
    });

    lockedRef.current = false;
    setCards(shuffle(gameCards));
    setSelected([]);
    setMatched([]);
    setWrongPair([]);
    setMistakes(0);
  }, [verbs]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const totalCards = cards.length;

  const handleCardClick = (card: MatchCardItem) => {
    if (lockedRef.current) return;
    if (selected.includes(card.id) || matched.includes(card.id)) return;

    sound.playClick();
    const newSelected = [...selected, card.id];
    setSelected(newSelected);
    if (newSelected.length < 2) return;

    const first = cards.find((c) => c.id === newSelected[0]);
    const second = cards.find((c) => c.id === newSelected[1]);
    if (!first || !second) return;

    const isMatch = first.verbId === second.verbId && first.type !== second.type;

    if (isMatch) {
      sound.playSuccess();
      onAnswer(first.verbId, true);
      const newMatched = [...matched, first.id, second.id];
      setMatched(newMatched);
      setSelected([]);

      if (newMatched.length === totalCards) {
        sound.playFanfare();
        triggerConfetti();
      }
    } else {
      sound.playError();
      onAnswer(first.verbId, false);
      lockedRef.current = true;
      setWrongPair(newSelected);
      setMistakes((prev) => prev + 1);
      timerRef.current = setTimeout(() => {
        setSelected([]);
        setWrongPair([]);
        lockedRef.current = false;
      }, MISMATCH_MS);
    }
  };

  const isRoundDone = totalCards > 0 && matched.length === totalCards;

  return (
    <div className="flex flex-col gap-3 w-full">
      <ModeIntro step={2} title="Juftlash" hint={MODE_BY_ID.matching.hint}>
        <button
          onClick={() => {
            sound.playClick();
            initGame();
            setRound((prev) => prev + 1);
          }}
          className="w-11 h-11 rounded-xl bg-white/5 border border-dark-border flex items-center justify-center text-dark-muted hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Yangi juftlik to'plami"
          title="Yangi to'plam"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </ModeIntro>

      <div className="flex items-center justify-between text-[11px] font-semibold text-dark-muted px-0.5">
        <span className="tabular-nums">{round}-to&apos;plam</span>
        <span className="tabular-nums">
          Topildi: {matched.length / 2} / {totalCards / 2} · Xato: {mistakes}
        </span>
      </div>

      {isRoundDone ? (
        <div className="bg-dark-card border border-brand-emerald/30 rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-card animate-popIn">
          <div className="w-14 h-14 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-brand-emerald" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-white">Barcha juftlik topildi</h3>
            <p className="text-xs text-dark-muted mt-1.5">
              {mistakes === 0
                ? 'Bitta ham xatosiz.'
                : `${mistakes} ta xato bilan yakunladingiz.`}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              initGame();
              setRound((prev) => prev + 1);
            }}
            className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Keyingi to&apos;plam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {cards.map((card) => {
            const isSelected = selected.includes(card.id);
            const isMatched = matched.includes(card.id);
            const isWrong = wrongPair.includes(card.id);

            let style = 'bg-dark-card border-dark-border hover:bg-dark-hover';
            if (isWrong) style = 'bg-brand-rose/20 border-brand-rose animate-shake';
            else if (isSelected) style = 'bg-brand-accent/20 border-brand-accent';
            else if (isMatched)
              style = 'bg-brand-emerald/15 border-brand-emerald/50 opacity-60 pointer-events-none';

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                aria-pressed={isSelected}
                className={`min-h-[84px] p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 transition-colors active:scale-95 ${style}`}
              >
                {card.type === 'v1' ? (
                  <span className="font-heading font-bold text-xl sm:text-2xl text-white break-words">
                    {card.v1}
                  </span>
                ) : (
                  <>
                    <span className="font-heading font-bold text-base sm:text-lg leading-tight break-words">
                      <span className="text-form-v2">{card.v2}</span>
                      <span className="text-dark-muted mx-1">·</span>
                      <span className="text-form-v3">{card.v3}</span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 leading-tight break-words">
                      {card.uz}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

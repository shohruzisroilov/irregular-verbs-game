'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Verb } from '@/types/verb';
import { sound, triggerConfetti } from '@/utils/sound';
import { RotateCcw } from 'lucide-react';

interface MatchingModeProps {
  verbs: Verb[];
  onComplete: (xpGain: number) => void;
}

interface MatchCardItem {
  id: number;
  verbId: number;
  text: string;
  type: 'v1' | 'details';
}

export const MatchingMode: React.FC<MatchingModeProps> = ({ verbs, onComplete }) => {
  const [cards, setCards] = useState<MatchCardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);

  const initGame = useCallback(() => {
    const shuffledVerbs = [...verbs].sort(() => 0.5 - Math.random()).slice(0, 4);
    const gameCards: MatchCardItem[] = [];

    shuffledVerbs.forEach((verb, idx) => {
      gameCards.push({
        id: idx * 2,
        verbId: verb.id,
        text: verb.v1,
        type: 'v1'
      });
      gameCards.push({
        id: idx * 2 + 1,
        verbId: verb.id,
        text: `${verb.v2} / ${verb.v3}\n(${verb.uz})`,
        type: 'details'
      });
    });

    gameCards.sort(() => 0.5 - Math.random());
    setCards(gameCards);
    setSelectedCards([]);
    setMatchedIds([]);
  }, [verbs]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (card: MatchCardItem) => {
    if (selectedCards.includes(card.id) || matchedIds.includes(card.id)) return;

    sound.playClick();
    const newSelected = [...selectedCards, card.id];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const firstCard = cards.find((c) => c.id === newSelected[0])!;
      const secondCard = cards.find((c) => c.id === newSelected[1])!;

      if (firstCard.verbId === secondCard.verbId && firstCard.type !== secondCard.type) {
        sound.playSuccess();
        const newMatched = [...matchedIds, firstCard.id, secondCard.id];
        setMatchedIds(newMatched);
        setSelectedCards([]);

        if (newMatched.length === 8) {
          sound.playFanfare();
          triggerConfetti();
          onComplete(40);
        }
      } else {
        sound.playError();
        setTimeout(() => {
          setSelectedCards([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
          Match the matching pairs
        </span>
        <button
          onClick={initGame}
          className="w-9 h-9 rounded-xl bg-white/5 border border-dark-border flex items-center justify-center text-dark-text hover:bg-white/10"
          title="Restart round"
        >
          <RotateCcw className="w-4 h-4 text-brand-primary" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const isSelected = selectedCards.includes(card.id);
          const isMatched = matchedIds.includes(card.id);

          let style = "bg-dark-card border-dark-border text-white hover:bg-dark-hover";
          if (isSelected) {
            style = "bg-brand-accent/20 border-brand-accent text-brand-accent shadow-glow";
          } else if (isMatched) {
            style = "bg-brand-emerald/20 border-brand-emerald text-brand-emerald opacity-60 pointer-events-none scale-95";
          }

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`min-h-[70px] sm:min-h-[85px] p-2.5 sm:p-3 rounded-2xl border font-sans font-extrabold text-xs sm:text-sm whitespace-pre-line flex items-center justify-center text-center transition-all duration-200 active:scale-95 ${style}`}
            >
              {card.text}
            </button>
          );
        })}
      </div>
    </div>
  );
};

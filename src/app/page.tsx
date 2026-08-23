'use client';

import React, { useState, useEffect } from 'react';
import { VERBS_DATA } from '@/data/verbs';
import { TabType } from '@/types/verb';
import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { Navigation } from '@/components/Navigation';
import { FlashcardMode } from '@/components/FlashcardMode';
import { QuizMode } from '@/components/QuizMode';
import { TypingMode } from '@/components/TypingMode';
import { MatchingMode } from '@/components/MatchingMode';
import { SpeedMode } from '@/components/SpeedMode';
import { DictionaryMode } from '@/components/DictionaryMode';
import { TestResultModal } from '@/components/TestResultModal';
import { sound, triggerConfetti } from '@/utils/sound';

interface TestResult {
  percent: number;
  correct: number;
  total: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('flashcards');
  const [mastered, setMastered] = useState<number[]>([]);
  const [starred, setStarred] = useState<number[]>([]);
  const [masteryProgress, setMasteryProgress] = useState<Record<number, number>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state from LocalStorage on mount
  useEffect(() => {
    const savedMastered: number[] = JSON.parse(localStorage.getItem('verb_mastered') || '[]');
    const savedStarred: number[] = JSON.parse(localStorage.getItem('verb_starred') || '[]');
    const savedProgress: Record<number, number> = JSON.parse(localStorage.getItem('verb_mastery_progress') || '{}');
    const savedTest: TestResult | null = JSON.parse(localStorage.getItem('verb_last_test_result') || 'null');

    setMastered(savedMastered);
    setStarred(savedStarred);
    setMasteryProgress(savedProgress);
    setTestResult(savedTest);
    setIsLoaded(true);
  }, []);

  const handleKnowVerb = (verbId: number) => {
    const current = masteryProgress[verbId] || 0;
    const nextCount = Math.min(5, current + 1);
    const updatedProgress = { ...masteryProgress, [verbId]: nextCount };

    setMasteryProgress(updatedProgress);
    localStorage.setItem('verb_mastery_progress', JSON.stringify(updatedProgress));

    if (nextCount === 5 && !mastered.includes(verbId)) {
      const newMastered = [...mastered, verbId];
      setMastered(newMastered);
      localStorage.setItem('verb_mastered', JSON.stringify(newMastered));
      sound.playFanfare();
      triggerConfetti();
    }
  };

  const handleDontKnowVerb = (verbId: number) => {
    const current = masteryProgress[verbId] || 0;
    const nextCount = Math.max(0, current - 1);
    const updatedProgress = { ...masteryProgress, [verbId]: nextCount };

    setMasteryProgress(updatedProgress);
    localStorage.setItem('verb_mastery_progress', JSON.stringify(updatedProgress));

    if (nextCount < 5 && mastered.includes(verbId)) {
      const newMastered = mastered.filter((id) => id !== verbId);
      setMastered(newMastered);
      localStorage.setItem('verb_mastered', JSON.stringify(newMastered));
    }
  };

  const handleToggleStar = (verbId: number) => {
    let updated: number[];
    if (starred.includes(verbId)) {
      updated = starred.filter((id) => id !== verbId);
    } else {
      updated = [...starred, verbId];
    }
    setStarred(updated);
    localStorage.setItem('verb_starred', JSON.stringify(updated));
  };

  const handleCompleteTest = (scorePercent: number, correctCount: number, totalCount: number) => {
    const resultObj: TestResult = {
      percent: scorePercent,
      correct: correctCount,
      total: totalCount,
    };
    setTestResult(resultObj);
    localStorage.setItem('verb_last_test_result', JSON.stringify(resultObj));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center text-dark-muted font-bold">
        Loading... ⚡
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/10 via-dark-bg to-dark-bg pb-24 sm:pb-8">
      {/* Top Banner Developer Credit (Hidden on Table page) */}
      {activeTab !== 'dictionary' && (
        <div className="w-full bg-dark-card/60 backdrop-blur-md border-b border-dark-border/60 py-1.5 px-3 text-center text-[11px] sm:text-xs font-semibold text-dark-muted flex items-center justify-center gap-1.5">
          <span>Developed by</span>
          <a
            href="https://www.shohruzisroilov.uz/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-accent hover:underline font-extrabold transition-all"
          >
            Shohruz Isroilov
          </a>
        </div>
      )}

      <div className="max-w-xl sm:max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-4 flex flex-col gap-2.5 sm:gap-4">
        {/* Top Header & User Stats Bar (Hidden on Table page for maximum full-screen table space) */}
        {activeTab !== 'dictionary' && (
          <>
            <Header
              onOpenDictionary={() => setActiveTab('dictionary')}
              latestTestScore={testResult ? testResult.percent : null}
              onOpenTestResult={() => setIsTestModalOpen(true)}
            />

            <StatsBar masteredCount={mastered.length} totalVerbs={VERBS_DATA.length} />
          </>
        )}

        {/* Navigation Step Tabs */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Active Screen View */}
        <main className="w-full mt-0.5 sm:mt-1">
          {activeTab === 'flashcards' && (
            <FlashcardMode
              verbs={VERBS_DATA}
              masteryProgress={masteryProgress}
              onKnow={handleKnowVerb}
              onDontKnow={handleDontKnowVerb}
            />
          )}

          {activeTab === 'matching' && (
            <MatchingMode
              verbs={VERBS_DATA}
              onComplete={() => {}}
            />
          )}

          {activeTab === 'typing' && (
            <TypingMode
              verbs={VERBS_DATA}
              onCorrect={() => {}}
            />
          )}

          {activeTab === 'speed' && (
            <SpeedMode
              verbs={VERBS_DATA}
              onComplete={() => {}}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizMode
              verbs={VERBS_DATA}
              onCompleteTest={handleCompleteTest}
            />
          )}

          {activeTab === 'dictionary' && (
            <DictionaryMode
              verbs={VERBS_DATA}
              starred={starred}
              onToggleStar={handleToggleStar}
            />
          )}
        </main>
      </div>

      {/* Test Result Summary Modal */}
      <TestResultModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        result={testResult}
      />
    </div>
  );
}

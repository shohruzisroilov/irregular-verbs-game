'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VERBS_DATA } from '@/data/verbs';
import { TabType } from '@/types/verb';
import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { StepRail, BottomNav } from '@/components/Navigation';
import { FlashcardMode } from '@/components/FlashcardMode';
import { QuizMode } from '@/components/QuizMode';
import { TypingMode } from '@/components/TypingMode';
import { MatchingMode } from '@/components/MatchingMode';
import { SpeedMode } from '@/components/SpeedMode';
import { DictionaryMode } from '@/components/DictionaryMode';
import { TestResultModal } from '@/components/TestResultModal';
import { sound, triggerConfetti } from '@/utils/sound';
import { readJSON, writeJSON, removeKeys } from '@/utils/storage';
import { MASTERY_TARGET } from '@/constants/learning';

interface TestResult {
  percent: number;
  correct: number;
  total: number;
}

const KEYS = {
  mastered: 'verb_mastered',
  starred: 'verb_starred',
  progress: 'verb_mastery_progress',
  lastTest: 'verb_last_test_result',
  speedBest: 'verb_speed_best',
  activeTab: 'verb_active_tab',
};

const TABS: TabType[] = ['flashcards', 'matching', 'typing', 'speed', 'quiz', 'dictionary'];

function isTab(value: unknown): value is TabType {
  return typeof value === 'string' && (TABS as string[]).includes(value);
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('flashcards');
  const [lastStep, setLastStep] = useState<TabType>('flashcards');
  const [starred, setStarred] = useState<number[]>([]);
  const [masteryProgress, setMasteryProgress] = useState<Record<number, number>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  // A timed round takes over the screen: progress can wait 60 seconds.
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Mirrors `masteryProgress` so `recordAnswer` can read the current value
  // without nesting one state update inside another.
  const progressRef = useRef<Record<number, number>>({});

  useEffect(() => {
    const savedProgress = readJSON<Record<number, number>>(KEYS.progress, {});
    progressRef.current = savedProgress;
    setMasteryProgress(savedProgress);
    setStarred(readJSON<number[]>(KEYS.starred, []));
    setTestResult(readJSON<TestResult | null>(KEYS.lastTest, null));

    // A reload used to drop you back on step 1 whatever you were doing. An
    // explicit ?mode= wins so a link can point at one step.
    const fromUrl = new URLSearchParams(window.location.search).get('mode');
    const savedTab = readJSON<string>(KEYS.activeTab, 'flashcards');
    const restored = isTab(fromUrl) ? fromUrl : isTab(savedTab) ? savedTab : 'flashcards';
    setActiveTab(restored);
    if (restored !== 'dictionary') setLastStep(restored);

    setIsLoaded(true);
  }, []);

  /**
   * Every mode reports through here. Typing, matching, speed and the test used
   * to hand their results to `() => {}`, so only flashcards moved the bar.
   */
  const recordAnswer = useCallback((verbId: number, correct: boolean) => {
    const current = progressRef.current[verbId] || 0;
    const next = correct ? Math.min(MASTERY_TARGET, current + 1) : Math.max(0, current - 1);
    if (next === current) return;

    const updated = { ...progressRef.current, [verbId]: next };
    progressRef.current = updated;
    setMasteryProgress(updated);
    writeJSON(KEYS.progress, updated);

    if (next >= MASTERY_TARGET && current < MASTERY_TARGET) {
      sound.playFanfare();
      triggerConfetti();
    }
  }, []);

  const handleToggleStar = useCallback((verbId: number) => {
    setStarred((prev) => {
      const updated = prev.includes(verbId)
        ? prev.filter((id) => id !== verbId)
        : [...prev, verbId];
      writeJSON(KEYS.starred, updated);
      return updated;
    });
  }, []);

  const handleCompleteTest = useCallback(
    (percent: number, correct: number, total: number) => {
      const result: TestResult = { percent, correct, total };
      setTestResult(result);
      writeJSON(KEYS.lastTest, result);
    },
    []
  );

  const handleReset = useCallback(() => {
    removeKeys(Object.values(KEYS));
    progressRef.current = {};
    setStarred([]);
    setMasteryProgress({});
    setTestResult(null);
    sound.playClick();
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    setIsFocusMode(false);
    setActiveTab(tab);
    writeJSON(KEYS.activeTab, tab);
    if (tab !== 'dictionary') setLastStep(tab);
  }, []);

  const isDictionary = activeTab === 'dictionary';

  const { masteredCount, inProgressCount } = useMemo(() => {
    let done = 0;
    let partial = 0;
    Object.values(masteryProgress).forEach((count) => {
      if (count >= MASTERY_TARGET) done += 1;
      else if (count > 0) partial += 1;
    });
    return { masteredCount: done, inProgressCount: partial };
  }, [masteryProgress]);

  if (!isLoaded) {
    return (
      <div className="min-h-[100dvh] bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-dark-muted">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-brand-accent animate-spin" />
          <p className="text-sm font-semibold">Yuklanmoqda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] roomy:h-auto roomy:min-h-[100dvh] flex flex-col overflow-hidden roomy:overflow-visible bg-dark-bg bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/10 via-dark-bg to-dark-bg">
      {/* Developer credit: first thing on the page, on every screen. */}
      <div className="shrink-0 w-full bg-dark-card/70 backdrop-blur-md border-b border-dark-border/60 pt-[max(0.375rem,env(safe-area-inset-top))] pb-1.5 short:pt-0.5 short:pb-0.5 px-3 flex items-center justify-center gap-1.5 text-xs sm:text-sm short:text-[11px]">
        <span className="font-medium text-dark-muted">Developed by</span>
        <a
          href="https://www.shohruzisroilov.uz/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-brand-accent hover:text-white hover:underline underline-offset-2 transition-colors"
        >
          Shohruz Isroilov
        </a>
      </div>

      <div className="flex-1 min-h-0 roomy:flex-none flex flex-col w-full max-w-xl sm:max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 short:py-1.5 gap-2.5 sm:gap-3 short:gap-1.5">
        {/* The header no longer disappears on the dictionary screen: its toggle
            is the only way back from there. */}
        <Header
          isDictionaryOpen={isDictionary}
          onToggleDictionary={() => handleTabChange(isDictionary ? lastStep : 'dictionary')}
          latestTestScore={testResult ? testResult.percent : null}
          onOpenTestResult={() => setIsTestModalOpen(true)}
        />

        {!isDictionary && !isFocusMode && (
          <StatsBar
            masteredCount={masteredCount}
            inProgressCount={inProgressCount}
            totalVerbs={VERBS_DATA.length}
            onReset={handleReset}
          />
        )}

        <StepRail activeTab={activeTab} onTabChange={handleTabChange} />

        {/* On a phone this is the only scrolling region, so the header and the
            step bar stay put while a long list moves underneath them. */}
        <main className="w-full flex-1 min-h-0 roomy:flex-none overflow-y-auto overflow-x-hidden roomy:overflow-visible overscroll-contain no-scrollbar">
          {activeTab === 'flashcards' && (
            <FlashcardMode
              verbs={VERBS_DATA}
              masteryProgress={masteryProgress}
              onAnswer={recordAnswer}
            />
          )}

          {activeTab === 'matching' && (
            <MatchingMode verbs={VERBS_DATA} onAnswer={recordAnswer} />
          )}

          {activeTab === 'typing' && (
            <TypingMode verbs={VERBS_DATA} onAnswer={recordAnswer} />
          )}

          {activeTab === 'speed' && (
            <SpeedMode
              verbs={VERBS_DATA}
              onAnswer={recordAnswer}
              onFocusChange={setIsFocusMode}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizMode
              verbs={VERBS_DATA}
              onAnswer={recordAnswer}
              onCompleteTest={handleCompleteTest}
            />
          )}

          {activeTab === 'dictionary' && (
            <DictionaryMode
              verbs={VERBS_DATA}
              starred={starred}
              masteryProgress={masteryProgress}
              onToggleStar={handleToggleStar}
            />
          )}
        </main>
      </div>

      {/* Always present: navigation that vanishes on one screen is a trap. */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      <TestResultModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        result={testResult}
      />
    </div>
  );
}

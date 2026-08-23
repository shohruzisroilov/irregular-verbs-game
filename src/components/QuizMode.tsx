'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Verb } from '@/types/verb';
import { sound, triggerConfetti } from '@/utils/sound';
import { Check, X, Award, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

interface QuizModeProps {
  verbs: Verb[];
  onCompleteTest?: (scorePercent: number, correctCount: number, totalCount: number) => void;
}

interface QuizQuestion {
  verb: Verb;
  questionTitle: string;
  targetWord: string;
  subtext: string;
  correctAnswer: string;
  options: string[];
}

const TOTAL_QUESTIONS = 10;

export const QuizMode: React.FC<QuizModeProps> = ({ verbs, onCompleteTest }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const generateQuestion = useCallback(() => {
    const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
    const qTypes = ['v2', 'v3', 'uzbek_to_v1'];
    const qType = qTypes[Math.floor(Math.random() * qTypes.length)];

    let questionTitle = '';
    let targetWord = '';
    let subtext = '';
    let correctAnswer = '';

    if (qType === 'v2') {
      questionTitle = "Find V2 (Past Simple) Form";
      targetWord = randomVerb.v1;
      subtext = `(${randomVerb.uz})`;
      correctAnswer = randomVerb.v2;
    } else if (qType === 'v3') {
      questionTitle = "Find V3 (Past Participle) Form";
      targetWord = randomVerb.v1;
      subtext = `(${randomVerb.uz})`;
      correctAnswer = randomVerb.v3;
    } else {
      questionTitle = "Find English V1 Form";
      targetWord = randomVerb.uz;
      subtext = `(Uzbek Meaning)`;
      correctAnswer = randomVerb.v1;
    }

    const optionsSet = new Set<string>([correctAnswer]);
    while (optionsSet.size < 4) {
      const randOther = verbs[Math.floor(Math.random() * verbs.length)];
      const candidate = qType === 'v2' ? randOther.v2 : (qType === 'v3' ? randOther.v3 : randOther.v1);
      if (candidate && candidate !== correctAnswer) {
        optionsSet.add(candidate);
      }
    }

    const options = Array.from(optionsSet).sort(() => 0.5 - Math.random());

    setQuestion({
      verb: randomVerb,
      questionTitle,
      targetWord,
      subtext,
      correctAnswer,
      options
    });
    setSelectedOption(null);
    setIsAnswered(false);
  }, [verbs]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const restartQuiz = () => {
    sound.playClick();
    setQuestionIndex(0);
    setCorrectCount(0);
    setIsFinished(false);
    generateQuestion();
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered || !question) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === question.correctAnswer;
    const updatedCorrect = isCorrect ? correctCount + 1 : correctCount;

    if (isCorrect) {
      sound.playSuccess();
      setCorrectCount(updatedCorrect);
    } else {
      sound.playError();
    }

    setTimeout(() => {
      if (questionIndex + 1 >= TOTAL_QUESTIONS) {
        const finalPercent = Math.round((updatedCorrect / TOTAL_QUESTIONS) * 100);
        setIsFinished(true);
        if (finalPercent >= 70) {
          sound.playFanfare();
          triggerConfetti();
        }
        if (onCompleteTest) {
          onCompleteTest(finalPercent, updatedCorrect, TOTAL_QUESTIONS);
        }
      } else {
        setQuestionIndex((prev) => prev + 1);
        generateQuestion();
      }
    }, 1100);
  };

  if (isFinished) {
    const finalPercent = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
    let gradeText = "Excellent Result! 🚀";
    let gradeColor = "text-brand-emerald border-brand-emerald/30 bg-brand-emerald/10";
    if (finalPercent < 50) {
      gradeText = "Keep Practicing! 💡";
      gradeColor = "text-brand-rose border-brand-rose/30 bg-brand-rose/10";
    } else if (finalPercent < 80) {
      gradeText = "Good Effort! 👍";
      gradeColor = "text-brand-amber border-brand-amber/30 bg-brand-amber/10";
    }

    return (
      <div className="bg-dark-card border border-dark-border rounded-3xl p-6 flex flex-col items-center justify-center gap-5 shadow-card w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shadow-glow">
          <Award className="w-9 h-9 text-white" />
        </div>

        <div>
          <span className="text-xs font-bold text-dark-muted uppercase tracking-wider block mb-1">
            Final Test Result
          </span>
          <h2 className="font-heading font-extrabold text-5xl text-white tracking-tight">
            {finalPercent}%
          </h2>
        </div>

        <div className={`px-4 py-1.5 rounded-full border text-xs font-extrabold ${gradeColor}`}>
          {gradeText}
        </div>

        <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-xs text-dark-muted font-bold">Correct</span>
            <span className="text-lg font-extrabold text-brand-emerald flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4" /> {correctCount}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <div className="flex flex-col items-center">
            <span className="text-xs text-dark-muted font-bold">Incorrect</span>
            <span className="text-lg font-extrabold text-brand-rose flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-4 h-4" /> {TOTAL_QUESTIONS - correctCount}
            </span>
          </div>
        </div>

        <button
          onClick={restartQuiz}
          className="w-full py-3.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-glow mt-1"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Final Test</span>
        </button>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-3xl p-5 flex flex-col gap-5 shadow-card w-full">
      {/* Test Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-brand-accent uppercase tracking-wider">
            Question {questionIndex + 1} / {TOTAL_QUESTIONS}
          </span>
          <span className="text-dark-muted">
            Correct: <strong className="text-brand-emerald">{correctCount}</strong>
          </span>
        </div>

        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full transition-all duration-300"
            style={{ width: `${((questionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      {/* Target Word Prompt */}
      <div className="text-center py-3 flex flex-col items-center justify-center bg-black/20 border border-white/5 rounded-2xl p-4">
        <span className="text-xs font-bold text-dark-muted uppercase tracking-wider mb-1">
          {question.questionTitle}
        </span>
        <h2 className="font-heading font-black text-4xl sm:text-5xl text-white tracking-tight mb-0.5">
          {question.targetWord}
        </h2>
        <p className="text-sm font-extrabold text-brand-amber">
          {question.subtext}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === question.correctAnswer;
          
          let btnStyle = "bg-white/5 border-dark-border text-white hover:bg-white/10 hover:border-white/20";
          if (isAnswered) {
            if (isCorrect) {
              btnStyle = "bg-brand-emerald/20 border-brand-emerald text-brand-emerald shadow-glow";
            } else if (isSelected && !isCorrect) {
              btnStyle = "bg-brand-rose/20 border-brand-rose text-brand-rose";
            } else {
              btnStyle = "bg-white/5 border-dark-border text-dark-muted opacity-50";
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(option)}
              className={`p-3.5 rounded-xl border font-sans text-lg sm:text-xl font-black transition-all flex items-center justify-between active:scale-[0.98] ${btnStyle}`}
            >
              <span>{option}</span>
              {isAnswered && isCorrect && <Check className="w-5 h-5 text-brand-emerald" />}
              {isAnswered && isSelected && !isCorrect && <X className="w-5 h-5 text-brand-rose" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Verb } from '@/types/verb';
import { sound, triggerConfetti } from '@/utils/sound';
import { Check, X, Award, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { shuffle, sample, pickOne } from '@/utils/shuffle';
import { FORMS, MODE_BY_ID } from '@/constants/learning';
import { ModeIntro } from './shared';

interface QuizModeProps {
  verbs: Verb[];
  onAnswer: (verbId: number, correct: boolean) => void;
  onCompleteTest: (scorePercent: number, correctCount: number, totalCount: number) => void;
}

type QuestionKind = 'v2' | 'v3' | 'meaning';

interface QuizQuestion {
  verb: Verb;
  kind: QuestionKind;
  prompt: string;
  targetWord: string;
  subtext: string;
  correctAnswer: string;
  options: string[];
}

interface WrongAnswer {
  verb: Verb;
  chosen: string;
  correct: string;
}

const TOTAL_QUESTIONS = 10;
const REVEAL_MS = 1100;

function buildQuestion(verb: Verb, pool: Verb[]): QuizQuestion {
  const kind = pickOne<QuestionKind>(['v2', 'v3', 'meaning']);

  const valueOf = (v: Verb) => (kind === 'v2' ? v.v2 : kind === 'v3' ? v.v3 : v.v1);
  const correctAnswer = valueOf(verb);

  const optionsSet = new Set<string>([correctAnswer]);
  for (let guard = 0; optionsSet.size < 4 && guard < 80; guard++) {
    const other = pickOne(pool);
    // A verb that shares the prompt's meaning would make a second answer just
    // as correct, so it can never be offered as a distractor.
    if (kind === 'meaning' && other.uz === verb.uz) continue;
    const candidate = valueOf(other);
    if (candidate && candidate !== correctAnswer) optionsSet.add(candidate);
  }

  if (kind === 'meaning') {
    return {
      verb,
      kind,
      prompt: "Bu ma'noni qaysi fe'l bildiradi?",
      targetWord: verb.uz,
      subtext: "o'zbekcha ma'nosi",
      correctAnswer,
      options: shuffle([...optionsSet]),
    };
  }

  const meta = FORMS[kind];
  return {
    verb,
    kind,
    prompt: `${meta.short} — ${meta.grammar} shaklini toping`,
    targetWord: verb.v1,
    subtext: verb.uz,
    correctAnswer,
    options: shuffle([...optionsSet]),
  };
}

export const QuizMode: React.FC<QuizModeProps> = ({ verbs, onAnswer, onCompleteTest }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startQuiz = useCallback(() => {
    // Ten distinct verbs: the old version drew each question independently, so
    // the same verb could be asked several times in one test.
    const chosen = sample(verbs, TOTAL_QUESTIONS);
    setQuestions(chosen.map((verb) => buildQuestion(verb, verbs)));
    setIndex(0);
    setCorrectCount(0);
    setWrongAnswers([]);
    setSelectedOption(null);
    setIsFinished(false);
  }, [verbs]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  useEffect(() => () => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
  }, []);

  const question = questions[index];
  const total = questions.length || TOTAL_QUESTIONS;

  const handleSelectOption = (option: string) => {
    if (selectedOption !== null || !question) return;

    setSelectedOption(option);
    const isCorrect = option === question.correctAnswer;
    const updatedCorrect = isCorrect ? correctCount + 1 : correctCount;

    onAnswer(question.verb.id, isCorrect);

    if (isCorrect) {
      sound.playSuccess();
      setCorrectCount(updatedCorrect);
    } else {
      sound.playError();
      setWrongAnswers((prev) => [
        ...prev,
        { verb: question.verb, chosen: option, correct: question.correctAnswer },
      ]);
    }

    advanceRef.current = setTimeout(() => {
      if (index + 1 >= total) {
        const finalPercent = Math.round((updatedCorrect / total) * 100);
        setIsFinished(true);
        if (finalPercent >= 70) {
          sound.playFanfare();
          triggerConfetti();
        }
        onCompleteTest(finalPercent, updatedCorrect, total);
      } else {
        setIndex((prev) => prev + 1);
        setSelectedOption(null);
      }
    }, REVEAL_MS);
  };

  if (isFinished) {
    const finalPercent = Math.round((correctCount / total) * 100);
    let gradeText = 'A’lo natija';
    let gradeColor = 'text-brand-emerald border-brand-emerald/30 bg-brand-emerald/10';
    if (finalPercent < 50) {
      gradeText = 'Yana mashq qilish kerak';
      gradeColor = 'text-brand-rose border-brand-rose/30 bg-brand-rose/10';
    } else if (finalPercent < 80) {
      gradeText = 'Yaxshi, lekin yaxshilash mumkin';
      gradeColor = 'text-brand-amber border-brand-amber/30 bg-brand-amber/10';
    }

    return (
      <div className="flex flex-col gap-3 w-full">
        <ModeIntro step={5} title="Test" hint={MODE_BY_ID.quiz.hint} />

        <div className="bg-dark-card border border-dark-border rounded-3xl p-6 flex flex-col items-center gap-5 shadow-card w-full text-center animate-popIn">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shadow-glow">
            <Award className="w-7 h-7 text-white" />
          </div>

          <div>
            <span className="text-[11px] font-semibold text-dark-muted uppercase tracking-wider block mb-1">
              Test natijasi
            </span>
            <h3 className="font-heading font-bold text-5xl text-white tracking-tight tabular-nums">
              {finalPercent}%
            </h3>
          </div>

          <div className={`px-4 py-1.5 rounded-full border text-xs font-bold ${gradeColor}`}>
            {gradeText}
          </div>

          <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <span className="text-[11px] text-dark-muted font-semibold">To&apos;g&apos;ri</span>
              <span className="text-lg font-bold text-brand-emerald flex items-center gap-1 mt-0.5 tabular-nums">
                <CheckCircle2 className="w-4 h-4" /> {correctCount}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[11px] text-dark-muted font-semibold">Xato</span>
              <span className="text-lg font-bold text-brand-rose flex items-center gap-1 mt-0.5 tabular-nums">
                <AlertCircle className="w-4 h-4" /> {total - correctCount}
              </span>
            </div>
          </div>

          {/* A score alone teaches nothing — the mistakes are the lesson. */}
          {wrongAnswers.length > 0 && (
            <div className="w-full text-left flex flex-col gap-2">
              <h4 className="text-[11px] font-semibold text-dark-muted uppercase tracking-wider">
                Xato qilingan fe&apos;llar
              </h4>
              {wrongAnswers.map((item, i) => (
                <div
                  key={`${item.verb.id}-${i}`}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1.5"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-heading font-bold text-base text-white">
                      {item.verb.v1}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 text-right">
                      {item.verb.uz}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm font-bold">
                    <span className={FORMS.v2.text}>
                      {FORMS.v2.short} <span className="text-white">{item.verb.v2}</span>
                    </span>
                    <span className={FORMS.v3.text}>
                      {FORMS.v3.short} <span className="text-white">{item.verb.v3}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-dark-muted">
                    Siz tanladingiz:{' '}
                    <span className="text-brand-rose font-semibold line-through">
                      {item.chosen}
                    </span>{' '}
                    · To&apos;g&apos;risi:{' '}
                    <span className="text-brand-emerald font-semibold">{item.correct}</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              sound.playClick();
              startQuiz();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-95 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            Testni qayta topshirish
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col gap-3 w-full h-full roomy:h-auto overflow-hidden roomy:overflow-visible">
      <ModeIntro step={5} title="Test" hint={MODE_BY_ID.quiz.hint} />

      <div className="bg-dark-card border border-dark-border rounded-3xl p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 shadow-card w-full flex-1 min-h-0 roomy:flex-none">
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-dark-muted tabular-nums">
              {index + 1}-savol / {total}
            </span>
            <span className="text-dark-muted tabular-nums">
              To&apos;g&apos;ri: <span className="text-brand-emerald">{correctCount}</span>
            </span>
          </div>
          <div
            className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5"
            role="progressbar"
            aria-valuenow={index + 1}
            aria-valuemin={0}
            aria-valuemax={total}
          >
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full transition-[width] duration-300"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center flex flex-col items-center justify-center bg-black/20 border border-white/5 rounded-2xl p-3 sm:p-4 flex-1 min-h-0 roomy:flex-none overflow-hidden">
          <span className="text-[11px] font-semibold text-dark-muted uppercase tracking-wider mb-1.5">
            {question.prompt}
          </span>
          <h3 className="font-heading font-bold text-3xl sm:text-4xl text-white tracking-tight">
            {question.targetWord}
          </h3>
          <p className="text-sm font-medium text-slate-400 mt-1">{question.subtext}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 shrink-0">
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === question.correctAnswer;
            const isAnswered = selectedOption !== null;

            let btnStyle = 'bg-white/5 border-dark-border text-white hover:bg-white/10';
            if (isAnswered) {
              if (isCorrect) btnStyle = 'bg-brand-emerald/20 border-brand-emerald text-brand-emerald';
              else if (isSelected) btnStyle = 'bg-brand-rose/20 border-brand-rose text-brand-rose';
              else btnStyle = 'bg-white/5 border-dark-border text-dark-muted opacity-50';
            }

            return (
              <button
                key={option}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={`p-3.5 rounded-xl border font-heading text-lg font-bold transition-colors flex items-center justify-between gap-2 active:scale-98 min-h-[52px] ${btnStyle}`}
              >
                <span className="truncate">{option}</span>
                {isAnswered && isCorrect && <Check className="w-5 h-5 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <X className="w-5 h-5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

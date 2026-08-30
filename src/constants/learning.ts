import { TabType } from '@/types/verb';

/**
 * The three forms are the whole subject of this app, so each one keeps the same
 * colour, the same order and the same label in every mode. Learners should be
 * able to tell V2 from V3 by colour before they read the text.
 */
export const FORMS = {
  v1: {
    short: 'V1',
    grammar: 'Infinitive',
    uz: 'asosiy shakl',
    text: 'text-form-v1',
    bg: 'bg-form-v1/10',
    border: 'border-form-v1/30',
  },
  v2: {
    short: 'V2',
    grammar: 'Past Simple',
    uz: "o'tgan zamon",
    text: 'text-form-v2',
    bg: 'bg-form-v2/10',
    border: 'border-form-v2/30',
  },
  v3: {
    short: 'V3',
    grammar: 'Past Participle',
    uz: 'uchinchi shakl',
    text: 'text-form-v3',
    bg: 'bg-form-v3/10',
    border: 'border-form-v3/30',
  },
} as const;

export type FormKey = keyof typeof FORMS;

export interface ModeInfo {
  id: TabType;
  /** Position in the 5-step sequence; the dictionary sits outside it. */
  step: number | null;
  label: string;
  /** One line telling the learner what this screen asks of them. */
  hint: string;
}

export const MODES: ModeInfo[] = [
  {
    id: 'flashcards',
    step: 1,
    label: 'Kartochka',
    hint: "Kartani ochib uch shaklni ko'ring, keyin o'zingizni sinang.",
  },
  {
    id: 'matching',
    step: 2,
    label: 'Juftlash',
    hint: "Fe'lni o'z shakllari va tarjimasi bilan juftlang.",
  },
  {
    id: 'typing',
    step: 3,
    label: 'Yozish',
    hint: 'V2 va V3 shakllarini yoddan yozing — imlosi bilan.',
  },
  {
    id: 'speed',
    step: 4,
    label: 'Tezlik',
    hint: '60 soniyada imkon qadar ko‘p to‘g‘ri javob bering.',
  },
  {
    id: 'quiz',
    step: 5,
    label: 'Test',
    hint: '10 ta savol. Natija saqlanadi va yuqorida ko‘rinadi.',
  },
  {
    id: 'dictionary',
    step: null,
    label: 'Jadval',
    hint: "Barcha 116 ta fe'l: qidiring, tinglang, belgilab qo'ying.",
  },
];

export const MODE_BY_ID = Object.fromEntries(
  MODES.map((mode) => [mode.id, mode])
) as Record<TabType, ModeInfo>;

/** A verb counts as mastered after this many correct answers. */
export const MASTERY_TARGET = 5;

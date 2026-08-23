export interface Verb {
  id: number;
  v1: string;
  v2: string;
  v3: string;
  uz: string;
  example: string;
}

export type TabType = 'flashcards' | 'quiz' | 'typing' | 'matching' | 'speed' | 'dictionary';

export interface UserStats {
  mastered: number[];
  starred: number[];
  masteryProgress: Record<number, number>; // verbId -> 0..5
}

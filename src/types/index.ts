export type ChapterId = 'ch1' | 'ch4' | 'ch9' | 'ch10' | 'ch11' | 'ch12';

export type PageRoute =
  | 'dashboard'
  | 'labs'
  | 'proofs'
  | 'assignments'
  | 'knowledge'
  | 'exam';

export type LabTab =
  | 'logic'
  | 'number-theory'
  | 'relations'
  | 'graphs-trees'
  | 'boolean';

export type LangMode = 'en' | 'bilingual';
export type ThemeMode = 'light' | 'dark';
export type GeminiModelId = 'gemini-4-hydrogen' | 'gemini-4-argon' | 'gemini-4-carbon';

export interface ChapterMastery {
  correct: number;
  attempts: number;
}

export interface ExamAttemptRecord {
  id: string;
  seed: string;
  mode: 'full' | 'sprint';
  score: number;
  maxScore: number;
  dateIso: string;
  byChapter: Partial<Record<ChapterId, { earned: number; total: number }>>;
}

export interface ProgressState {
  mastery: Record<ChapterId, ChapterMastery>;
  completedAssignments: string[]; // e.g. "a1-q1a"
  completedProofs: string[];
  examHistory: ExamAttemptRecord[];
}

export interface AppSettings {
  lang: LangMode;
  theme: ThemeMode;
  geminiKey: string;
  geminiModel: GeminiModelId;
}

export const CHAPTER_META: Record<
  ChapterId,
  { code: string; title: string; titleVi: string; color: string }
> = {
  ch1: {
    code: 'Ch. 1',
    title: 'Logic & Proofs',
    titleVi: 'Logic & Chứng minh',
    color: 'indigo',
  },
  ch4: {
    code: 'Ch. 4',
    title: 'Number Theory & Crypto',
    titleVi: 'Số học & Mật mã',
    color: 'emerald',
  },
  ch9: {
    code: 'Ch. 9',
    title: 'Relations & Posets',
    titleVi: 'Quan hệ & Tập thứ tự bộ phận',
    color: 'amber',
  },
  ch10: {
    code: 'Ch. 10',
    title: 'Graphs & Shortest Paths',
    titleVi: 'Đồ thị & Đường đi ngắn nhất',
    color: 'sky',
  },
  ch11: {
    code: 'Ch. 11',
    title: 'Trees & MST',
    titleVi: 'Cây & Cây khung nhỏ nhất',
    color: 'rose',
  },
  ch12: {
    code: 'Ch. 12',
    title: 'Boolean Algebra & K-Maps',
    titleVi: 'Đại số Boolean & Bìa Karnaugh',
    color: 'violet',
  },
};

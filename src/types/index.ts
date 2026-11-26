export type SubjectId = 'mfc' | 'econ' | 'probstat';

export type ChapterId = 'ch1' | 'ch4' | 'ch9' | 'ch10' | 'ch11' | 'ch12';

export type EconTopicId = 'part6' | 'part7' | 'part8' | 'part9';

export type PageRoute =
  | 'dashboard'
  | 'labs'
  | 'proofs'
  | 'assignments'
  | 'knowledge'
  | 'exam';

export type EconPageRoute = 'dashboard' | 'labs' | 'drill' | 'knowledge' | 'exam';

export type LabTab =
  | 'logic'
  | 'number-theory'
  | 'relations'
  | 'graphs-trees'
  | 'boolean';

export type EconLabTab = 'part6' | 'part7' | 'part8' | 'part9';

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
  mode: string;
  score: number;
  maxScore: number;
  dateIso: string;
  byChapter: Record<string, { earned: number; total: number }>;
}

export interface ProgressState {
  mastery: Record<ChapterId, ChapterMastery>;
  econMastery: Record<EconTopicId, ChapterMastery>;
  completedAssignments: string[];
  completedProofs: string[];
  completedEconScenarios: string[];
  examHistory: ExamAttemptRecord[];
  econExamHistory: ExamAttemptRecord[];
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

export const ECON_TOPIC_META: Record<
  EconTopicId,
  { code: string; quizTag: string; title: string; titleVi: string }
> = {
  part6: {
    code: 'Part 6 · Ch. 23–26, 28',
    quizTag: 'Quiz 3',
    title: 'The Real Economy in the Long Run',
    titleVi: 'Nền kinh tế thực trong dài hạn (GDP, CPI, Tăng trưởng, Tiết kiệm, Thất nghiệp)',
  },
  part7: {
    code: 'Part 7 · Ch. 29–30',
    quizTag: 'Quiz 4',
    title: 'Money & Prices in the Long Run',
    titleVi: 'Tiền tệ & Giá cả trong dài hạn (Ngân hàng, Số nhân tiền, MV=PY, Lạm phát)',
  },
  part8: {
    code: 'Part 8 · Ch. 31–32',
    quizTag: 'Quiz 4',
    title: 'Macroeconomics of Open Economies',
    titleVi: 'Kinh tế vĩ mô của nền kinh tế mở (NCO=NX, Tỷ giá thực, PPP, Hai thị trường)',
  },
  part9: {
    code: 'Part 9 · Ch. 33–35',
    quizTag: 'Quiz 5',
    title: 'Short-Run Fluctuations & Stabilization',
    titleVi: 'Biến động ngắn hạn & Chính sách ổn định (AD–AS, Số nhân, Đường Phillips)',
  },
};

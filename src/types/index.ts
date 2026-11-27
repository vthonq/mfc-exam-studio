export type SubjectId = 'mfc' | 'econ' | 'probstat';

export type ChapterId = 'ch1' | 'ch4' | 'ch9' | 'ch10' | 'ch11' | 'ch12';

export type EconTopicId = 'part6' | 'part7' | 'part8' | 'part9';

export type ProbTopicId = 'ps-ch1' | 'ps-ch2' | 'ps-ch3' | 'ps-ch4' | 'ps-ch5';

export type PageRoute =
  | 'dashboard'
  | 'labs'
  | 'proofs'
  | 'assignments'
  | 'knowledge'
  | 'exam';

export type EconPageRoute = 'dashboard' | 'labs' | 'drill' | 'knowledge' | 'exam';

export type ProbPageRoute =
  | 'dashboard'
  | 'tables'
  | 'labs'
  | 'problems'
  | 'knowledge'
  | 'exam';

export type LabTab =
  | 'logic'
  | 'number-theory'
  | 'relations'
  | 'graphs-trees'
  | 'boolean'
  | 'trainers';

export type EconLabTab = 'part6' | 'part7' | 'part8' | 'part9' | 'trainer';

export type ProbLabTab = 'discrete' | 'continuous' | 'bivariate' | 'inference';

export type LangMode = 'en' | 'bilingual';
export type ThemeMode = 'light' | 'dark';
export type StudioPalette = 'obsidian' | 'paper' | 'forest' | 'indigo';
export type GeminiModelId =
  | 'gemini-4-hydrogen'
  | 'gemini-4-argon'
  | 'gemini-4-carbon'
  | 'gemini-3.5-flash-lite';

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

export interface MistakeItem {
  id: string;
  subject: SubjectId;
  topicLabel: string;
  question: string;
  choices?: string[];
  correctIndex?: number;
  expectedText?: string;
  userAnswerText?: string;
  explanation: string;
  savedAtIso: string;
  source: 'mistake' | 'bookmark';
}

export interface CustomFlashcard {
  id: string;
  subject: SubjectId;
  badge: string;
  front: string;
  back: string;
  trap?: string;
  createdAtIso: string;
}

export interface ProgressState {
  mastery: Record<ChapterId, ChapterMastery>;
  econMastery: Record<EconTopicId, ChapterMastery>;
  probMastery: Record<ProbTopicId, ChapterMastery>;
  completedAssignments: string[];
  completedProofs: string[];
  completedEconScenarios: string[];
  completedProbProblems: string[];
  examHistory: ExamAttemptRecord[];
  econExamHistory: ExamAttemptRecord[];
  probExamHistory: ExamAttemptRecord[];
  mistakes: MistakeItem[];
  customCards?: CustomFlashcard[];
  examDates?: Partial<Record<SubjectId, string>>;
  studyStreak?: { count: number; lastDate: string };
}

export interface AppSettings {
  lang: LangMode;
  theme: ThemeMode;
  palette?: StudioPalette;
  sidebarCollapsed?: boolean;
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

export const PROB_TOPIC_META: Record<
  ProbTopicId,
  { code: string; title: string; titleVi: string; examTag: string }
> = {
  'ps-ch1': {
    code: 'Ch. 1',
    title: 'Discrete Random Variables',
    titleVi: 'Biến ngẫu nhiên rời rạc (Binomial, Poisson, Geometric, NB, Hypergeometric)',
    examTag: 'Midterm + Final',
  },
  'ps-ch2': {
    code: 'Ch. 2',
    title: 'Continuous Random Variables',
    titleVi: 'Biến ngẫu nhiên liên tục (Uniform, Normal, Exponential, Gamma, χ²)',
    examTag: 'Midterm + Final',
  },
  'ps-ch3': {
    code: 'Ch. 3',
    title: 'Bivariate Distributions',
    titleVi: 'Phân phối hai chiều (Biên, Điều kiện, Độc lập, Hiệp phương sai, Tương quan)',
    examTag: 'Midterm + Final',
  },
  'ps-ch4': {
    code: 'Ch. 4',
    title: 'Random Samples & Estimation',
    titleVi: 'Mẫu ngẫu nhiên & Ước lượng (MoM, MLE, LLN, CLT, Phân phối mẫu)',
    examTag: 'Final',
  },
  'ps-ch5': {
    code: 'Ch. 5',
    title: 'Confidence Intervals & Hypothesis Tests',
    titleVi: 'Khoảng tin cậy & Kiểm định giả thuyết (Z, t, Tỷ lệ, χ², p-value, Power)',
    examTag: 'Final',
  },
};

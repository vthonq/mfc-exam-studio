export type SubjectId = 'mfc' | 'econ' | 'probstat';

export type ChapterId = 'ch1' | 'ch4' | 'ch9' | 'ch10' | 'ch11' | 'ch12';

export type EconTopicId =
  | 'macro-gdp-cpi'
  | 'macro-growth-saving-unemp'
  | 'macro-money-inflation'
  | 'macro-open-econ'
  | 'macro-adas-policy-phillips'
  | 'micro-supply-elasticity-tax'
  | 'micro-costs-markets';

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

export type EconLabTab =
  | 'gdp-cpi'
  | 'money-saving'
  | 'open-econ'
  | 'adas-phillips'
  | 'micro';

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
  { code: string; scope: 'Macro Final' | 'Micro Midterm'; title: string; titleVi: string }
> = {
  'macro-gdp-cpi': {
    code: 'Ch. 23–24',
    scope: 'Macro Final',
    title: 'GDP, Deflator & Cost of Living (CPI)',
    titleVi: 'GDP, Chỉ số giảm phát & Chỉ số giá CPI',
  },
  'macro-growth-saving-unemp': {
    code: 'Ch. 25–26, 28',
    scope: 'Macro Final',
    title: 'Growth, Saving/Loanable Funds & Unemployment',
    titleVi: 'Tăng trưởng, Tiết kiệm/Vốn vay & Thất nghiệp',
  },
  'macro-money-inflation': {
    code: 'Ch. 29–30',
    scope: 'Macro Final',
    title: 'Monetary System, Money Growth & Inflation',
    titleVi: 'Hệ thống tiền tệ, Cung tiền & Lạm phát',
  },
  'macro-open-econ': {
    code: 'Ch. 31–32',
    scope: 'Macro Final',
    title: 'Open-Economy, Exchange Rates & Twin Markets',
    titleVi: 'Kinh tế mở, Tỷ giá & Mô hình hai thị trường',
  },
  'macro-adas-policy-phillips': {
    code: 'Ch. 33–35',
    scope: 'Macro Final',
    title: 'AD–AS, Fiscal/Monetary Policy & Phillips Curve',
    titleVi: 'AD–AS, Chính sách tài khóa/tiền tệ & Đường Phillips',
  },
  'micro-supply-elasticity-tax': {
    code: 'Micro Ch. 1–9',
    scope: 'Micro Midterm',
    title: 'Trade, Supply/Demand, Elasticity, Welfare & Tax',
    titleVi: 'Thương mại, Cung–Cầu, Co giãn, Thặng dư & Thuế',
  },
  'micro-costs-markets': {
    code: 'Micro Ch. 13–17, 21',
    scope: 'Micro Midterm',
    title: 'Costs, Competition, Monopoly, Oligopoly & Choice',
    titleVi: 'Chi phí, Cạnh tranh, Độc quyền & Lựa chọn tiêu dùng',
  },
};

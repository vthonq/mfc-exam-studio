import React, { createContext, useContext, useEffect, useState } from 'react';
import type {
  AppSettings,
  ChapterId,
  EconTopicId,
  ExamAttemptRecord,
  GeminiModelId,
  LangMode,
  ProgressState,
  ThemeMode,
} from '../types';

const SETTINGS_KEY = 'mfc_studio_settings_v1';
const PROGRESS_KEY = 'mfc_studio_progress_v1';

const DEFAULT_SETTINGS: AppSettings = {
  lang: 'bilingual',
  theme: 'light',
  geminiKey: '',
  geminiModel: 'gemini-4-hydrogen',
};

const DEFAULT_ECON_MASTERY: ProgressState['econMastery'] = {
  part6: { correct: 0, attempts: 0 },
  part7: { correct: 0, attempts: 0 },
  part8: { correct: 0, attempts: 0 },
  part9: { correct: 0, attempts: 0 },
};

const DEFAULT_PROGRESS: ProgressState = {
  mastery: {
    ch1: { correct: 0, attempts: 0 },
    ch4: { correct: 0, attempts: 0 },
    ch9: { correct: 0, attempts: 0 },
    ch10: { correct: 0, attempts: 0 },
    ch11: { correct: 0, attempts: 0 },
    ch12: { correct: 0, attempts: 0 },
  },
  econMastery: { ...DEFAULT_ECON_MASTERY },
  completedAssignments: [],
  completedProofs: [],
  completedEconScenarios: [],
  examHistory: [],
  econExamHistory: [],
};

interface AppContextValue {
  settings: AppSettings;
  progress: ProgressState;
  setLang: (lang: LangMode) => void;
  setTheme: (theme: ThemeMode) => void;
  setGeminiKey: (key: string) => void;
  setGeminiModel: (model: GeminiModelId) => void;
  recordPractice: (chapter: ChapterId, isCorrect: boolean) => void;
  recordEconPractice: (topic: EconTopicId, isCorrect: boolean) => void;
  toggleAssignmentDone: (id: string) => void;
  markProofDone: (id: string) => void;
  markEconScenarioDone: (id: string) => void;
  addExamRecord: (record: ExamAttemptRecord) => void;
  addEconExamRecord: (record: ExamAttemptRecord) => void;
  exportProgressJson: () => string;
  importProgressJson: (json: string) => boolean;
  resetProgress: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function hydrateProgress(rawObj: Partial<ProgressState> | null | undefined): ProgressState {
  if (!rawObj || typeof rawObj !== 'object') return DEFAULT_PROGRESS;
  return {
    mastery: { ...DEFAULT_PROGRESS.mastery, ...(rawObj.mastery || {}) },
    econMastery: { ...DEFAULT_ECON_MASTERY, ...(rawObj.econMastery || {}) },
    completedAssignments: Array.isArray(rawObj.completedAssignments)
      ? rawObj.completedAssignments
      : [],
    completedProofs: Array.isArray(rawObj.completedProofs) ? rawObj.completedProofs : [],
    completedEconScenarios: Array.isArray(rawObj.completedEconScenarios)
      ? rawObj.completedEconScenarios
      : [],
    examHistory: Array.isArray(rawObj.examHistory) ? rawObj.examHistory : [],
    econExamHistory: Array.isArray(rawObj.econExamHistory) ? rawObj.econExamHistory : [],
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch {
      // ignore malformed storage
    }
    return DEFAULT_SETTINGS;
  });

  const [progress, setProgress] = useState<ProgressState>(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        return hydrateProgress(JSON.parse(raw));
      }
    } catch {
      // ignore malformed storage
    }
    return DEFAULT_PROGRESS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore quota
    }
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // ignore quota
    }
  }, [progress]);

  const setLang = (lang: LangMode) => setSettings((s) => ({ ...s, lang }));
  const setTheme = (theme: ThemeMode) => setSettings((s) => ({ ...s, theme }));
  const setGeminiKey = (geminiKey: string) => setSettings((s) => ({ ...s, geminiKey }));
  const setGeminiModel = (geminiModel: GeminiModelId) =>
    setSettings((s) => ({ ...s, geminiModel }));

  const recordPractice = (chapter: ChapterId, isCorrect: boolean) => {
    setProgress((p) => ({
      ...p,
      mastery: {
        ...p.mastery,
        [chapter]: {
          correct: p.mastery[chapter].correct + (isCorrect ? 1 : 0),
          attempts: p.mastery[chapter].attempts + 1,
        },
      },
    }));
  };

  const recordEconPractice = (topic: EconTopicId, isCorrect: boolean) => {
    setProgress((p) => ({
      ...p,
      econMastery: {
        ...p.econMastery,
        [topic]: {
          correct: (p.econMastery[topic]?.correct ?? 0) + (isCorrect ? 1 : 0),
          attempts: (p.econMastery[topic]?.attempts ?? 0) + 1,
        },
      },
    }));
  };

  const toggleAssignmentDone = (id: string) => {
    setProgress((p) => {
      const exists = p.completedAssignments.includes(id);
      return {
        ...p,
        completedAssignments: exists
          ? p.completedAssignments.filter((x) => x !== id)
          : [...p.completedAssignments, id],
      };
    });
  };

  const markProofDone = (id: string) => {
    setProgress((p) => {
      if (p.completedProofs.includes(id)) return p;
      return { ...p, completedProofs: [...p.completedProofs, id] };
    });
  };

  const markEconScenarioDone = (id: string) => {
    setProgress((p) => {
      if (p.completedEconScenarios.includes(id)) return p;
      return { ...p, completedEconScenarios: [...p.completedEconScenarios, id] };
    });
  };

  const addExamRecord = (record: ExamAttemptRecord) => {
    setProgress((p) => ({
      ...p,
      examHistory: [record, ...p.examHistory].slice(0, 20),
    }));
  };

  const addEconExamRecord = (record: ExamAttemptRecord) => {
    setProgress((p) => ({
      ...p,
      econExamHistory: [record, ...p.econExamHistory].slice(0, 20),
    }));
  };

  const exportProgressJson = () => JSON.stringify(progress, null, 2);

  const importProgressJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object' || !parsed.mastery) return false;
      setProgress(hydrateProgress(parsed));
      return true;
    } catch {
      return false;
    }
  };

  const resetProgress = () => setProgress(DEFAULT_PROGRESS);

  return (
    <AppContext.Provider
      value={{
        settings,
        progress,
        setLang,
        setTheme,
        setGeminiKey,
        setGeminiModel,
        recordPractice,
        recordEconPractice,
        toggleAssignmentDone,
        markProofDone,
        markEconScenarioDone,
        addExamRecord,
        addEconExamRecord,
        exportProgressJson,
        importProgressJson,
        resetProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

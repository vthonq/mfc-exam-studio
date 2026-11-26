import React, { createContext, useContext, useEffect, useState } from 'react';
import type {
  AppSettings,
  ChapterId,
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

const DEFAULT_PROGRESS: ProgressState = {
  mastery: {
    ch1: { correct: 0, attempts: 0 },
    ch4: { correct: 0, attempts: 0 },
    ch9: { correct: 0, attempts: 0 },
    ch10: { correct: 0, attempts: 0 },
    ch11: { correct: 0, attempts: 0 },
    ch12: { correct: 0, attempts: 0 },
  },
  completedAssignments: [],
  completedProofs: [],
  examHistory: [],
};

interface AppContextValue {
  settings: AppSettings;
  progress: ProgressState;
  setLang: (lang: LangMode) => void;
  setTheme: (theme: ThemeMode) => void;
  setGeminiKey: (key: string) => void;
  setGeminiModel: (model: GeminiModelId) => void;
  recordPractice: (chapter: ChapterId, isCorrect: boolean) => void;
  toggleAssignmentDone: (id: string) => void;
  markProofDone: (id: string) => void;
  addExamRecord: (record: ExamAttemptRecord) => void;
  exportProgressJson: () => string;
  importProgressJson: (json: string) => boolean;
  resetProgress: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

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
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_PROGRESS,
          ...parsed,
          mastery: { ...DEFAULT_PROGRESS.mastery, ...(parsed.mastery || {}) },
        };
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

  const addExamRecord = (record: ExamAttemptRecord) => {
    setProgress((p) => ({
      ...p,
      examHistory: [record, ...p.examHistory].slice(0, 20),
    }));
  };

  const exportProgressJson = () => JSON.stringify(progress, null, 2);

  const importProgressJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object' || !parsed.mastery) return false;
      setProgress({
        ...DEFAULT_PROGRESS,
        ...parsed,
        mastery: { ...DEFAULT_PROGRESS.mastery, ...parsed.mastery },
      });
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
        toggleAssignmentDone,
        markProofDone,
        addExamRecord,
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

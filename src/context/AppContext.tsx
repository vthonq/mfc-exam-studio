import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { fetchCloudProgress, saveCloudProgress } from '../services/accessControl';
import { DEFAULT_PALETTE, getPaletteMeta, resolvePalette } from '../utils/studioTheme';
import { reviewSrsCard } from '../utils/spacedRepetition';
import type {
  AppSettings,
  ChapterId,
  CustomFlashcard,
  EconTopicId,
  ExamAttemptRecord,
  GeminiModelId,
  LangMode,
  MistakeItem,
  ProbTopicId,
  ProgressState,
  SrsRating,
  StudioPalette,
  SubjectId,
  ThemeMode,
} from '../types';

const SETTINGS_KEY = 'mfc_studio_settings_v1';
const LEGACY_PROGRESS_KEY = 'mfc_studio_progress_v1';
const LEGACY_OWNER_KEY = 'mfc_studio_legacy_owner_v1';

function progressKeyFor(uid?: string | null): string {
  return uid ? `mfc_studio_progress_v1:${uid}` : LEGACY_PROGRESS_KEY;
}

function progressTsKeyFor(uid?: string | null): string {
  return uid ? `mfc_studio_progress_ts_v1:${uid}` : 'mfc_studio_progress_ts_v1';
}

function loadLocalProgressForUid(uid?: string | null): ProgressState {
  try {
    const scopedRaw = localStorage.getItem(progressKeyFor(uid));
    if (scopedRaw) {
      return hydrateProgress(JSON.parse(scopedRaw));
    }
    if (uid) {
      const legacyOwner = localStorage.getItem(LEGACY_OWNER_KEY);
      if (!legacyOwner || legacyOwner === uid) {
        const legacyRaw = localStorage.getItem(LEGACY_PROGRESS_KEY);
        if (legacyRaw) {
          const parsed = hydrateProgress(JSON.parse(legacyRaw));
          localStorage.setItem(LEGACY_OWNER_KEY, uid);
          localStorage.setItem(progressKeyFor(uid), JSON.stringify(parsed));
          return parsed;
        }
      }
    }
  } catch {
    // ignore malformed storage
  }
  return DEFAULT_PROGRESS;
}

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function bumpStudyStreak(
  current?: { count: number; lastDate: string },
  now = new Date(),
): { count: number; lastDate: string } {
  const today = localDateKey(now);
  if (current?.lastDate === today) {
    return { count: Math.max(1, current.count || 1), lastDate: today };
  }
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  const yesterday = localDateKey(yest);
  if (current?.lastDate === yesterday) {
    return { count: (current.count || 0) + 1, lastDate: today };
  }
  return { count: 1, lastDate: today };
}

function hasMeaningfulProgress(p: ProgressState): boolean {
  const mCount =
    Object.values(p.mastery).reduce((s, x) => s + x.attempts, 0) +
    Object.values(p.econMastery).reduce((s, x) => s + x.attempts, 0) +
    Object.values(p.probMastery).reduce((s, x) => s + x.attempts, 0);
  if (mCount > 0) return true;
  if (p.examDates && Object.values(p.examDates).some((v) => Boolean(v?.trim()))) return true;
  if ((p.studyStreak?.count ?? 0) > 0) return true;
  if ((p.customCards?.length ?? 0) > 0) return true;
  if (p.flashcardSrs && Object.keys(p.flashcardSrs).length > 0) return true;
  return (
    p.completedAssignments.length > 0 ||
    p.completedProofs.length > 0 ||
    p.completedEconScenarios.length > 0 ||
    p.completedProbProblems.length > 0 ||
    p.examHistory.length > 0 ||
    p.econExamHistory.length > 0 ||
    p.probExamHistory.length > 0 ||
    p.mistakes.length > 0
  );
}

const DEFAULT_SETTINGS: AppSettings = {
  lang: 'bilingual',
  theme: 'dark',
  palette: DEFAULT_PALETTE,
  sidebarCollapsed: false,
  geminiKey: '',
  geminiModel: 'gemini-4-hydrogen',
};

const DEFAULT_ECON_MASTERY: ProgressState['econMastery'] = {
  part6: { correct: 0, attempts: 0 },
  part7: { correct: 0, attempts: 0 },
  part8: { correct: 0, attempts: 0 },
  part9: { correct: 0, attempts: 0 },
};

const DEFAULT_PROB_MASTERY: ProgressState['probMastery'] = {
  'ps-ch1': { correct: 0, attempts: 0 },
  'ps-ch2': { correct: 0, attempts: 0 },
  'ps-ch3': { correct: 0, attempts: 0 },
  'ps-ch4': { correct: 0, attempts: 0 },
  'ps-ch5': { correct: 0, attempts: 0 },
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
  probMastery: { ...DEFAULT_PROB_MASTERY },
  completedAssignments: [],
  completedProofs: [],
  completedEconScenarios: [],
  completedProbProblems: [],
  examHistory: [],
  econExamHistory: [],
  probExamHistory: [],
  mistakes: [],
  customCards: [],
  flashcardSrs: {},
  examDates: {},
  studyStreak: { count: 0, lastDate: '' },
};

interface AppContextValue {
  settings: AppSettings;
  progress: ProgressState;
  cloudSyncStatus: CloudSyncStatus;
  setLang: (lang: LangMode) => void;
  setTheme: (theme: ThemeMode) => void;
  setPalette: (palette: StudioPalette) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setGeminiKey: (key: string) => void;
  setGeminiModel: (model: GeminiModelId) => void;
  recordPractice: (chapter: ChapterId, isCorrect: boolean) => void;
  recordEconPractice: (topic: EconTopicId, isCorrect: boolean) => void;
  recordProbPractice: (topic: ProbTopicId, isCorrect: boolean) => void;
  toggleAssignmentDone: (id: string) => void;
  markProofDone: (id: string) => void;
  markEconScenarioDone: (id: string) => void;
  markProbProblemDone: (id: string) => void;
  addExamRecord: (record: ExamAttemptRecord) => void;
  addEconExamRecord: (record: ExamAttemptRecord) => void;
  addProbExamRecord: (record: ExamAttemptRecord) => void;
  recordMistake: (item: Omit<MistakeItem, 'savedAtIso'>) => void;
  removeMistake: (id: string) => void;
  clearMistakes: (subject?: SubjectId) => void;
  addCustomCard: (card: Omit<CustomFlashcard, 'id' | 'createdAtIso'>) => void;
  importCustomCards: (cards: CustomFlashcard[]) => number;
  removeCustomCard: (id: string) => void;
  clearCustomCards: (subject?: SubjectId) => void;
  rateFlashcard: (cardId: string, rating: SrsRating) => void;
  setExamDate: (subject: SubjectId, dateIso: string) => void;
  recordStudyActivity: () => void;
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
    probMastery: { ...DEFAULT_PROB_MASTERY, ...(rawObj.probMastery || {}) },
    completedAssignments: Array.isArray(rawObj.completedAssignments)
      ? rawObj.completedAssignments
      : [],
    completedProofs: Array.isArray(rawObj.completedProofs) ? rawObj.completedProofs : [],
    completedEconScenarios: Array.isArray(rawObj.completedEconScenarios)
      ? rawObj.completedEconScenarios
      : [],
    completedProbProblems: Array.isArray(rawObj.completedProbProblems)
      ? rawObj.completedProbProblems
      : [],
    examHistory: Array.isArray(rawObj.examHistory) ? rawObj.examHistory : [],
    econExamHistory: Array.isArray(rawObj.econExamHistory) ? rawObj.econExamHistory : [],
    probExamHistory: Array.isArray(rawObj.probExamHistory) ? rawObj.probExamHistory : [],
    mistakes: Array.isArray(rawObj.mistakes) ? rawObj.mistakes : [],
    customCards: Array.isArray(rawObj.customCards) ? rawObj.customCards : [],
    flashcardSrs:
      rawObj.flashcardSrs && typeof rawObj.flashcardSrs === 'object'
        ? { ...rawObj.flashcardSrs }
        : {},
    examDates:
      rawObj.examDates && typeof rawObj.examDates === 'object' ? { ...rawObj.examDates } : {},
    studyStreak:
      rawObj.studyStreak && typeof rawObj.studyStreak === 'object'
        ? {
            count: Number(rawObj.studyStreak.count) || 0,
            lastDate: String(rawObj.studyStreak.lastDate || ''),
          }
        : { count: 0, lastDate: '' },
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, profile, isAdmin } = useAuth();
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('idle');
  const hydratedUidRef = useRef<string | null>(null);
  const skipNextCloudSaveRef = useRef<boolean>(false);
  const firstMountEffectRef = useRef<boolean>(true);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        const palette = resolvePalette(parsed);
        const theme = getPaletteMeta(palette).theme;
        return { ...DEFAULT_SETTINGS, ...parsed, palette, theme };
      }
    } catch {
      // ignore malformed storage
    }
    return DEFAULT_SETTINGS;
  });

  const lastDarkPaletteRef = useRef<StudioPalette>(
    settings.palette && settings.palette !== 'paper' ? settings.palette : DEFAULT_PALETTE,
  );

  const [progress, setProgress] = useState<ProgressState>(() =>
    loadLocalProgressForUid(firebaseUser?.uid),
  );

  const progressRef = useRef<ProgressState>(progress);
  progressRef.current = progress;
  const activeUidRef = useRef<string | undefined>(firebaseUser?.uid);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore quota
    }
    const root = document.documentElement;
    const activePalette = resolvePalette(settings);
    const meta = getPaletteMeta(activePalette);
    root.dataset.palette = activePalette;
    root.classList.toggle('dark', meta.theme === 'dark');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', meta.metaThemeColor);
    }
  }, [settings]);

  const canUseCloud = Boolean(
    firebaseUser?.uid && (isAdmin || profile?.status === 'approved'),
  );

  // Sync on login / user switch (isolated per-uid storage prevents shared-browser leakage)
  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (activeUidRef.current !== uid) {
      activeUidRef.current = uid;
      skipNextCloudSaveRef.current = true;
      const isolatedLocal = loadLocalProgressForUid(uid);
      progressRef.current = isolatedLocal;
      setProgress(isolatedLocal);
    }

    if (!uid || !canUseCloud) {
      hydratedUidRef.current = null;
      setCloudSyncStatus('idle');
      return;
    }
    if (hydratedUidRef.current === uid) return;

    let cancelled = false;
    setCloudSyncStatus('syncing');

    void (async () => {
      try {
        const cloud = await fetchCloudProgress(uid);
        if (cancelled) return;
        const tsKey = progressTsKeyFor(uid);
        const localTs = Number(localStorage.getItem(tsKey) || '0') || 0;

        if (cloud) {
          let cloudParsed: Partial<ProgressState> | null = null;
          try {
            cloudParsed = JSON.parse(cloud.progressJson) as Partial<ProgressState>;
          } catch {
            cloudParsed = null;
          }
          if (
            cloudParsed &&
            cloudParsed.mastery &&
            (cloud.updatedAtMs > localTs || !hasMeaningfulProgress(progressRef.current))
          ) {
            skipNextCloudSaveRef.current = true;
            setProgress(hydrateProgress(cloudParsed));
            try {
              localStorage.setItem(tsKey, String(cloud.updatedAtMs));
            } catch {
              // ignore
            }
          } else if (hasMeaningfulProgress(progressRef.current) && localTs > cloud.updatedAtMs) {
            await saveCloudProgress(uid, JSON.stringify(progressRef.current), localTs);
          }
        } else if (hasMeaningfulProgress(progressRef.current)) {
          const ts = localTs || Date.now();
          await saveCloudProgress(uid, JSON.stringify(progressRef.current), ts);
        }

        if (!cancelled) {
          hydratedUidRef.current = uid;
          setCloudSyncStatus('synced');
        }
      } catch {
        if (!cancelled) {
          hydratedUidRef.current = uid;
          setCloudSyncStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [firebaseUser?.uid, canUseCloud]);

  // Persist locally (scoped by uid) & debounced save to Firestore
  useEffect(() => {
    const uid = firebaseUser?.uid;
    try {
      localStorage.setItem(progressKeyFor(uid), JSON.stringify(progress));
    } catch {
      // ignore quota
    }

    if (firstMountEffectRef.current) {
      firstMountEffectRef.current = false;
      return;
    }

    if (skipNextCloudSaveRef.current) {
      skipNextCloudSaveRef.current = false;
      return;
    }

    const nowTs = Date.now();
    try {
      localStorage.setItem(progressTsKeyFor(uid), String(nowTs));
    } catch {
      // ignore
    }

    if (!uid || !canUseCloud || hydratedUidRef.current !== uid) return;

    setCloudSyncStatus('syncing');
    const timer = window.setTimeout(() => {
      void saveCloudProgress(uid, JSON.stringify(progress), nowTs)
        .then(() => setCloudSyncStatus('synced'))
        .catch(() => setCloudSyncStatus('error'));
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [progress, firebaseUser?.uid, canUseCloud]);

  const setLang = (lang: LangMode) => setSettings((s) => ({ ...s, lang }));
  const setPalette = (palette: StudioPalette) => {
    const meta = getPaletteMeta(palette);
    if (meta.theme === 'dark') {
      lastDarkPaletteRef.current = palette;
    }
    setSettings((s) => ({ ...s, palette, theme: meta.theme }));
  };
  const setTheme = (theme: ThemeMode) => {
    const nextPalette = theme === 'light' ? 'paper' : lastDarkPaletteRef.current;
    setSettings((s) => ({ ...s, theme, palette: nextPalette }));
  };
  const setSidebarCollapsed = (sidebarCollapsed: boolean) =>
    setSettings((s) => ({ ...s, sidebarCollapsed }));
  const setGeminiKey = (geminiKey: string) => setSettings((s) => ({ ...s, geminiKey }));
  const setGeminiModel = (geminiModel: GeminiModelId) =>
    setSettings((s) => ({ ...s, geminiModel }));

  const recordPractice = (chapter: ChapterId, isCorrect: boolean) => {
    setProgress((p) => ({
      ...p,
      studyStreak: bumpStudyStreak(p.studyStreak),
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
      studyStreak: bumpStudyStreak(p.studyStreak),
      econMastery: {
        ...p.econMastery,
        [topic]: {
          correct: (p.econMastery[topic]?.correct ?? 0) + (isCorrect ? 1 : 0),
          attempts: (p.econMastery[topic]?.attempts ?? 0) + 1,
        },
      },
    }));
  };

  const recordProbPractice = (topic: ProbTopicId, isCorrect: boolean) => {
    setProgress((p) => ({
      ...p,
      studyStreak: bumpStudyStreak(p.studyStreak),
      probMastery: {
        ...p.probMastery,
        [topic]: {
          correct: (p.probMastery[topic]?.correct ?? 0) + (isCorrect ? 1 : 0),
          attempts: (p.probMastery[topic]?.attempts ?? 0) + 1,
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

  const markProbProblemDone = (id: string) => {
    setProgress((p) => {
      if (p.completedProbProblems.includes(id)) return p;
      return { ...p, completedProbProblems: [...p.completedProbProblems, id] };
    });
  };

  const addExamRecord = (record: ExamAttemptRecord) => {
    setProgress((p) => ({
      ...p,
      studyStreak: bumpStudyStreak(p.studyStreak),
      examHistory: [record, ...p.examHistory].slice(0, 20),
    }));
  };

  const addEconExamRecord = (record: ExamAttemptRecord) => {
    setProgress((p) => ({
      ...p,
      studyStreak: bumpStudyStreak(p.studyStreak),
      econExamHistory: [record, ...p.econExamHistory].slice(0, 20),
    }));
  };

  const addProbExamRecord = (record: ExamAttemptRecord) => {
    setProgress((p) => ({
      ...p,
      studyStreak: bumpStudyStreak(p.studyStreak),
      probExamHistory: [record, ...p.probExamHistory].slice(0, 20),
    }));
  };

  const setExamDate = (subject: SubjectId, dateIso: string) => {
    const trimmed = dateIso.trim();
    setProgress((p) => {
      const nextDates = { ...(p.examDates ?? {}) };
      if (trimmed) nextDates[subject] = trimmed;
      else delete nextDates[subject];
      return { ...p, examDates: nextDates };
    });
  };

  const recordStudyActivity = () => {
    setProgress((p) => ({
      ...p,
      studyStreak: bumpStudyStreak(p.studyStreak),
    }));
  };

  const recordMistake = (item: Omit<MistakeItem, 'savedAtIso'>) => {
    const nextItem: MistakeItem = {
      ...item,
      savedAtIso: new Date().toISOString(),
    };
    setProgress((p) => ({
      ...p,
      mistakes: [nextItem, ...p.mistakes.filter((m) => m.id !== item.id)].slice(0, 120),
    }));
  };

  const removeMistake = (id: string) => {
    setProgress((p) => ({
      ...p,
      mistakes: p.mistakes.filter((m) => m.id !== id),
    }));
  };

  const clearMistakes = (subject?: SubjectId) => {
    setProgress((p) => ({
      ...p,
      mistakes: subject ? p.mistakes.filter((m) => m.subject !== subject) : [],
    }));
  };

  const addCustomCard = (card: Omit<CustomFlashcard, 'id' | 'createdAtIso'>) => {
    const nextCard: CustomFlashcard = {
      ...card,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAtIso: new Date().toISOString(),
    };
    setProgress((p) => ({
      ...p,
      customCards: [nextCard, ...(p.customCards ?? [])].slice(0, 150),
    }));
  };

  const importCustomCards = (cards: CustomFlashcard[]): number => {
    if (cards.length === 0) return 0;
    setProgress((p) => {
      const existing = p.customCards ?? [];
      const existingKeys = new Set(
        existing.map((c) => `${c.subject}:${c.front.trim().toLowerCase()}`),
      );
      const uniqueNew = cards.filter(
        (c) => !existingKeys.has(`${c.subject}:${c.front.trim().toLowerCase()}`),
      );
      return {
        ...p,
        customCards: [...uniqueNew, ...existing].slice(0, 150),
      };
    });
    return cards.length;
  };

  const removeCustomCard = (id: string) => {
    setProgress((p) => ({
      ...p,
      customCards: (p.customCards ?? []).filter((c) => c.id !== id),
    }));
  };

  const clearCustomCards = (subject?: SubjectId) => {
    setProgress((p) => ({
      ...p,
      customCards: subject
        ? (p.customCards ?? []).filter((c) => c.subject !== subject)
        : [],
    }));
  };

  const rateFlashcard = (cardId: string, rating: SrsRating) => {
    setProgress((p) => {
      const currentMap = p.flashcardSrs ?? {};
      const nextState = reviewSrsCard(currentMap[cardId], rating);
      return {
        ...p,
        studyStreak: bumpStudyStreak(p.studyStreak),
        flashcardSrs: {
          ...currentMap,
          [cardId]: nextState,
        },
      };
    });
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
        cloudSyncStatus,
        setLang,
        setTheme,
        setPalette,
        setSidebarCollapsed,
        setGeminiKey,
        setGeminiModel,
        recordPractice,
        recordEconPractice,
        recordProbPractice,
        toggleAssignmentDone,
        markProofDone,
        markEconScenarioDone,
        markProbProblemDone,
        addExamRecord,
        addEconExamRecord,
        addProbExamRecord,
        recordMistake,
        removeMistake,
        clearMistakes,
        addCustomCard,
        importCustomCards,
        removeCustomCard,
        clearCustomCards,
        rateFlashcard,
        setExamDate,
        recordStudyActivity,
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

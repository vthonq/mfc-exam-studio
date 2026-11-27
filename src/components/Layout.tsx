import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  BookmarkCheck,
  Calculator,
  Check,
  ClipboardCheck,
  Cloud,
  Compass,
  ExternalLink,
  FileText,
  FlaskConical,
  HelpCircle,
  KeyRound,
  Layers,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  Table2,
  Target,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UpdatesBanner, UpdatesModal } from './UpdatesBox';
import { LATEST_UPDATE_ID } from '../data/changelog';
import { ASK_AI_EVENT, type AskAiPayload } from '../utils/askAiBridge';
import { OPEN_FOCUS_EVENT } from '../utils/smartFocusPlan';
import { OPEN_ROOM_EVENT } from '../utils/studyRoomStats';
import {
  STUDIO_PALETTES,
  getNextPalette,
  getPaletteMeta,
  resolvePalette,
} from '../utils/studioTheme';
import type {
  EconPageRoute,
  GeminiModelId,
  PageRoute,
  ProbPageRoute,
  SubjectId,
} from '../types';

const AdminPanelModal = lazy(() =>
  import('./AdminPanelModal').then((m) => ({ default: m.AdminPanelModal })),
);
const GlobalSearchModal = lazy(() =>
  import('./GlobalSearchModal').then((m) => ({ default: m.GlobalSearchModal })),
);
const ReviewBankModal = lazy(() =>
  import('./ReviewBankModal').then((m) => ({ default: m.ReviewBankModal })),
);
const FlashcardsModal = lazy(() =>
  import('./FlashcardsModal').then((m) => ({ default: m.FlashcardsModal })),
);
const SmartFocusModal = lazy(() =>
  import('./SmartFocusModal').then((m) => ({ default: m.SmartFocusModal })),
);
const StudyRoomsModal = lazy(() =>
  import('./StudyRoomsModal').then((m) => ({ default: m.StudyRoomsModal })),
);
const ExamCalculatorDrawer = lazy(() =>
  import('./ExamCalculatorDrawer').then((m) => ({ default: m.ExamCalculatorDrawer })),
);
const GeminiTutorDrawer = lazy(() =>
  import('./GeminiTutorDrawer').then((m) => ({ default: m.GeminiTutorDrawer })),
);
const WelcomeIntroModal = lazy(() =>
  import('./WelcomeIntroModal').then((m) => ({ default: m.WelcomeIntroModal })),
);
const INTRO_SEEN_KEY = 'exam_studio_intro_seen_v1';
const REPLAY_SPLASH_EVENT = 'exam-studio:replay-splash';

interface LayoutProps {
  subject: SubjectId;
  onSelectSubject: (subject: SubjectId) => void;
  mfcRoute: PageRoute;
  econRoute: EconPageRoute;
  probRoute: ProbPageRoute;
  isGuide: boolean;
  onNavigateGuide: () => void;
  onNavigateMfc: (route: PageRoute, query?: string) => void;
  onNavigateEcon: (route: EconPageRoute, query?: string) => void;
  onNavigateProb: (route: ProbPageRoute, query?: string) => void;
  children: React.ReactNode;
}

const MFC_NAV: Array<{
  id: PageRoute;
  label: string;
  labelVi: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Dashboard', labelVi: 'Tổng quan', shortLabel: 'Home', icon: LayoutDashboard },
  { id: 'labs', label: 'Practice Labs', labelVi: 'Phòng thực hành', shortLabel: 'Labs', icon: FlaskConical },
  { id: 'proofs', label: 'Proofs Trainer', labelVi: 'Luyện chứng minh', shortLabel: 'Proofs', icon: Scale },
  { id: 'assignments', label: 'Assignments 1–4', labelVi: 'Bài tập 1–4', shortLabel: 'Assign', icon: FileText },
  { id: 'knowledge', label: 'Knowledge Base', labelVi: 'Kiến thức & Từ điển', shortLabel: 'Notes', icon: BookOpen },
  { id: 'exam', label: 'Mock Final Exam', labelVi: 'Thi thử cuối kỳ', shortLabel: 'Exam', icon: ClipboardCheck },
];

const ECON_NAV: Array<{
  id: EconPageRoute;
  label: string;
  labelVi: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Econ Dashboard', labelVi: 'Tổng quan Kinh tế', shortLabel: 'Home', icon: LayoutDashboard },
  { id: 'labs', label: 'Econ Simulators', labelVi: 'Mô phỏng & Đồ thị', shortLabel: 'Labs', icon: FlaskConical },
  { id: 'drill', label: 'MCQs & Policy Drills', labelVi: 'Trắc nghiệm & Tự luận', shortLabel: 'Drills', icon: HelpCircle },
  { id: 'knowledge', label: 'Cheat Sheets & Terms', labelVi: 'Công thức & Từ điển', shortLabel: 'Notes', icon: BookOpen },
  { id: 'exam', label: 'Mock Econ Exam', labelVi: 'Thi thử Kinh tế', shortLabel: 'Exam', icon: ClipboardCheck },
];

const PROB_NAV: Array<{
  id: ProbPageRoute;
  label: string;
  labelVi: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Prob Dashboard', labelVi: 'Tổng quan XSTK', shortLabel: 'Home', icon: LayoutDashboard },
  { id: 'tables', label: 'SB Stat Tables', labelVi: 'Tra bảng SB (C1–F)', shortLabel: 'Tables', icon: Table2 },
  { id: 'labs', label: 'Stat Simulators', labelVi: 'Mô phỏng phân phối', shortLabel: 'Labs', icon: FlaskConical },
  { id: 'problems', label: 'Problem Sets 1–5', labelVi: 'Bài tập Chương 1–5', shortLabel: 'Sets', icon: FileText },
  { id: 'knowledge', label: 'Formula Sheets', labelVi: 'Tóm tắt A4 & Từ vựng', shortLabel: 'Notes', icon: BookOpen },
  { id: 'exam', label: 'Mock Prob Exam', labelVi: 'Thi thử XSTK', shortLabel: 'Exam', icon: ClipboardCheck },
];

const SUBJECT_BADGE: Record<SubjectId, { name: string; dot: string; text: string; pill: string }> = {
  mfc: {
    name: 'MFC',
    dot: 'bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-300',
    pill: 'bg-indigo-500/12 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/25',
  },
  econ: {
    name: 'Economics',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-300',
    pill: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/25',
  },
  probstat: {
    name: 'Prob & Stat',
    dot: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-300',
    pill: 'bg-sky-500/12 text-sky-600 dark:text-sky-300 ring-1 ring-sky-500/25',
  },
};

export const Layout: React.FC<LayoutProps> = ({
  subject,
  onSelectSubject,
  mfcRoute,
  econRoute,
  probRoute,
  isGuide,
  onNavigateGuide,
  onNavigateMfc,
  onNavigateEcon,
  onNavigateProb,
  children,
}) => {
  const {
    settings,
    progress,
    cloudSyncStatus,
    setLang,
    setTheme,
    setPalette,
    setSidebarCollapsed,
    setGeminiKey,
    setGeminiModel,
    exportProgressJson,
    importProgressJson,
    resetProgress,
  } = useApp();
  const { firebaseUser, profile, accessConfig, isAdmin, signOutUser } = useAuth();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [flashcardsOpen, setFlashcardsOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusSubjectOverride, setFocusSubjectOverride] = useState<SubjectId | null>(null);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [roomsCodeOverride, setRoomsCodeOverride] = useState<string | null>(null);
  const [calcOpen, setCalcOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [pendingAi, setPendingAi] = useState<{
    prompt: string;
    subject?: SubjectId;
    nonce: number;
  } | null>(null);
  const [tutorSubjectOverride, setTutorSubjectOverride] = useState<SubjectId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [keyTestLoading, setKeyTestLoading] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedAppLink, setCopiedAppLink] = useState(false);

  const paletteMenuRef = useRef<HTMLDivElement | null>(null);
  const hasGeminiKey = Boolean(settings.geminiKey.trim());
  const activePalette = resolvePalette(settings);
  const activePaletteMeta = getPaletteMeta(activePalette);
  const collapsed = Boolean(settings.sidebarCollapsed);

  const activeRouteLabel = isGuide
    ? 'Study Guide (Hướng dẫn 3 môn)'
    : subject === 'mfc'
      ? MFC_NAV.find((n) => n.id === mfcRoute)?.label ?? 'Dashboard'
      : subject === 'econ'
        ? ECON_NAV.find((n) => n.id === econRoute)?.label ?? 'Econ Dashboard'
        : PROB_NAV.find((n) => n.id === probRoute)?.label ?? 'Prob Dashboard';

  useEffect(() => {
    document.documentElement.dataset.subject = isGuide ? 'guide' : subject;
  }, [subject, isGuide]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          setSidebarCollapsed(!collapsed);
        }
      } else if (e.key === 'Escape') {
        if (paletteOpen) setPaletteOpen(false);
        else if (settingsOpen) setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [settingsOpen, paletteOpen, collapsed, setSidebarCollapsed]);

  useEffect(() => {
    if (!paletteOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (paletteMenuRef.current && !paletteMenuRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, [paletteOpen]);

  useEffect(() => {
    const onAskAi = (e: Event) => {
      const detail = (e as CustomEvent<AskAiPayload>).detail;
      if (!detail?.prompt) return;
      setTutorSubjectOverride(detail.subject ?? null);
      setPendingAi({ prompt: detail.prompt, subject: detail.subject, nonce: Date.now() });
      setTutorOpen(true);
    };
    window.addEventListener(ASK_AI_EVENT, onAskAi);
    return () => window.removeEventListener(ASK_AI_EVENT, onAskAi);
  }, []);

  useEffect(() => {
    const onOpenFocus = (e: Event) => {
      const detail = (e as CustomEvent<{ subject?: SubjectId }>).detail;
      setFocusSubjectOverride(detail?.subject ?? null);
      setFocusOpen(true);
    };
    window.addEventListener(OPEN_FOCUS_EVENT, onOpenFocus);
    return () => window.removeEventListener(OPEN_FOCUS_EVENT, onOpenFocus);
  }, []);

  useEffect(() => {
    const onOpenRoom = (e: Event) => {
      const detail = (e as CustomEvent<{ roomCode?: string }>).detail;
      setRoomsCodeOverride(detail?.roomCode ?? null);
      setRoomsOpen(true);
    };
    window.addEventListener(OPEN_ROOM_EVENT, onOpenRoom);
    return () => window.removeEventListener(OPEN_ROOM_EVENT, onOpenRoom);
  }, []);

  const copyBaseUrl = async () => {
    try {
      const url = window.location.href.split('#')[0];
      await navigator.clipboard.writeText(url);
      setCopiedAppLink(true);
      setTimeout(() => setCopiedAppLink(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const subjMeta = SUBJECT_BADGE[subject];

  const renderNavItem = (
    id: string,
    label: string,
    labelVi: string,
    Icon: React.ComponentType<{ className?: string }>,
    active: boolean,
    accentCls: string,
    onClick: () => void,
  ) => (
    <button
      key={id}
      onClick={onClick}
      title={collapsed ? `${label}${settings.lang === 'bilingual' ? ` — ${labelVi}` : ''}` : undefined}
      className={`w-full flex items-center ${
        collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-2.5 py-2'
      } rounded-xl text-left text-[13px] transition-all cursor-pointer ${
        active
          ? accentCls
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      {!collapsed && (
        <div className="leading-tight min-w-0">
          <div className="truncate">{label}</div>
          {settings.lang === 'bilingual' && (
            <div className="text-[11px] font-normal opacity-70 truncate">{labelVi}</div>
          )}
        </div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Collapsible Left Rail */}
      <aside
        className={`no-print hidden md:flex md:flex-col md:fixed md:inset-y-0 z-30 studio-glass border-r border-slate-200/80 dark:border-white/[0.08] transition-[width] duration-200 ${
          collapsed ? 'md:w-[68px]' : 'md:w-60'
        }`}
      >
        {/* Rail Header */}
        <div
          className={`h-14 border-b border-slate-200/70 dark:border-white/[0.07] flex items-center shrink-0 ${
            collapsed ? 'justify-center px-2' : 'justify-between px-3.5'
          }`}
        >
          <button
            type="button"
            onClick={() => onSelectSubject(subject)}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer text-left"
            title="Exam Studio Hub"
          >
            <img
              src="./logo.png"
              alt="Exam Studio Logo"
              className="w-8 h-8 rounded-xl object-cover shadow-xs ring-1 ring-indigo-500/35 shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-display font-bold text-sm tracking-tight truncate flex items-center gap-1.5">
                  <span>Exam Studio</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/12 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/20">
                    5.0
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  MFC · Econ · ProbStat
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>{subjMeta.name}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${subjMeta.dot}`} />
            </div>
          )}

          {subject === 'mfc' &&
            MFC_NAV.map((item) =>
              renderNavItem(
                item.id,
                item.label,
                item.labelVi,
                item.icon,
                !isGuide && mfcRoute === item.id,
                'bg-indigo-500/12 text-indigo-600 dark:text-indigo-300 font-semibold ring-1 ring-indigo-500/25',
                () => onNavigateMfc(item.id),
              ),
            )}

          {subject === 'econ' &&
            ECON_NAV.map((item) =>
              renderNavItem(
                item.id,
                item.label,
                item.labelVi,
                item.icon,
                !isGuide && econRoute === item.id,
                'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500/25',
                () => onNavigateEcon(item.id),
              ),
            )}

          {subject === 'probstat' &&
            PROB_NAV.map((item) =>
              renderNavItem(
                item.id,
                item.label,
                item.labelVi,
                item.icon,
                !isGuide && probRoute === item.id,
                'bg-sky-500/12 text-sky-600 dark:text-sky-300 font-semibold ring-1 ring-sky-500/25',
                () => onNavigateProb(item.id),
              ),
            )}

          {/* Secondary Studio Tools */}
          <div className="pt-3 mt-3 border-t border-slate-200/70 dark:border-white/[0.07] space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Studio Tools
              </div>
            )}

            <button
              onClick={() => setCalcOpen(true)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2 py-2' : 'justify-between px-2.5 py-1.5'
              } rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] transition-colors cursor-pointer`}
              title="Show-Your-Work Exam Calculator"
            >
              <span className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                {!collapsed && <span>Exam Calc</span>}
              </span>
              {!collapsed && <span className="text-[10px] font-mono text-slate-400">Steps</span>}
            </button>

            <button
              onClick={() => setFlashcardsOpen(true)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2 py-2' : 'justify-between px-2.5 py-1.5'
              } rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] transition-colors cursor-pointer`}
              title="Quick Formula & Custom Flashcards"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-500 shrink-0" />
                {!collapsed && <span>Flashcards</span>}
              </span>
              {!collapsed && <span className="text-[10px] font-mono text-slate-400">Recall</span>}
            </button>

            <button
              onClick={onNavigateGuide}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2 py-2' : 'justify-between px-2.5 py-1.5'
              } rounded-xl text-xs transition-colors cursor-pointer ${
                isGuide
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold ring-1 ring-amber-500/30'
                  : 'text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100/80 dark:hover:bg-white/[0.05]'
              }`}
              title="Study Guide (Hướng dẫn 3 môn)"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-500 shrink-0" />
                {!collapsed && <span>Study Guide</span>}
              </span>
              {!collapsed && <span className="text-[10px] font-mono text-slate-400">VI</span>}
            </button>

            <button
              onClick={() => setTutorOpen(true)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2 py-2' : 'justify-between px-2.5 py-1.5'
              } rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] transition-colors cursor-pointer`}
              title="Open My Gemini AI Tutor"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                {!collapsed && <span>My Gemini AI</span>}
              </span>
              {!collapsed && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    hasGeminiKey ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-hidden="true"
                />
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => setAdminOpen(true)}
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center px-2 py-2' : 'justify-between px-2.5 py-1.5'
                } rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] transition-colors cursor-pointer`}
                title="Open Admin Panel"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  {!collapsed && <span>Admin Panel</span>}
                </span>
                {!collapsed && (
                  <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                    {accessConfig ? `${accessConfig.approvedCount}/${accessConfig.maxUsers}` : 'Ctrl'}
                  </span>
                )}
              </button>
            )}
          </div>
        </nav>

        {/* Rail Footer */}
        <div className="px-2.5 py-2.5 border-t border-slate-200/70 dark:border-white/[0.07] space-y-2 shrink-0">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setUpdatesOpen(true)}
                  className="flex-1 px-2 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-indigo-500/10 hover:bg-indigo-500/18 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/20 transition-colors cursor-pointer text-center"
                  title="What's New & Changelog"
                >
                  {LATEST_UPDATE_ID} Notes
                </button>
                <button
                  onClick={copyBaseUrl}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    copiedAppLink
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                      : 'border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500 dark:text-slate-300'
                  }`}
                  title={copiedAppLink ? 'Copied Study App URL!' : 'Copy Study App URL'}
                  aria-label="Share Study App URL"
                >
                  {copiedAppLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setTheme(activePaletteMeta.theme === 'dark' ? 'light' : 'dark')}
                  className="p-1.5 rounded-lg border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Quick toggle Light / Dark"
                  aria-label="Toggle Light / Dark theme"
                >
                  {activePaletteMeta.theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </button>
              </div>

              {firebaseUser && (
                <div className="pt-1.5 border-t border-slate-200/70 dark:border-white/[0.07] flex items-center justify-between gap-2 text-[11px]">
                  <div className="min-w-0">
                    <div className="font-semibold truncate text-slate-800 dark:text-slate-200">
                      {profile?.displayName || firebaseUser.email}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 truncate flex items-center gap-1">
                      <span className="truncate">{firebaseUser.email}</span>
                      {cloudSyncStatus === 'synced' && (
                        <span
                          className="inline-flex items-center gap-0.5 text-emerald-500 shrink-0"
                          title="Progress synced to Cloud"
                        >
                          <Cloud className="w-3 h-3" />
                        </span>
                      )}
                      {cloudSyncStatus === 'syncing' && (
                        <span className="text-sky-500 shrink-0">Sync...</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => void signOutUser()}
                    className="p-1.5 rounded-lg border border-slate-200/80 dark:border-white/[0.08] hover:bg-rose-500/10 hover:text-rose-500 shrink-0 transition-colors cursor-pointer"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="pt-0.5 text-center text-[10px] text-slate-400">
                Built by{' '}
                <a
                  href="https://github.com/vthonq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors"
                >
                  vthonq
                </a>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setUpdatesOpen(true)}
                className="w-9 h-8 rounded-lg text-[10px] font-mono font-bold bg-indigo-500/12 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/25 cursor-pointer"
                title={`What's New (${LATEST_UPDATE_ID})`}
              >
                {LATEST_UPDATE_ID}
              </button>
              {firebaseUser && (
                <button
                  onClick={() => void signOutUser()}
                  className="p-2 rounded-lg border border-slate-200/80 dark:border-white/[0.08] hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                  title={`Sign Out (${firebaseUser.email})`}
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Menu Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="no-print fixed inset-0 z-30 bg-black/45 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Header */}
      <header className="no-print md:hidden sticky top-0 z-40 studio-glass border-b border-slate-200/80 dark:border-white/[0.08] px-3 py-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="./logo.png"
              alt="Exam Studio Logo"
              className="w-8 h-8 rounded-xl object-cover ring-1 ring-indigo-500/35 shrink-0"
            />
            <div className="min-w-0">
              <div className="font-display font-bold text-sm truncate flex items-center gap-1.5">
                <span>Exam Studio</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/12 text-indigo-500 font-bold">
                  5.0
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className="p-2 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04]"
              aria-label="Global Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPalette(getNextPalette(activePalette))}
              className="p-2 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] flex items-center gap-1"
              title={`Theme: ${activePaletteMeta.name} (tap to cycle)`}
              aria-label="Cycle Studio Palette"
            >
              <Palette className="w-4 h-4 text-indigo-500" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setReviewOpen(true);
              }}
              className="relative p-2 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04]"
              aria-label="Review Bank"
            >
              <BookmarkCheck className="w-4 h-4 text-rose-500" />
              {progress.mistakes.length > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-full bg-rose-500 text-white leading-tight tabular-nums">
                  {progress.mistakes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="relative p-2 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04]"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              {isAdmin && !mobileMenuOpen && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Segmented Subject Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.06]">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onSelectSubject('mfc');
            }}
            className={`py-1 rounded-lg text-xs font-semibold transition-all ${
              !isGuide && subject === 'mfc'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            MFC
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onSelectSubject('econ');
            }}
            className={`py-1 rounded-lg text-xs font-semibold transition-all ${
              !isGuide && subject === 'econ'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Economics
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onSelectSubject('probstat');
            }}
            className={`py-1 rounded-lg text-xs font-semibold transition-all ${
              !isGuide && subject === 'probstat'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Prob &amp; Stat
          </button>
        </div>

        {/* Slide-Down Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="animate-fade-in pt-2 pb-2 border-t border-slate-200/70 dark:border-white/[0.08] space-y-2.5 max-h-[75vh] overflow-y-auto">
            {/* 4-Palette Quick Strip on Mobile */}
            <div className="grid grid-cols-4 gap-1.5">
              {STUDIO_PALETTES.map((p) => {
                const selected = p.id === activePalette;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPalette(p.id)}
                    className={`p-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center gap-1 transition-all ${
                      selected
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                        : 'border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.03] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full ring-1 ring-black/15"
                        style={{ backgroundColor: p.swatches[0] }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: p.swatches[2] }}
                      />
                    </span>
                    <span className="truncate max-w-full">{p.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateGuide();
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                isGuide
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-amber-500/12 text-amber-700 dark:text-amber-200 border border-amber-500/25 font-semibold'
              }`}
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Guide — Hướng dẫn 3 môn
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20">VI</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAdminOpen(true);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20">
                  {accessConfig ? `${accessConfig.approvedCount}/${accessConfig.maxUsers}` : 'Control'}
                </span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setFocusSubjectOverride(null);
                  setFocusOpen(true);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 flex items-center justify-center gap-1.5"
              >
                <Target className="w-3.5 h-3.5" />
                Smart Focus
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCalcOpen(true);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5" />
                Exam Calc
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setRoomsCodeOverride(null);
                  setRoomsOpen(true);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 flex items-center justify-center gap-1.5 col-span-2"
              >
                <Users className="w-3.5 h-3.5" />
                Live Class Study Rooms
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setFlashcardsOpen(true);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-500" />
                Quick &amp; Custom Flashcards
              </span>
              <span className="text-[10px] font-mono text-slate-400">Recall</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setTutorOpen(true);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                My Gemini AI Tutor
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20">
                {hasGeminiKey ? 'Connected' : 'Setup'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => setLang(settings.lang === 'en' ? 'bilingual' : 'en')}
                className="px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.04] font-semibold"
              >
                {settings.lang === 'bilingual' ? '🌐 EN + VI' : '🌐 EN Only'}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSettingsOpen(true);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.04] font-semibold flex items-center justify-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setUpdatesOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-indigo-500/12 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25 font-semibold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                What&apos;s New ({LATEST_UPDATE_ID})
              </button>
              <button
                onClick={copyBaseUrl}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                {copiedAppLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" /> Share Link
                  </>
                )}
              </button>
            </div>

            {firebaseUser && (
              <div className="pt-2 border-t border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <div className="font-semibold truncate text-slate-800 dark:text-slate-200">
                    {profile?.displayName || firebaseUser.email}
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <span className="truncate">{firebaseUser.email}</span>
                    {cloudSyncStatus === 'synced' && (
                      <span className="inline-flex items-center gap-0.5 text-emerald-500 shrink-0">
                        <Cloud className="w-3 h-3" /> Synced
                      </span>
                    )}
                    {cloudSyncStatus === 'syncing' && (
                      <span className="text-sky-500 shrink-0">Syncing...</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void signOutUser();
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-500/30 text-rose-500 font-semibold text-xs inline-flex items-center gap-1 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
            <div className="pt-1 text-center text-[10px] text-slate-400">
              Built by{' '}
              <a
                href="https://github.com/vthonq"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors"
              >
                vthonq
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Shell */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-200 ${
          collapsed ? 'md:pl-[68px]' : 'md:pl-60'
        }`}
      >
        {/* Desktop Top Command Bar */}
        <header className="no-print hidden md:flex sticky top-0 z-20 h-14 studio-glass border-b border-slate-200/70 dark:border-white/[0.08] items-center justify-between gap-3 px-4 lg:px-6">
          {/* Left: Collapse Rail + Breadcrumb */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!collapsed)}
              className="p-1.5 rounded-lg border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
              title="Toggle Sidebar (Ctrl+B)"
              aria-label="Toggle Sidebar"
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            <div className="hidden lg:flex items-center gap-2 text-xs min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isGuide ? 'bg-amber-500' : subjMeta.dot}`} />
              <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                {isGuide ? 'Studio' : subjMeta.name}
              </span>
              <span className="text-slate-400">/</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                {activeRouteLabel}
              </span>
            </div>
          </div>

          {/* Center: Subject Switcher + Raycast Command Search */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => onSelectSubject('mfc')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isGuide && subject === 'mfc'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-2xs ring-1 ring-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Math for Computing (MFC)"
              >
                MFC
              </button>
              <button
                type="button"
                onClick={() => onSelectSubject('econ')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isGuide && subject === 'econ'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-300 shadow-2xs ring-1 ring-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Principles of Economics (ECO101)"
              >
                Econ
              </button>
              <button
                type="button"
                onClick={() => onSelectSubject('probstat')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isGuide && subject === 'probstat'
                    ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 shadow-2xs ring-1 ring-sky-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Probability & Statistics"
              >
                ProbStat
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-100/70 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2 lg:min-w-[205px] transition-colors cursor-pointer"
              title="Command Search across all 3 subjects (Ctrl+K)"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline truncate">Search formulas, labs...</span>
              </span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-400 shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Quick Action Pills + Palette Switcher + Lang + Settings */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setRoomsCodeOverride(null);
                setRoomsOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/18 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
              title="Open Live Class Study Rooms"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Rooms</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => {
                setFocusSubjectOverride(null);
                setFocusOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Today's Smart Focus Drill"
            >
              <Target className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Focus</span>
              {(progress.studyStreak?.count ?? 0) > 0 && (
                <span className="text-[10px] font-mono text-amber-500 font-bold tabular-nums">
                  {progress.studyStreak?.count}d
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="relative p-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Mistakes & Review Bank"
              aria-label="Mistakes & Review Bank"
            >
              <BookmarkCheck className="w-4 h-4 text-rose-500" />
              {progress.mistakes.length > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] font-mono font-bold px-1 rounded-full bg-rose-500 text-white leading-tight tabular-nums">
                  {progress.mistakes.length}
                </span>
              )}
            </button>

            {/* Live 4-Palette Popover */}
            <div className="relative" ref={paletteMenuRef}>
              <button
                type="button"
                onClick={() => setPaletteOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title={`Studio Palette: ${activePaletteMeta.name}`}
                aria-expanded={paletteOpen}
              >
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                <span
                  className="w-2.5 h-2.5 rounded-full ring-1 ring-black/20 dark:ring-white/25"
                  style={{ backgroundColor: activePaletteMeta.swatches[2] }}
                />
              </button>

              {paletteOpen && (
                <div className="animate-fade-in absolute right-0 mt-2 w-72 rounded-2xl studio-card p-2 shadow-2xl z-50 space-y-1">
                  <div className="px-2.5 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Studio 5.0 Palette</span>
                    <span>4 Themes</span>
                  </div>
                  {STUDIO_PALETTES.map((p) => {
                    const selected = p.id === activePalette;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPalette(p.id);
                          setPaletteOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                          selected
                            ? 'bg-indigo-500/12 ring-1 ring-indigo-500/30 text-indigo-700 dark:text-indigo-200'
                            : 'hover:bg-slate-100/80 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex items-center -space-x-1 shrink-0">
                            {p.swatches.map((hex, i) => (
                              <span
                                key={i}
                                className="w-4 h-4 rounded-full ring-1 ring-black/20 dark:ring-white/20"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">
                              {settings.lang === 'bilingual' ? p.nameVi : p.name}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {p.tagline}
                            </div>
                          </div>
                        </div>
                        {selected && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setLang(settings.lang === 'en' ? 'bilingual' : 'en')}
              className="px-2 py-1.5 rounded-xl text-[11px] font-semibold border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Toggle English / Bilingual (EN+VI)"
            >
              {settings.lang === 'bilingual' ? 'EN+VI' : 'EN'}
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Studio Settings & Gemini AI Key"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Workspace Canvas with Subject Ambient Spotlight */}
        <main className="flex-1 studio-ambient-canvas pb-24 md:pb-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-7">
            <UpdatesBanner onOpenHistory={() => setUpdatesOpen(true)} />
            {children}
          </div>
        </main>
      </div>

      {/* Floating Glass Mobile Bottom Dock */}
      <nav className="no-print md:hidden fixed bottom-2.5 inset-x-2.5 z-20 rounded-2xl studio-glass border border-slate-200/80 dark:border-white/[0.1] shadow-xl px-1.5 py-1 flex justify-around">
        {(subject === 'mfc' ? MFC_NAV : subject === 'econ' ? ECON_NAV : PROB_NAV).map((item) => {
          const Icon = item.icon;
          const active =
            !isGuide &&
            (subject === 'mfc'
              ? mfcRoute === item.id
              : subject === 'econ'
              ? econRoute === item.id
              : probRoute === item.id);
          const activeTextCls =
            subject === 'mfc'
              ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-500/12 font-semibold'
              : subject === 'econ'
              ? 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/12 font-semibold'
              : 'text-sky-600 dark:text-sky-300 bg-sky-500/12 font-semibold';

          return (
            <button
              key={item.id}
              onClick={() => {
                setMobileMenuOpen(false);
                if (subject === 'mfc') onNavigateMfc(item.id as PageRoute);
                else if (subject === 'econ') onNavigateEcon(item.id as EconPageRoute);
                else onNavigateProb(item.id as ProbPageRoute);
              }}
              className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[10px] transition-all ${
                active ? activeTextCls : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[52px]">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings Modal */}
      {settingsOpen && (
        <div
          className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="studio-card rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                Studio Settings
              </h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Studio 5.0 Palette & Layout Controls */}
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-500" />
                  Studio 5.0 Palette
                </div>
                <div className="hidden md:flex items-center gap-1 text-[11px]">
                  <span className="text-slate-400 mr-1">Sidebar:</span>
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(false)}
                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                      !collapsed
                        ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Expanded
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(true)}
                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                      collapsed
                        ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Compact
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STUDIO_PALETTES.map((p) => {
                  const selected = p.id === activePalette;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPalette(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        selected
                          ? 'border-indigo-500 bg-indigo-500/12 ring-1 ring-indigo-500/30'
                          : 'border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 bg-white/70 dark:bg-white/[0.02]'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          {p.swatches.map((hex, idx) => (
                            <span
                              key={idx}
                              className="w-3.5 h-3.5 rounded-full ring-1 ring-black/20 dark:ring-white/20"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {p.tagline}
                        </div>
                      </div>
                      {selected && <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-sm font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  Your Gemini API Key (BYOK)
                </label>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Get Free Key ↗
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stored <strong>strictly in your browser</strong> (never uploaded to our server). Unlocks{' '}
                <strong>My Gemini AI Tutor</strong> chat &amp; direct AI Proof / Policy grading. Or use{' '}
                <strong>Instant Offline Check</strong> / <strong>Gemini Web ↗</strong> with zero key!
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={settings.geminiKey}
                  onChange={(e) => {
                    setGeminiKey(e.target.value);
                    setKeyTestResult(null);
                  }}
                  placeholder="AIza..."
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono"
                />
                <button
                  type="button"
                  disabled={keyTestLoading}
                  onClick={async () => {
                    setKeyTestLoading(true);
                    setKeyTestResult(null);
                    const { testGeminiConnection } = await import('../services/geminiTutor');
                    const res = await testGeminiConnection(settings.geminiKey, settings.geminiModel);
                    setKeyTestResult({ ok: res.ok, message: res.message });
                    setKeyTestLoading(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {keyTestLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Test Key
                </button>
              </div>
              {keyTestResult && (
                <div
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                    keyTestResult.ok
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {keyTestResult.message}
                </div>
              )}
              <div className="pt-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1">
                  Gemini Model
                </label>
                <select
                  value={settings.geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value as GeminiModelId)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                >
                  <option value="gemini-4-hydrogen">Gemini 4 Hydrogen (Fast &amp; Balanced — Default)</option>
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (Ultra-Fast / High Free Quota)</option>
                  <option value="gemini-4-argon">Gemini 4 Argon (Deeper Reasoning)</option>
                  <option value="gemini-4-carbon">Gemini 4 Carbon (Strict Verification)</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  setTutorOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer pt-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Open My Gemini AI Tutor →
              </button>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
              <div className="text-sm font-semibold">Backup / Share Study Progress</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([exportProgressJson()], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'exam-studio-progress.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 cursor-pointer"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Reset all mastery scores, checkoffs, and exam history?')) {
                      resetProgress();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-500 text-xs font-medium hover:bg-rose-500/10 cursor-pointer"
                >
                  Reset Progress
                </button>
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={3}
                placeholder="Paste exported progress JSON here to restore..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const ok = importProgressJson(importText);
                    setImportStatus(ok ? 'Imported!' : 'Invalid JSON format.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-medium cursor-pointer"
                >
                  Import JSON
                </button>
                {importStatus && <span className="text-xs text-emerald-500">{importStatus}</span>}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2.5">
              <div className="text-xs">
                <div className="font-semibold text-indigo-900 dark:text-indigo-100">
                  Website Intros
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Replay the animated splash intro or the 3-step welcome walkthrough anytime.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsOpen(false);
                    window.dispatchEvent(new CustomEvent(REPLAY_SPLASH_EVENT));
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  Animated Intro
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsOpen(false);
                    setIntroOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                >
                  3-Step Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        {searchOpen && (
          <GlobalSearchModal
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            onNavigateMfc={onNavigateMfc}
            onNavigateEcon={onNavigateEcon}
            onNavigateProb={onNavigateProb}
            onNavigateGuide={onNavigateGuide}
          />
        )}

        {reviewOpen && <ReviewBankModal open={reviewOpen} onClose={() => setReviewOpen(false)} />}

        {flashcardsOpen && (
          <FlashcardsModal
            open={flashcardsOpen}
            onClose={() => setFlashcardsOpen(false)}
            initialSubject={subject}
          />
        )}

        {focusOpen && (
          <SmartFocusModal
            open={focusOpen}
            onClose={() => {
              setFocusOpen(false);
              setFocusSubjectOverride(null);
            }}
            initialSubject={focusSubjectOverride ?? subject}
          />
        )}

        {calcOpen && (
          <ExamCalculatorDrawer
            open={calcOpen}
            onClose={() => setCalcOpen(false)}
            initialSubject={subject}
          />
        )}

        {roomsOpen && (
          <StudyRoomsModal
            open={roomsOpen}
            onClose={() => {
              setRoomsOpen(false);
              setRoomsCodeOverride(null);
            }}
            initialSubject={subject}
            initialRoomCode={roomsCodeOverride}
            onNavigateMfc={onNavigateMfc}
            onNavigateEcon={onNavigateEcon}
            onNavigateProb={onNavigateProb}
          />
        )}

        {adminOpen && <AdminPanelModal open={adminOpen} onClose={() => setAdminOpen(false)} />}

        {tutorOpen && (
          <GeminiTutorDrawer
            open={tutorOpen}
            onClose={() => {
              setTutorOpen(false);
              setTutorSubjectOverride(null);
            }}
            subject={tutorSubjectOverride ?? subject}
            routeLabel={activeRouteLabel}
            prefillPrompt={pendingAi}
            onConsumePrefill={() => setPendingAi(null)}
          />
        )}

        {introOpen && (
          <WelcomeIntroModal
            open={introOpen}
            onClose={() => {
              try {
                localStorage.setItem(INTRO_SEEN_KEY, '1');
              } catch {
                // ignore storage errors
              }
              setIntroOpen(false);
            }}
            activeSubject={subject}
            onSelectSubject={onSelectSubject}
            onOpenGuide={onNavigateGuide}
            onOpenTutor={() => setTutorOpen(true)}
          />
        )}
      </Suspense>

      {!tutorOpen && !calcOpen && !mobileMenuOpen && (
        <div className="no-print fixed bottom-20 md:bottom-5 right-4 md:right-6 z-20 md:z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCalcOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full studio-glass hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-lg border border-slate-200/80 dark:border-white/[0.12] text-xs font-semibold transition-all cursor-pointer"
            title="Show-Your-Work Exam Calculator"
            aria-label="Open Exam Calculator"
          >
            <Calculator className="w-4 h-4 text-slate-500 dark:text-slate-300" />
            <span className="hidden sm:inline">Calc</span>
          </button>
          <button
            type="button"
            onClick={() => setTutorOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-white/10 text-xs font-semibold transition-all cursor-pointer"
            title="Ask My Gemini AI Tutor"
            aria-label="Open My Gemini AI Tutor"
          >
            <Sparkles className="w-4 h-4 text-indigo-300 dark:text-white" />
            <span className="hidden sm:inline">Gemini AI</span>
            {hasGeminiKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
            )}
          </button>
        </div>
      )}

      <UpdatesModal open={updatesOpen} onClose={() => setUpdatesOpen(false)} />
    </div>
  );
};

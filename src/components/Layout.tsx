import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  BookOpen,
  BookmarkCheck,
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
  Scale,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  Table2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UpdatesBanner, UpdatesModal } from './UpdatesBox';
import { LATEST_UPDATE_ID } from '../data/changelog';
import { ASK_AI_EVENT, type AskAiPayload } from '../utils/askAiBridge';

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
const GeminiTutorDrawer = lazy(() =>
  import('./GeminiTutorDrawer').then((m) => ({ default: m.GeminiTutorDrawer })),
);
const WelcomeIntroModal = lazy(() =>
  import('./WelcomeIntroModal').then((m) => ({ default: m.WelcomeIntroModal })),
);
const INTRO_SEEN_KEY = 'exam_studio_intro_seen_v1';
const REPLAY_SPLASH_EVENT = 'exam-studio:replay-splash';
import type {
  EconPageRoute,
  GeminiModelId,
  PageRoute,
  ProbPageRoute,
  SubjectId,
} from '../types';

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
    setGeminiKey,
    setGeminiModel,
    exportProgressJson,
    importProgressJson,
    resetProgress,
  } = useApp();
  const { firebaseUser, profile, accessConfig, isAdmin, signOutUser } = useAuth();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [flashcardsOpen, setFlashcardsOpen] = useState(false);
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

  const hasGeminiKey = Boolean(settings.geminiKey.trim());

  const activeRouteLabel = isGuide
    ? 'Study Guide (Hướng dẫn 3 môn)'
    : subject === 'mfc'
      ? MFC_NAV.find((n) => n.id === mfcRoute)?.label ?? 'Dashboard'
      : subject === 'econ'
        ? ECON_NAV.find((n) => n.id === econRoute)?.label ?? 'Econ Dashboard'
        : PROB_NAV.find((n) => n.id === probRoute)?.label ?? 'Prob Dashboard';

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (e.key === 'Escape' && settingsOpen) {
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [settingsOpen]);

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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20">
        <div className="px-3.5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
          <img
            src="./logo.png"
            alt="Exam Studio Logo"
            className="w-9 h-9 rounded-xl object-cover shadow-sm ring-2 ring-indigo-500/30 shrink-0"
          />
          <div className="min-w-0">
            <div className="font-bold text-sm tracking-tight truncate">Exam Studio Hub</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              MFC · Economics · Prob &amp; Stat
            </div>
          </div>
        </div>

        {/* Calm 1-Row Subject Segmented Switcher + Search Bar */}
        <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 space-y-2">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
            <button
              onClick={() => onSelectSubject('mfc')}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isGuide && subject === 'mfc'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Math for Computing (MFC)"
            >
              MFC
            </button>
            <button
              onClick={() => onSelectSubject('econ')}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isGuide && subject === 'econ'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Principles of Economics (ECO101)"
            >
              Econ
            </button>
            <button
              onClick={() => onSelectSubject('probstat')}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isGuide && subject === 'probstat'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Probability & Statistics (Ch. 1–5 · SB)"
            >
              Prob
            </button>
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-between transition-colors cursor-pointer"
            title="Search all 3 subjects (Ctrl+K)"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Search formulas, labs...</span>
            </span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        <nav className="flex-1 px-2.5 py-2.5 space-y-0.5 overflow-y-auto">
          {subject === 'mfc' &&
            MFC_NAV.map((item) => {
              const Icon = item.icon;
              const active = !isGuide && mfcRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateMfc(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[13px] border-l-[3px] transition-all cursor-pointer ${
                    active
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-400'
                      : 'border-transparent text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="leading-tight">
                    <div>{item.label}</div>
                    {settings.lang === 'bilingual' && (
                      <div className="text-[11px] font-normal opacity-75">{item.labelVi}</div>
                    )}
                  </div>
                </button>
              );
            })}

          {subject === 'econ' &&
            ECON_NAV.map((item) => {
              const Icon = item.icon;
              const active = !isGuide && econRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateEcon(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[13px] border-l-[3px] transition-all cursor-pointer ${
                    active
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-700 font-semibold dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-400'
                      : 'border-transparent text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="leading-tight">
                    <div>{item.label}</div>
                    {settings.lang === 'bilingual' && (
                      <div className="text-[11px] font-normal opacity-75">{item.labelVi}</div>
                    )}
                  </div>
                </button>
              );
            })}

          {subject === 'probstat' &&
            PROB_NAV.map((item) => {
              const Icon = item.icon;
              const active = !isGuide && probRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateProb(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[13px] border-l-[3px] transition-all cursor-pointer ${
                    active
                      ? 'border-sky-600 bg-sky-50/80 text-sky-700 font-semibold dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-400'
                      : 'border-transparent text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="leading-tight">
                    <div>{item.label}</div>
                    {settings.lang === 'bilingual' && (
                      <div className="text-[11px] font-normal opacity-75">{item.labelVi}</div>
                    )}
                  </div>
                </button>
              );
            })}

          {/* Calm Tools Section */}
          <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
            <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tools
            </div>

            <button
              onClick={() => setReviewOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Open Mistakes & Review Bank"
            >
              <span className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-rose-500/90 shrink-0" />
                <span>Review Bank</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  progress.mistakes.length > 0
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {progress.mistakes.length}
              </span>
            </button>

            <button
              onClick={() => setFlashcardsOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Open Quick Formula & Trap Flashcards"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-500 shrink-0" />
                <span>Flashcards</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Recall</span>
            </button>

            <button
              onClick={onNavigateGuide}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                isGuide
                  ? 'bg-amber-50 text-amber-800 font-semibold dark:bg-amber-950/50 dark:text-amber-200'
                  : 'text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`}
              title="Hướng dẫn sử dụng 3 môn"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Study Guide</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">VI</span>
            </button>

            <button
              onClick={() => setTutorOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Open My Gemini AI Tutor"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>My Gemini AI</span>
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  hasGeminiKey ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-hidden="true"
              />
            </button>

            {isAdmin && (
              <button
                onClick={() => setAdminOpen(true)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Open Admin Panel"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Admin Panel</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {accessConfig ? `${accessConfig.approvedCount}/${accessConfig.maxUsers}` : 'Ctrl'}
                </span>
              </button>
            )}
          </div>
        </nav>

        <div className="px-3 py-2.5 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLang(settings.lang === 'en' ? 'bilingual' : 'en')}
              className="flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle English / Bilingual (EN+VI)"
            >
              {settings.lang === 'bilingual' ? '🌐 EN+VI' : '🌐 EN'}
            </button>
            <button
              onClick={() => setUpdatesOpen(true)}
              className="px-2 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/70 transition-colors cursor-pointer"
              title="What's New & Changelog"
            >
              {LATEST_UPDATE_ID}
            </button>
            <button
              onClick={copyBaseUrl}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                copiedAppLink
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
              title={copiedAppLink ? 'Copied Study App URL!' : 'Copy Study App URL'}
              aria-label="Share Study App URL"
            >
              {copiedAppLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Light / Dark theme"
              aria-label="Toggle theme"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Settings & Gemini AI Key"
              aria-label="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
          {firebaseUser && (
            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px]">
              <div className="min-w-0">
                <div className="font-semibold truncate text-slate-800 dark:text-slate-200">
                  {profile?.displayName || firebaseUser.email}
                </div>
                <div className="font-mono text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span className="truncate">{firebaseUser.email}</span>
                  {cloudSyncStatus === 'synced' && (
                    <span
                      className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 shrink-0"
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
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 shrink-0 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="pt-1 text-center text-[10px] text-slate-400">
            Built by{' '}
            <a
              href="https://github.com/vthonq"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              vthonq
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="no-print fixed inset-0 z-10 bg-black/30 backdrop-blur-[1px] md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Header */}
      <header className="no-print md:hidden sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-3 py-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="./logo.png"
              alt="Exam Studio Logo"
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-indigo-500/30 shrink-0"
            />
            <span className="font-bold text-sm truncate">Exam Studio Hub</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70"
              aria-label="Global Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setReviewOpen(true);
              }}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70"
              aria-label="Review Bank"
            >
              <BookmarkCheck className="w-4 h-4 text-rose-500" />
              {progress.mistakes.length > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-full bg-rose-500 text-white leading-tight">
                  {progress.mistakes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70"
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

        {/* Segmented Subject Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
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
          <div className="animate-fade-in pt-1 pb-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateGuide();
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                isGuide
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-semibold'
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

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setFlashcardsOpen(true);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-500" />
                Quick Formula &amp; Trap Flashcards
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
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 font-semibold"
              >
                {settings.lang === 'bilingual' ? '🌐 EN + VI' : '🌐 EN Only'}
              </button>
              <button
                onClick={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 font-semibold flex items-center justify-center gap-1.5"
              >
                {settings.theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-600" /> Dark Mode
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setUpdatesOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                What&apos;s New ({LATEST_UPDATE_ID})
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSettingsOpen(true);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 font-semibold flex items-center justify-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
            </div>

            <button
              onClick={copyBaseUrl}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              {copiedAppLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" /> Share Study App Link
                </>
              )}
            </button>

            {firebaseUser && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <div className="font-semibold truncate text-slate-800 dark:text-slate-200">
                    {profile?.displayName || firebaseUser.email}
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <span className="truncate">{firebaseUser.email}</span>
                    {cloudSyncStatus === 'synced' && (
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 shrink-0">
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
                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-semibold text-xs inline-flex items-center gap-1 shrink-0"
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
                className="font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                vthonq
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
          <UpdatesBanner onOpenHistory={() => setUpdatesOpen(true)} />
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="no-print md:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex justify-around py-1">
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
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : subject === 'econ'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-sky-600 dark:text-sky-400 font-semibold';
          const activeBarCls =
            subject === 'mfc'
              ? 'bg-indigo-600 dark:bg-indigo-400'
              : subject === 'econ'
              ? 'bg-emerald-600 dark:bg-emerald-400'
              : 'bg-sky-600 dark:bg-sky-400';

          return (
            <button
              key={item.id}
              onClick={() => {
                setMobileMenuOpen(false);
                if (subject === 'mfc') onNavigateMfc(item.id as PageRoute);
                else if (subject === 'econ') onNavigateEcon(item.id as EconPageRoute);
                else onNavigateProb(item.id as ProbPageRoute);
              }}
              className={`relative flex flex-col items-center gap-0.5 px-1.5 py-1 text-[10px] transition-colors ${
                active ? activeTextCls : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {active && <span className={`w-6 h-0.5 rounded-full mb-0.5 ${activeBarCls}`} />}
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[54px]">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings Modal */}
      {settingsOpen && (
        <div
          className="no-print fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Studio Settings
              </h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
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
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono"
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
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
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

            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
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
                  className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 dark:border-rose-800 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  Reset Progress
                </button>
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={3}
                placeholder="Paste exported progress JSON here to restore..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const ok = importProgressJson(importText);
                    setImportStatus(ok ? 'Imported!' : 'Invalid JSON format.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-medium cursor-pointer"
                >
                  Import JSON
                </button>
                {importStatus && <span className="text-xs text-emerald-600">{importStatus}</span>}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/70 space-y-2.5">
              <div className="text-xs">
                <div className="font-semibold text-indigo-950 dark:text-indigo-100">
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

      {!tutorOpen && (
        <button
          type="button"
          onClick={() => setTutorOpen(true)}
          className="no-print fixed bottom-16 md:bottom-5 right-4 md:right-6 z-30 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-md border border-slate-700/40 dark:border-slate-300/60 text-xs font-semibold transition-all cursor-pointer"
          title="Ask My Gemini AI Tutor"
          aria-label="Open My Gemini AI Tutor"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
          <span className="hidden sm:inline">Gemini AI</span>
          {hasGeminiKey && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
          )}
        </button>
      )}

      <UpdatesModal open={updatesOpen} onClose={() => setUpdatesOpen(false)} />
    </div>
  );
};

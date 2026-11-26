import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  BookmarkCheck,
  Check,
  ClipboardCheck,
  Cloud,
  Compass,
  FileText,
  FlaskConical,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
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
  TrendingUp,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UpdatesBanner, UpdatesModal } from './UpdatesBox';
import { LATEST_UPDATE_ID } from '../data/changelog';

const AdminPanelModal = lazy(() =>
  import('./AdminPanelModal').then((m) => ({ default: m.AdminPanelModal })),
);
const GlobalSearchModal = lazy(() =>
  import('./GlobalSearchModal').then((m) => ({ default: m.GlobalSearchModal })),
);
const ReviewBankModal = lazy(() =>
  import('./ReviewBankModal').then((m) => ({ default: m.ReviewBankModal })),
);
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedAppLink, setCopiedAppLink] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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
            src="./logo.gif"
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

        {/* Subject Switcher */}
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Select Subject
          </div>
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => onSelectSubject('mfc')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                !isGuide && subject === 'mfc'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" /> Math for Computing
              </span>
              <span className="text-[10px] opacity-80">MFC</span>
            </button>
            <button
              onClick={() => onSelectSubject('econ')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                !isGuide && subject === 'econ'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Principles of Econ
              </span>
              <span className="text-[10px] opacity-80">Macro Final</span>
            </button>
            <button
              onClick={() => onSelectSubject('probstat')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                !isGuide && subject === 'probstat'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Prob &amp; Statistics
              </span>
              <span className="text-[10px] opacity-80">Ch.1–5 · SB</span>
            </button>
          </div>
        </div>

        {/* Compact Utility Cluster: Search + Review + Guide + Admin */}
        <div className="px-3 py-2 border-b border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
              title="Search all 3 subjects (Ctrl+K)"
            >
              <span className="flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                Search
              </span>
              <kbd className="text-[9px] font-mono px-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500">
                ⌘K
              </kbd>
            </button>
            <button
              onClick={() => setReviewOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
              title="Open Mistakes & Review Bank"
            >
              <span className="flex items-center gap-1">
                <BookmarkCheck className="w-3.5 h-3.5 text-rose-500" />
                Review
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 rounded-full ${
                  progress.mistakes.length > 0
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-400'
                }`}
              >
                {progress.mistakes.length}
              </span>
            </button>
          </div>

          {isAdmin ? (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={onNavigateGuide}
                className={`px-2 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition-all cursor-pointer ${
                  isGuide
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs ring-2 ring-amber-400/50'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/70 hover:bg-amber-100 dark:hover:bg-amber-900/60 font-semibold'
                }`}
                title="Hướng dẫn sử dụng 3 môn"
              >
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  Guide
                </span>
                <span
                  className={`text-[9px] px-1 py-0.5 rounded font-bold ${
                    isGuide ? 'bg-slate-950/15 text-slate-950' : 'bg-amber-500/20 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  VI
                </span>
              </button>
              <button
                onClick={() => setAdminOpen(true)}
                className="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-between transition-colors cursor-pointer"
                title="Open Admin Panel"
              >
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  Admin
                </span>
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/20">
                  {accessConfig ? `${accessConfig.approvedCount}/${accessConfig.maxUsers}` : 'Ctrl'}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={onNavigateGuide}
              className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                isGuide
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs ring-2 ring-amber-400/50'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/70 hover:bg-amber-100 dark:hover:bg-amber-900/60 font-semibold'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>Guide · Hướng dẫn 3 môn</span>
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  isGuide ? 'bg-slate-950/15 text-slate-950' : 'bg-amber-500/20 text-amber-800 dark:text-amber-200'
                }`}
              >
                VI
              </span>
            </button>
          )}
        </div>

        <nav className="flex-1 px-2.5 py-2 space-y-0.5 overflow-y-auto">
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
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold shadow-2xs dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-400'
                      : 'border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'
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
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold shadow-2xs dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-400'
                      : 'border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'
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
                      ? 'border-sky-600 bg-sky-50 text-sky-700 font-semibold shadow-2xs dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-400'
                      : 'border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'
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
              src="./logo.gif"
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
        <div className="no-print fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
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
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                Optional Gemini API Key (For Direct In-App AI Grading)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No API key? Use the built-in <strong>Instant Offline Check</strong> or click{' '}
                <strong>Copy Prompt for Free ChatGPT / Gemini</strong> inside Proofs &amp; Policy Drills!
              </p>
              <input
                type="password"
                value={settings.geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono"
              />
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
                  <option value="gemini-4-argon">Gemini 4 Argon (Deeper Reasoning)</option>
                  <option value="gemini-4-carbon">Gemini 4 Carbon (Strict Verification)</option>
                </select>
              </div>
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

        {adminOpen && <AdminPanelModal open={adminOpen} onClose={() => setAdminOpen(false)} />}
      </Suspense>

      <UpdatesModal open={updatesOpen} onClose={() => setUpdatesOpen(false)} />
    </div>
  );
};

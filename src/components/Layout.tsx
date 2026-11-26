import React, { useState } from 'react';
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  FlaskConical,
  KeyRound,
  LayoutDashboard,
  Moon,
  Scale,
  Settings,
  Share2,
  Sun,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { GeminiModelId, PageRoute } from '../types';

interface LayoutProps {
  route: PageRoute;
  onNavigate: (route: PageRoute) => void;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{
  id: PageRoute;
  label: string;
  labelVi: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Dashboard', labelVi: 'Tổng quan', icon: LayoutDashboard },
  { id: 'labs', label: 'Practice Labs', labelVi: 'Phòng thực hành', icon: FlaskConical },
  { id: 'proofs', label: 'Proofs Trainer', labelVi: 'Luyện chứng minh', icon: Scale },
  { id: 'assignments', label: 'Assignments 1–4', labelVi: 'Bài tập 1–4', icon: FileText },
  { id: 'knowledge', label: 'Knowledge Base', labelVi: 'Kiến thức & Từ điển', icon: BookOpen },
  { id: 'exam', label: 'Mock Final Exam', labelVi: 'Thi thử cuối kỳ', icon: ClipboardCheck },
];

export const Layout: React.FC<LayoutProps> = ({ route, onNavigate, children }) => {
  const {
    settings,
    setLang,
    setTheme,
    setGeminiKey,
    setGeminiModel,
    exportProgressJson,
    importProgressJson,
    resetProgress,
  } = useApp();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedAppLink, setCopiedAppLink] = useState(false);

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
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
          <img
            src="./logo.gif"
            alt="MFC Exam Studio Logo"
            className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-indigo-500/30 shrink-0"
          />
          <div>
            <div className="font-bold text-sm tracking-tight">MFC Exam Studio</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Mathematics for Computing
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = route === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'
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

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLang(settings.lang === 'en' ? 'bilingual' : 'en')}
              className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Toggle English / Bilingual (EN+VI)"
            >
              {settings.lang === 'bilingual' ? '🌐 EN + VI' : '🌐 EN Only'}
            </button>
            <button
              onClick={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Toggle Light / Dark theme"
              aria-label="Toggle theme"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Settings & Gemini AI Key"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={copyBaseUrl}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copiedAppLink ? 'Link Copied!' : 'Share Study App URL'}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="./logo.gif"
            alt="MFC Exam Studio Logo"
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-indigo-500/30 shrink-0"
          />
          <span className="font-bold text-sm">MFC Exam Studio</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLang(settings.lang === 'en' ? 'bilingual' : 'en')}
            className="px-2 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700"
          >
            {settings.lang === 'bilingual' ? 'EN+VI' : 'EN'}
          </button>
          <button
            onClick={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700"
            aria-label="Toggle theme"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = route === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${
                active ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[56px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
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
                Optional Gemini API Key (For Free-Form Proof Grading)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stored ONLY in your own browser&apos;s localStorage. When you share the app with
                friends, each friend can optionally enter their own key — or use the built-in
                offline rubric grader with zero API key.
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
                  <option value="gemini-4-carbon">Gemini 4 Carbon (Strict Proof Verification)</option>
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
                    a.download = 'mfc-study-progress.json';
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
    </div>
  );
};

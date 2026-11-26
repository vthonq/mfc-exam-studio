import React, { useState } from 'react';
import { History, Sparkles, X } from 'lucide-react';
import { CHANGELOG_ENTRIES, LATEST_UPDATE_ID } from '../data/changelog';
import { useApp } from '../context/AppContext';

const SEEN_KEY = 'exam_studio_seen_update_v1';

interface UpdatesBannerProps {
  onOpenHistory: () => void;
}

export const UpdatesBanner: React.FC<UpdatesBannerProps> = ({ onOpenHistory }) => {
  const { settings } = useApp();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SEEN_KEY) === LATEST_UPDATE_ID;
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const latest = CHANGELOG_ENTRIES[0];
  if (!latest) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem(SEEN_KEY, LATEST_UPDATE_ID);
    } catch {
      // ignore storage errors
    }
    setDismissed(true);
  };

  return (
    <div className="no-print mb-5 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50 via-sky-50 to-white dark:from-indigo-950/40 dark:via-sky-950/30 dark:to-slate-900 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white">
              <Sparkles className="w-3 h-3" />
              NEW · {latest.version}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {settings.lang === 'bilingual' ? `${latest.title} — ${latest.titleVi}` : latest.title}
            </span>
          </div>
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 pl-4 list-disc">
            {latest.items.map((item, idx) => (
              <li key={idx}>
                {settings.lang === 'bilingual' ? item.vi : item.en}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenHistory}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 inline-flex items-center gap-1 cursor-pointer"
          >
            <History className="w-3 h-3" />
            All Updates
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-500 cursor-pointer"
            title="Dismiss update notice"
            aria-label="Dismiss update notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface UpdatesModalProps {
  open: boolean;
  onClose: () => void;
}

export const UpdatesModal: React.FC<UpdatesModalProps> = ({ open, onClose }) => {
  const { settings } = useApp();
  if (!open) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            What&apos;s New in Exam Studio Hub
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close Updates"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {CHANGELOG_ENTRIES.map((entry, idx) => (
            <div
              key={entry.id}
              className={`p-4 rounded-xl border space-y-2 ${
                idx === 0
                  ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      idx === 0
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {entry.version}
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {entry.title}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">{entry.date}</span>
              </div>
              {settings.lang === 'bilingual' && (
                <div className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  {entry.titleVi}
                </div>
              )}
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc pl-5">
                {entry.items.map((it, i) => (
                  <li key={i}>
                    <div>{it.en}</div>
                    {settings.lang === 'bilingual' && (
                      <div className="text-slate-500 dark:text-slate-400">{it.vi}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

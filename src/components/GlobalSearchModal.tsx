import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import type { EconPageRoute, PageRoute, ProbPageRoute, SubjectId } from '../types';
import { searchGlobalItems, type GlobalSearchItem } from '../utils/searchIndex';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  onNavigateMfc: (route: PageRoute, query?: string) => void;
  onNavigateEcon: (route: EconPageRoute, query?: string) => void;
  onNavigateProb: (route: ProbPageRoute, query?: string) => void;
  onNavigateGuide: () => void;
}

const BADGE_STYLE: Record<SubjectId | 'guide', { label: string; cls: string }> = {
  mfc: {
    label: 'MFC',
    cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
  },
  econ: {
    label: 'Econ',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  },
  probstat: {
    label: 'Prob & Stat',
    cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
  },
  guide: {
    label: 'Guide',
    cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-200',
  },
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  open,
  onClose,
  onNavigateMfc,
  onNavigateEcon,
  onNavigateProb,
  onNavigateGuide,
}) => {
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const results = useMemo(
    () => searchGlobalItems(query, subjectFilter, 18),
    [query, subjectFilter],
  );

  useEffect(() => {
    setActiveIdx(0);
  }, [query, subjectFilter]);

  if (!open) return null;

  const openItem = (item: GlobalSearchItem) => {
    if (item.subject === 'guide') {
      onNavigateGuide();
    } else if (item.subject === 'mfc') {
      onNavigateMfc(item.route as PageRoute, item.query);
    } else if (item.subject === 'econ') {
      onNavigateEcon(item.route as EconPageRoute, item.query);
    } else {
      onNavigateProb(item.route as ProbPageRoute, item.query);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (results.length > 0 ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (results.length > 0 ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter' && results[activeIdx]) {
      e.preventDefault();
      openItem(results[activeIdx]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-start justify-center p-4 pt-12 md:pt-20 no-print"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search formulas, terms, labs, proofs, SB tables (e.g. Warshall, MV=PY, Appendix D)..."
            className="flex-1 bg-transparent text-sm outline-none focus:!shadow-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'all', label: 'All Subjects' },
                { id: 'mfc', label: 'MFC' },
                { id: 'econ', label: 'Economics' },
                { id: 'probstat', label: 'Prob & Stat' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setSubjectFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                  subjectFilter === f.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            ↑↓ navigate · Enter open · Esc close
          </span>
        </div>

        <div className="max-h-[55vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No matching formulas, terms, labs, or tables found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map((item, idx) => {
              const badge = BADGE_STYLE[item.subject];
              const isActive = idx === activeIdx;
              return (
                <button
                  key={item.id}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => openItem(item)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 truncate">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

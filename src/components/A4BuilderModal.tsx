import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckSquare,
  FileText,
  Printer,
  Sparkles,
  Square,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  estimateA4Pages,
  getA4Catalog,
  getWeakTopicIds,
  type A4CardItem,
  type A4Density,
} from '../utils/a4SheetBuilder';
import type { SubjectId } from '../types';
import { MathFormula, RichMathText } from './Math';

interface A4BuilderModalProps {
  open: boolean;
  onClose: () => void;
  initialSubject: SubjectId;
}

const SUBJECT_TABS: Array<{ id: SubjectId; label: string; full: string }> = [
  { id: 'mfc', label: 'MFC', full: 'Mathematics for Computing' },
  { id: 'econ', label: 'Econ', full: 'Principles of Economics (ECO101)' },
  { id: 'probstat', label: 'ProbStat', full: 'Probability & Statistics' },
];

export const A4BuilderModal: React.FC<A4BuilderModalProps> = ({
  open,
  onClose,
  initialSubject,
}) => {
  const { settings, progress } = useApp();
  const bilingual = settings.lang === 'bilingual';

  const [subject, setSubject] = useState<SubjectId>(initialSubject);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [density, setDensity] = useState<A4Density>('compact');
  const [includeSummaries, setIncludeSummaries] = useState(true);
  const [includeTraps, setIncludeTraps] = useState(true);

  const catalog = useMemo(() => getA4Catalog(subject, bilingual), [subject, bilingual]);

  useEffect(() => {
    if (open) {
      setSubject(initialSubject);
    }
  }, [open, initialSubject]);

  // Default to weakest topics (or all if small) when switching subject or opening
  useEffect(() => {
    if (!open) return;
    const weakTopics = getWeakTopicIds(subject, progress);
    const matching = catalog.filter((item) => weakTopics.has(item.topicId));
    const initial = matching.length > 0 ? matching : catalog;
    setSelectedIds(new Set(initial.map((x) => x.id)));
  }, [open, subject, catalog, progress]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const selectedItems = catalog.filter((item) => selectedIds.has(item.id));
  const estPages = estimateA4Pages(selectedItems, density, includeSummaries, includeTraps);
  const withinBudget = estPages <= 2.0;

  const groupedCatalog = catalog.reduce<Array<{ label: string; items: A4CardItem[] }>>(
    (acc, item) => {
      const existing = acc.find((g) => g.label === item.topicLabel);
      if (existing) existing.items.push(item);
      else acc.push({ label: item.topicLabel, items: [item] });
      return acc;
    },
    [],
  );

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applyPreset = (mode: 'all' | 'weakest' | 'traps' | 'clear') => {
    if (mode === 'clear') {
      setSelectedIds(new Set());
      return;
    }
    if (mode === 'all') {
      setSelectedIds(new Set(catalog.map((c) => c.id)));
      return;
    }
    if (mode === 'weakest') {
      const weak = getWeakTopicIds(subject, progress);
      setSelectedIds(new Set(catalog.filter((c) => weak.has(c.topicId)).map((c) => c.id)));
      return;
    }
    setSelectedIds(new Set(catalog.filter((c) => Boolean(c.trap)).map((c) => c.id)));
  };

  const handlePrintA4 = () => {
    document.body.classList.add('a4-print-only');
    const cleanup = () => document.body.classList.remove('a4-print-only');
    window.addEventListener('afterprint', cleanup, { once: true });
    window.setTimeout(cleanup, 4000);
    window.print();
  };

  const activeSubjectMeta = SUBJECT_TABS.find((t) => t.id === subject) ?? SUBJECT_TABS[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 print:static print:block print:inset-auto print:bg-white print:p-0"
      onClick={onClose}
    >
      <div
        className="animate-fade-in studio-card rounded-3xl max-w-6xl w-full h-[90vh] shadow-2xl overflow-hidden flex flex-col print:static print:block print:h-auto print:max-w-none print:rounded-none print:shadow-none print:border-0 print:overflow-visible print:bg-white"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="2-Page A4 Cheat-Sheet Builder"
      >
        {/* Top Bar */}
        <div className="no-print px-5 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/12 text-amber-500 border border-amber-500/25 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                2-Page A4 Cheat-Sheet Builder
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {bilingual
                  ? 'Chọn lọc công thức & bẫy dễ sai rồi in thẳng ra 2 tờ A4'
                  : 'Cherry-pick key formulas & traps and print a clean 2-page A4 sheet'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08]">
              {SUBJECT_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSubject(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    subject === t.id
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Page Budget Pill */}
            <span
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold tabular-nums border ${
                estPages === 0
                  ? 'border-slate-200 dark:border-white/10 text-slate-400'
                  : withinBudget
                    ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-600 dark:text-emerald-300'
                    : 'border-amber-500/35 bg-amber-500/12 text-amber-600 dark:text-amber-300'
              }`}
            >
              ~{estPages.toFixed(1)} / 2.0 A4 pages
            </span>

            <button
              type="button"
              disabled={selectedItems.length === 0}
              onClick={handlePrintA4}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-45 text-white text-xs font-bold shadow-sm cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save A4 PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500 cursor-pointer"
              aria-label="Close A4 Cheat-Sheet Builder"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 min-h-0 grid lg:grid-cols-12 print:block print:h-auto print:overflow-visible">
          {/* Left Selector Panel */}
          <div className="no-print lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/[0.08] flex flex-col min-h-0 max-h-[38vh] lg:max-h-none">
            <div className="p-3.5 border-b border-slate-200/70 dark:border-white/[0.07] space-y-2.5 shrink-0 bg-slate-50/60 dark:bg-white/[0.02]">
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => applyPreset('weakest')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/12 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Weakest Topics
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('all')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] font-semibold cursor-pointer"
                >
                  Select All ({catalog.length})
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('traps')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] font-semibold cursor-pointer"
                >
                  Traps Only
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('clear')}
                  className="px-2.5 py-1 rounded-lg border border-rose-500/25 text-rose-500 hover:bg-rose-500/10 font-semibold cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="inline-flex p-0.5 rounded-lg bg-slate-200/70 dark:bg-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setDensity('compact')}
                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                      density === 'compact'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Compact 2-Col
                  </button>
                  <button
                    type="button"
                    onClick={() => setDensity('standard')}
                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                      density === 'standard'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Readable
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeSummaries}
                      onChange={(e) => setIncludeSummaries(e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                    Notes
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeTraps}
                      onChange={(e) => setIncludeTraps(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    Traps
                  </label>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
              {groupedCatalog.map((group) => (
                <div key={group.label} className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const checked = selectedIds.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={`w-full text-left px-2.5 py-2 rounded-xl border text-xs flex items-start gap-2 transition-colors cursor-pointer ${
                          checked
                            ? 'border-indigo-500/35 bg-indigo-500/8 text-slate-900 dark:text-white'
                            : 'border-slate-200/70 dark:border-white/[0.06] hover:bg-slate-100/70 dark:hover:bg-white/[0.03] text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {checked ? (
                          <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{item.title}</div>
                          {bilingual && item.titleVi !== item.title && (
                            <div className="text-[10px] opacity-75 truncate">{item.titleVi}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Right Live White-Paper A4 Preview */}
          <div className="lg:col-span-7 overflow-y-auto bg-slate-200/70 dark:bg-black/40 p-4 sm:p-5 print:p-0 print:bg-white print:overflow-visible">
            {selectedItems.length === 0 ? (
              <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 text-slate-500 dark:text-slate-400 space-y-2">
                <FileText className="w-8 h-8 opacity-40" />
                <div className="text-sm font-semibold">Select cards on the left to build your A4 sheet</div>
                <p className="text-xs max-w-sm">
                  Tip: Click <strong>Weakest Topics</strong> to auto-fill only the chapters you need most before the exam.
                </p>
              </div>
            ) : (
              <div
                id="a4-print-sheet"
                className={`bg-white text-slate-900 rounded-xl shadow-md border border-slate-300/80 p-5 print:border-0 print:shadow-none print:rounded-none print:p-0 space-y-3 ${
                  density === 'compact' ? 'text-[11px] leading-snug' : 'text-xs leading-relaxed'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2 pb-2 border-b border-slate-300">
                  <div>
                    <div className="font-display font-extrabold text-sm text-slate-900">
                      {activeSubjectMeta.full} — Exam Cheat Sheet
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {selectedItems.length} cards selected · ~{estPages.toFixed(1)} A4 page(s)
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 shrink-0">
                    Exam Studio Hub · vthonq
                  </div>
                </div>

                <div className="columns-1 sm:columns-2 gap-3 space-y-2.5">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="break-inside-avoid rounded-lg border border-slate-300 bg-slate-50/40 p-2.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-slate-900 leading-tight">{item.title}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 shrink-0">
                          {item.topicLabel}
                        </span>
                      </div>

                      {includeSummaries && item.summary && (
                        <p className="text-[10.5px] text-slate-700 leading-snug">{item.summary}</p>
                      )}

                      {item.formulas.length > 0 && (
                        <div className="space-y-1 rounded bg-white border border-slate-200 px-2 py-1 text-indigo-950">
                          {item.formulas.map((tex, idx) => (
                            <div key={idx} className="overflow-x-auto">
                              <MathFormula tex={tex} block />
                            </div>
                          ))}
                        </div>
                      )}

                      {includeTraps && item.trap && (
                        <div className="flex items-start gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-1 text-[10px] text-amber-950">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            <RichMathText text={item.trap} />
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

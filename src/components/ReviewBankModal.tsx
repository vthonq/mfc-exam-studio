import React, { useEffect, useMemo, useState } from 'react';
import { BookmarkCheck, CheckCircle2, Sparkles, Trash2, X, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildExplainQuestionPrompt, dispatchAskAi } from '../utils/askAiBridge';
import type { SubjectId } from '../types';
import { RichMathText } from './Math';

interface ReviewBankModalProps {
  open: boolean;
  onClose: () => void;
}

const SUBJ_META: Record<SubjectId, { label: string; cls: string }> = {
  mfc: {
    label: 'MFC',
    cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
  },
  econ: {
    label: 'Economics',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  },
  probstat: {
    label: 'Prob & Stat',
    cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
  },
};

export const ReviewBankModal: React.FC<ReviewBankModalProps> = ({ open, onClose }) => {
  const { progress, removeMistake, clearMistakes } = useApp();
  const [filter, setFilter] = useState<'all' | SubjectId>('all');
  const [retryPick, setRetryPick] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const visible = useMemo(
    () =>
      filter === 'all'
        ? progress.mistakes
        : progress.mistakes.filter((m) => m.subject === filter),
    [progress.mistakes, filter],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4 no-print"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-rose-500" />
              Mistakes &amp; Review Bank ({progress.mistakes.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Auto-saved missed exam/drill questions &amp; bookmarks — re-practice until mastered.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close Review Bank"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(
              [
                { id: 'all', label: `All (${progress.mistakes.length})` },
                {
                  id: 'mfc',
                  label: `MFC (${progress.mistakes.filter((m) => m.subject === 'mfc').length})`,
                },
                {
                  id: 'econ',
                  label: `Econ (${progress.mistakes.filter((m) => m.subject === 'econ').length})`,
                },
                {
                  id: 'probstat',
                  label: `Prob & Stat (${progress.mistakes.filter((m) => m.subject === 'probstat').length})`,
                },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                  filter === t.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {visible.length > 0 && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    filter === 'all'
                      ? 'Clear all saved mistakes and bookmarks?'
                      : `Clear saved items for ${filter.toUpperCase()}?`,
                  )
                ) {
                  clearMistakes(filter === 'all' ? undefined : filter);
                }
              }}
              className="px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear {filter === 'all' ? 'All' : SUBJ_META[filter].label}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {visible.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No saved mistakes in this filter yet. Missed Mock Exam or Econ Drill questions automatically appear here!
            </div>
          ) : (
            visible.map((item) => {
              const badge = SUBJ_META[item.subject];
              const pickedIdx = retryPick[item.id];
              const hasPicked = pickedIdx !== undefined;
              const isRevealed = Boolean(revealed[item.id]);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <span className="font-mono text-slate-500">{item.topicLabel}</span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {item.source === 'bookmark' ? 'Bookmarked' : 'Missed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const expectedAns =
                            item.expectedText ??
                            (item.choices && item.correctIndex !== undefined
                              ? item.choices[item.correctIndex]
                              : undefined);
                          onClose();
                          dispatchAskAi({
                            subject: item.subject,
                            prompt: buildExplainQuestionPrompt({
                              topicLabel: item.topicLabel,
                              question: item.question,
                              userAnswer: item.userAnswerText,
                              expectedAnswer: expectedAns,
                              explanation: item.explanation,
                            }),
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/70 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        title="Open My Gemini AI Tutor with this question pre-filled"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Explain with AI
                      </button>
                      <button
                        onClick={() => removeMistake(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Mastered
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <RichMathText text={item.question} />
                  </div>

                  {item.choices && item.correctIndex !== undefined ? (
                    <div className="grid sm:grid-cols-2 gap-1.5">
                      {item.choices.map((ch, idx) => {
                        const isCorr = idx === item.correctIndex;
                        const isChosen = pickedIdx === idx;
                        let cls =
                          'border-slate-200 dark:border-slate-700 hover:border-indigo-400';
                        if (hasPicked) {
                          if (isCorr) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
                          else if (isChosen) cls = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40';
                        }
                        return (
                          <button
                            key={idx}
                            onClick={() => setRetryPick((p) => ({ ...p, [item.id]: idx }))}
                            className={`p-2 rounded-lg border text-left text-xs flex items-center justify-between gap-2 cursor-pointer ${cls}`}
                          >
                            <span>
                              <strong>{String.fromCharCode(65 + idx)}.</strong>{' '}
                              <RichMathText text={ch} />
                            </span>
                            {hasPicked && isCorr && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            {hasPicked && isChosen && !isCorr && (
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {item.userAnswerText && (
                        <span className="text-rose-600 dark:text-rose-400 font-mono">
                          Your answer: {item.userAnswerText || '(blank)'}
                        </span>
                      )}
                      <button
                        onClick={() => setRevealed((p) => ({ ...p, [item.id]: !p[item.id] }))}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 font-semibold cursor-pointer"
                      >
                        {isRevealed ? 'Hide Solution' : 'Reveal Expected Answer & Explanation'}
                      </button>
                    </div>
                  )}

                  {(hasPicked || isRevealed) && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      {item.expectedText && (
                        <div className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                          Expected: {item.expectedText}
                        </div>
                      )}
                      <div className="text-slate-600 dark:text-slate-300">
                        <RichMathText text={item.explanation} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
